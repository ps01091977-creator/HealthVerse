import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from 'cloudinary'  
import razorpay from 'razorpay';
import axios from 'axios';
import { emitToDoctor, emitToAdmin } from '../config/socket.js';

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        newAppointment.videoLink = `https://meet.jit.si/healthverse-appt-${newAppointment._id}`
        newAppointment.timeline = [
            { status: 'Pending', label: 'Appointment requested', timestamp: Date.now() }
        ]
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Emit Socket Event
        emitToDoctor(docId, 'appointment_booked', { appointmentId: newAppointment._id, patientName: userData.name });
        emitToAdmin('appointment_booked', { appointmentId: newAppointment._id });

        res.json({ success: true, message: 'Appointment request sent' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            cancelled: true,
            status: 'Cancelled',
            $push: { timeline: { status: 'Cancelled', label: 'Appointment cancelled by patient', timestamp: Date.now() } }
        })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Emit Socket Event
        emitToDoctor(docId, 'appointment_cancelled', { appointmentId });
        emitToAdmin('appointment_cancelled', { appointmentId });

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { 
                payment: true,
                $push: { timeline: { status: 'Paid', label: 'Payment processed successfully', timestamp: Date.now() } }
            })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Direct helper to query Gemini API using user key
const callGeminiDirect = async (prompt) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };
        const response = await axios.post(url, payload);
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || null;
    } catch (err) {
        console.error('Direct Gemini call failed:', err.message);
        return null;
    }
}

// API proxy to AI symptom check service
const aiSymptomCheck = async (req, res) => {
    try {
        const { symptoms, patient_info } = req.body;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        
        const response = await axios.post(`${aiServiceUrl}/api/ai/symptom-check`, {
            symptoms,
            patient_info
        });
        
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AI symptom-check error:', error.message);
        
        // Try direct Gemini call fallback
        const prompt = `You are a clinical assistant. Analyze these symptoms: "${req.body.symptoms}". Patient Info: "${req.body.patient_info || 'None'}".
        Return raw JSON only, strictly matching this schema:
        {
          "analysis": "A detailed clinical analysis of symptoms.",
          "specialties": ["Specialty1", "Specialty2"],
          "urgency": "Low" | "Medium" | "High" | "Critical",
          "suggestions": ["suggestion1", "suggestion2"]
        }
        Do not wrap in markdown tags or backticks. Return valid JSON only.`;

        const geminiText = await callGeminiDirect(prompt);
        if (geminiText) {
            try {
                const cleaned = geminiText.replace(/```json/i, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return res.json({
                    success: true,
                    data: {
                        analysis: parsed.analysis,
                        specialties: parsed.specialties,
                        urgency: parsed.urgency,
                        suggestions: parsed.suggestions,
                        provider: "gemini-direct"
                    }
                });
            } catch (jsonErr) {
                console.error('Failed to parse Gemini response JSON:', jsonErr.message);
            }
        }

        // Serve smart local backup mock directly in controller if AI service connection fails
        const symptomsLower = (req.body.symptoms || "").toLowerCase();
        let specialties = ["General physician"];
        let urgency = "Low";
        let suggestions = ["Ensure adequate hydration and rest.", "Monitor temperature and note any new symptoms."];
        let analysis = `Based on the symptoms described, there are mild indications of general discomfort. This does not appear to be an emergency.`;

        if (symptomsLower.includes("chest") || symptomsLower.includes("heart") || symptomsLower.includes("stroke")) {
            specialties = ["Cardiologist", "General physician"];
            urgency = "High";
            suggestions = ["Avoid heavy physical exertion.", "Consult a doctor immediately if pain radiates to the arm or jaw."];
            analysis = "Possible cardiovascular concern. Chest pain or related symptoms require prompt professional evaluation.";
        } else if (symptomsLower.includes("skin") || symptomsLower.includes("rash") || symptomsLower.includes("itch")) {
            specialties = ["Dermatologist"];
            urgency = "Low";
            suggestions = ["Avoid scratching.", "Keep the area dry and clean."];
            analysis = "A localized dermatological issue is suggested. Standard dermatological evaluation is recommended.";
        }

        res.json({
            success: true,
            data: {
                analysis,
                specialties,
                urgency,
                suggestions,
                provider: "backup-controller-mock"
            }
        });
    }
}

// API proxy to AI chatbot
const aiChatbot = async (req, res) => {
    try {
        const { message, chat_history } = req.body;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${aiServiceUrl}/api/ai/chatbot`, { message, chat_history });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AI chatbot proxy error:', error.message);
        
        // Try direct Gemini call fallback
        const prompt = `You are a medical assistant chat companion. User says: "${req.body.message}". Previous History: "${JSON.stringify(req.body.chat_history || [])}".
        Return a helpful, clinical reply. Keep it concise.
        Return raw JSON only, matching this schema:
        {
          "reply": "Your message reply."
        }
        Do not wrap in markdown. Return valid JSON only.`;

        const geminiText = await callGeminiDirect(prompt);
        if (geminiText) {
            try {
                const cleaned = geminiText.replace(/```json/i, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return res.json({
                    success: true,
                    data: {
                        reply: parsed.reply,
                        provider: "gemini-direct"
                    }
                });
            } catch (jsonErr) {
                console.error('Failed to parse Gemini reply:', jsonErr.message);
            }
        }

        // Smart, dynamic local keyword fallback mapping for professional clinical helper
        const userMsg = (req.body.message || "").toLowerCase();
        let fallbackReply = "I am here as your HealthVerse clinical assistant to guide you. While I can help you identify the right medical specialties for your symptoms (e.g., Dermatologist, Ophthalmologist, General Physician) and explain general wellness tips, please consult a certified doctor for formal diagnosis and treatment. For critical emergencies, please call emergency services immediately.";

        if (userMsg.includes("hello") || userMsg.includes("hi") || userMsg.includes("hey") || userMsg.includes("greeting")) {
            fallbackReply = "Hello! I am your HealthVerse clinical assistant. How can I help you today? You can ask me about common medical symptoms, doctor specialties, or guidance on booking appointments.";
        } else if (userMsg.includes("eye") || userMsg.includes("vision") || userMsg.includes("see") || userMsg.includes("blind") || userMsg.includes("ophthalmolog")) {
            fallbackReply = "For eye-related issues (such as blurry vision, eye pain, redness, or checkups), it is best to consult an **Ophthalmologist**. You can filter by 'Ophthalmologist' in our 'Find Doctors' page to schedule an appointment with one of our eye care specialists.";
        } else if (userMsg.includes("skin") || userMsg.includes("rash") || userMsg.includes("itch") || userMsg.includes("acne") || userMsg.includes("allergy") || userMsg.includes("dermatolog")) {
            fallbackReply = "For skin concerns, rashes, itching, acne, or allergies, we recommend booking a consultation with a **Dermatologist**. You can easily find and book appointments with leading dermatologists on our platform.";
        } else if (userMsg.includes("heart") || userMsg.includes("chest") || userMsg.includes("cardio") || userMsg.includes("stroke")) {
            fallbackReply = "If you are experiencing chest pain, tightness, or heart palpitations, please consult a **Cardiologist** immediately. *Note: If this is a medical emergency (e.g. signs of a heart attack), please call your local emergency services (like 102 or 911) right away.*";
        } else if (userMsg.includes("cold") || userMsg.includes("cough") || userMsg.includes("fever") || userMsg.includes("flu") || userMsg.includes("headache") || userMsg.includes("body ache")) {
            fallbackReply = "For symptoms like fever, cold, cough, flu, or mild headaches, you should consult a **General Physician**. They can evaluate your symptoms, prescribe necessary medicines, and advise if you need specialized care.";
        } else if (userMsg.includes("stomach") || userMsg.includes("digest") || userMsg.includes("belly") || userMsg.includes("gastro") || userMsg.includes("acid") || userMsg.includes("diarrhea")) {
            fallbackReply = "Stomach aches, indigestion, acid reflux, or other digestive issues are best evaluated by a **Gastroenterologist** or a General Physician. We suggest avoiding heavy or spicy foods and staying hydrated.";
        } else if (userMsg.includes("child") || userMsg.includes("kid") || userMsg.includes("baby") || userMsg.includes("pediatric")) {
            fallbackReply = "For children's health issues, growth checks, immunizations, or pediatric concerns, you should consult a **Pediatrician** on our platform.";
        } else if (userMsg.includes("teeth") || userMsg.includes("tooth") || userMsg.includes("gum") || userMsg.includes("dentist") || userMsg.includes("cavity")) {
            fallbackReply = "For toothaches, cavities, dental hygiene, or gum issues, please book an appointment with a **Dentist**.";
        } else if (userMsg.includes("book") || userMsg.includes("appointment") || userMsg.includes("schedule") || userMsg.includes("fees")) {
            fallbackReply = "To book an appointment: 1. Go to the 'Find Doctors' page, 2. Filter by specialty or choose a doctor from the list, 3. Select a suitable date and time slot, and 4. Confirm the booking and choose your payment method.";
        }

        res.json({
            success: true,
            data: {
                reply: fallbackReply,
                provider: "backup-controller-mock"
            }
        });
    }
}

// API proxy to AI medicine-info
const aiMedicineInfo = async (req, res) => {
    try {
        const { medicine_name } = req.body;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${aiServiceUrl}/api/ai/medicine-info`, { medicine_name });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AI medicine-info proxy error:', error.message);

        // Try direct Gemini call fallback
        const prompt = `Provide clinical details for drug/medicine: "${req.body.medicine_name}".
        Return raw JSON only, matching this schema:
        {
          "description": "Short description of mechanism and uses.",
          "side_effects": ["side effect 1", "side effect 2"],
          "interactions": ["interaction 1", "interaction 2"],
          "typical_dosage": "dosage instructions"
        }
        Do not wrap in markdown. Return valid JSON only.`;

        const geminiText = await callGeminiDirect(prompt);
        if (geminiText) {
            try {
                const cleaned = geminiText.replace(/```json/i, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return res.json({
                    success: true,
                    data: {
                        description: parsed.description,
                        side_effects: parsed.side_effects,
                        interactions: parsed.interactions,
                        typical_dosage: parsed.typical_dosage,
                        provider: "gemini-direct"
                    }
                });
            } catch (jsonErr) {
                console.error('Failed to parse Gemini medicine info:', jsonErr.message);
            }
        }

        res.json({
            success: true,
            data: {
                description: `Information summary for ${req.body.medicine_name}. Standard pharmaceutical details indicate use as target medication.`,
                side_effects: ["Nausea", "Headache", "Dizziness"],
                interactions: ["Consult doctor if taking anticoagulants or heavy anti-inflammatory medications."],
                typical_dosage: "Take as directed by doctor (typically 1 tablet daily).",
                provider: "backup-controller-mock"
            }
        });
    }
}

// API proxy to AI diet-nutrition
const aiDietNutrition = async (req, res) => {
    try {
        const { health_conditions, goals } = req.body;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${aiServiceUrl}/api/ai/diet-nutrition`, { health_conditions, goals });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AI diet-nutrition proxy error:', error.message);

        // Try direct Gemini call fallback
        const prompt = `Provide nutritional guidelines for conditions: "${JSON.stringify(req.body.health_conditions || [])}" and goals: "${req.body.goals || 'None'}".
        Return raw JSON only, matching this schema:
        {
          "recommended_foods": ["food 1", "food 2"],
          "avoid_foods": ["food 1", "food 2"],
          "meal_plan_suggestion": "short meal suggestion text",
          "nutrition_tips": ["tip 1", "tip 2"]
        }
        Do not wrap in markdown. Return valid JSON only.`;

        const geminiText = await callGeminiDirect(prompt);
        if (geminiText) {
            try {
                const cleaned = geminiText.replace(/```json/i, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return res.json({
                    success: true,
                    data: {
                        recommended_foods: parsed.recommended_foods,
                        avoid_foods: parsed.avoid_foods,
                        meal_plan_suggestion: parsed.meal_plan_suggestion,
                        nutrition_tips: parsed.nutrition_tips,
                        provider: "gemini-direct"
                    }
                });
            } catch (jsonErr) {
                console.error('Failed to parse Gemini diet info:', jsonErr.message);
            }
        }

        res.json({
            success: true,
            data: {
                recommended_foods: ["Leafy greens", "Lean poultry", "Whole grains", "Hydration liquids"],
                avoid_foods: ["Refined sugars", "Excess sodium", "Processed food products"],
                meal_plan_suggestion: "Bland oats for breakfast; grilled chicken salad for lunch; steamed fish with rice for dinner.",
                nutrition_tips: ["Eat at consistent times.", "Observe balanced caloric intake scales."],
                provider: "backup-controller-mock"
            }
        });
    }
}


// API proxy to AI report-summary
const aiReportSummary = async (req, res) => {
    try {
        const { report_text } = req.body;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${aiServiceUrl}/api/ai/report-summary`, { report_text });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AI report-summary proxy error:', error.message);
        
        // Try direct Gemini call fallback
        const prompt = `You are a clinical assistant. Analyze this lab report text: "${req.body.report_text}".
        Return raw JSON only, strictly matching this schema:
        {
          "summary": "Detailed overall clinical summary of the lab report.",
          "key_findings": ["Finding 1", "Finding 2"],
          "abnormal_values": ["Abnormal value/marker 1", "Abnormal value/marker 2"],
          "recommended_questions": ["Question 1", "Question 2"]
        }
        Do not wrap in markdown. Return valid JSON only.`;

        const geminiText = await callGeminiDirect(prompt);
        if (geminiText) {
            try {
                const cleaned = geminiText.replace(/```json/i, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return res.json({
                    success: true,
                    data: {
                        summary: parsed.summary,
                        key_findings: parsed.key_findings,
                        abnormal_values: parsed.abnormal_values,
                        recommended_questions: parsed.recommended_questions,
                        provider: "gemini-direct"
                    }
                });
            } catch (jsonErr) {
                console.error('Failed to parse Gemini report summary:', jsonErr.message);
            }
        }

        res.json({
            success: true,
            data: {
                summary: "Lab metrics check. General parameters appear normal. Mild markers present.",
                key_findings: ["Blood profile normal", "Electrolytes balanced"],
                abnormal_values: ["Vitamins level slightly low"],
                recommended_questions: ["Should I take vitamins supplements?", "When is the next lab run recommended?"],
                provider: "backup-controller-mock"
            }
        });
    }
}

// API proxy to AI follow-up
const aiFollowUp = async (req, res) => {
    try {
        const { diagnosis, treatment } = req.body;
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${aiServiceUrl}/api/ai/follow-up`, { diagnosis, treatment });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AI follow-up proxy error:', error.message);

        // Try direct Gemini call fallback
        const prompt = `Provide clinical follow-up guidelines for diagnosis: "${req.body.diagnosis}" and treatment: "${req.body.treatment}".
        Return raw JSON only, strictly matching this schema:
        {
          "follow_up_weeks": 4,
          "warnings_to_watch": ["Warning 1", "Warning 2"],
          "suggestions": ["Suggestion 1", "Suggestion 2"]
        }
        Do not wrap in markdown. Return valid JSON only.`;

        const geminiText = await callGeminiDirect(prompt);
        if (geminiText) {
            try {
                const cleaned = geminiText.replace(/```json/i, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return res.json({
                    success: true,
                    data: {
                        follow_up_weeks: Number(parsed.follow_up_weeks) || 4,
                        warnings_to_watch: parsed.warnings_to_watch,
                        suggestions: parsed.suggestions,
                        provider: "gemini-direct"
                    }
                });
            } catch (jsonErr) {
                console.error('Failed to parse Gemini follow-up:', jsonErr.message);
            }
        }

        res.json({
            success: true,
            data: {
                follow_up_weeks: 4,
                warnings_to_watch: ["Dizziness", "Persistent elevated temperature", "Difficulty breathing"],
                suggestions: ["Observe rest guidelines.", "Schedule doctor visit if symptoms recur."],
                provider: "backup-controller-mock"
            }
        });
    }
}

// API to reschedule appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { userId, appointmentId, newSlotDate, newSlotTime } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        if (appointmentData.cancelled || appointmentData.isCompleted) {
            return res.json({ success: false, message: 'Cannot reschedule cancelled or completed appointments' })
        }

        const { docId, slotDate: oldSlotDate, slotTime: oldSlotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        if (!doctorData.available) {
            return res.json({ success: false, message: 'Doctor is not currently available' })
        }

        let slots_booked = doctorData.slots_booked || {}

        // Check if the new slot is already booked
        if (slots_booked[newSlotDate] && slots_booked[newSlotDate].includes(newSlotTime)) {
            return res.json({ success: false, message: 'Requested slot is not available' })
        }

        // Release old slot
        if (slots_booked[oldSlotDate]) {
            slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(t => t !== oldSlotTime)
        }

        // Book new slot
        if (!slots_booked[newSlotDate]) {
            slots_booked[newSlotDate] = []
        }
        slots_booked[newSlotDate].push(newSlotTime)

        // Update Doctor
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Update Appointment
        const historyEntry = {
            oldSlotDate,
            oldSlotTime,
            newSlotDate,
            newSlotTime,
            date: Date.now()
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            slotDate: newSlotDate,
            slotTime: newSlotTime,
            $inc: { rescheduledCount: 1 },
            $push: {
                rescheduleHistory: historyEntry,
                timeline: {
                    status: 'Rescheduled',
                    label: `Rescheduled to ${newSlotDate} at ${newSlotTime}`,
                    timestamp: Date.now()
                }
            }
        })

        // Emit Socket Event
        emitToDoctor(docId, 'appointment_rescheduled', { appointmentId, newSlotDate, newSlotTime })
        emitToAdmin('appointment_rescheduled', { appointmentId })

        res.json({ success: true, message: 'Appointment rescheduled successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to rate doctor
const rateDoctor = async (req, res) => {
    try {
        const { userId, appointmentId, rating, review } = req.body

        if (!rating || rating < 1 || rating > 5) {
            return res.json({ success: false, message: 'Rating must be between 1 and 5 stars' })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        if (!appointmentData.isCompleted) {
            return res.json({ success: false, message: 'Only completed appointments can be rated' })
        }

        // Update appointment rating
        await appointmentModel.findByIdAndUpdate(appointmentId, { rating, review })

        // Update doctor ratings average
        const doctorData = await doctorModel.findById(appointmentData.docId)
        const ratings = doctorData.ratings || []
        ratings.push({ userId, rating, review, date: Date.now() })

        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = parseFloat((totalRating / ratings.length).toFixed(1))
        const ratingCount = ratings.length

        await doctorModel.findByIdAndUpdate(appointmentData.docId, {
            ratings,
            averageRating,
            ratingCount
        })

        res.json({ success: true, message: 'Thank you for your rating!' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, aiSymptomCheck, rescheduleAppointment, rateDoctor, aiChatbot, aiMedicineInfo, aiDietNutrition, aiReportSummary, aiFollowUp}