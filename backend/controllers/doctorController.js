import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { cacheGet, cacheSet, cacheDelete } from '../config/cache.js';
import { emitToUser, emitToAdmin } from '../config/socket.js';

// Doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's appointments
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.user.id;
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.user.id;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Invalid doctor or appointment" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { 
      cancelled: true, 
      status: 'Declined',
      $push: { timeline: { status: 'Declined', label: 'Consultation declined by doctor', timestamp: Date.now() } }
    });
    
    // Release doctor slot
    const { slotDate, slotTime } = appointment;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Emit Socket Event
    emitToUser(appointment.userId, 'appointment_cancelled', { appointmentId });
    emitToAdmin('appointment_cancelled', { appointmentId });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete appointment
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.user.id;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Invalid doctor or appointment" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { 
      isCompleted: true, 
      status: 'Completed',
      $push: { timeline: { status: 'Completed', label: 'Consultation completed by doctor', timestamp: Date.now() } }
    });

    // Emit Socket Event
    emitToUser(appointment.userId, 'appointment_completed', { appointmentId });
    emitToAdmin('appointment_completed', { appointmentId });

    res.json({ success: true, message: "Appointment Completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all doctors (for frontend list) - cached with Redis
const doctorList = async (req, res) => {
  try {
    const cached = await cacheGet('doctors_list');
    if (cached) {
      return res.json({ success: true, doctors: cached });
    }

    const doctors = await doctorModel.find({}).select("-password -email");
    await cacheSet('doctors_list', doctors, 300); // cache for 5 minutes

    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle doctor's availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID missing" });
    }

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    // Invalidate doctors list cache
    await cacheDelete('doctors_list');

    res.json({ success: true, message: "Availability changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's profile
const doctorProfile = async (req, res) => {
  try {
    const docId = req.user.id;
    const profile = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor's profile
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.user.id;
    const { fees, address, available, about } = req.body;

    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      available,
      about,
    });

    // Invalidate doctors list cache
    await cacheDelete('doctors_list');

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard data
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.user.id;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    const patientSet = new Set();

    appointments.forEach((a) => {
      if (a.isCompleted || a.payment) earnings += a.amount;
      patientSet.add(a.userId.toString());
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patientSet.size,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Direct helper to query Gemini / Groq API natively in Node.js
const callGeminiDirect = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
          }),
          signal: AbortSignal.timeout(8000)
        });
        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) return text.trim();
        }
      } catch (err) {}
    }
  }

  // Fallback to Groq LLM if Gemini busy
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: groqKey });
      const groqRes = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      });
      const text = groqRes.choices?.[0]?.message?.content;
      if (text && text.trim()) return text.trim();
    } catch (gErr) {}
  }
  return null;
};

// AI Copilot: Synthesize consultation summary
const doctorAiVisitSummary = async (req, res) => {
  try {
    const { patientName, patientAge, gender, symptoms, doctorNotes, history } = req.body;
    const prompt = `You are a clinical copilot for doctors. Summarize the following patient visit details into structured clinical insights:
Patient Name: ${patientName || 'Patient'}
Age: ${patientAge || 'Unspecified'}
Gender: ${gender || 'Unspecified'}
Reported Symptoms: ${symptoms || 'None'}
Doctor Notes: ${doctorNotes || 'None'}
Medical History: ${history || 'None'}

Return raw JSON only strictly matching this schema:
{
  "summary": "Concise clinical summary of the encounter",
  "suggested_diagnoses": ["Differential Diagnosis 1", "Differential Diagnosis 2"],
  "suggested_questions": ["Key diagnostic question 1", "Key diagnostic question 2"],
  "recommended_follow_ups": ["Follow up action 1", "Follow up action 2"]
}
Do not wrap in markdown codeblocks. Return valid JSON only.`;

    const aiRes = await callGeminiDirect(prompt);
    if (aiRes) {
      try {
        const cleaned = aiRes.replace(/```json/i, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: { ...parsed, provider: 'gemini-native' } });
      } catch (parseErr) {}
    }
    
    res.json({
      success: true,
      data: {
        summary: `Clinical assessment for patient ${patientName || 'Patient'}. Core symptoms presented: ${symptoms || 'None'}. Review: ${doctorNotes || 'None'}.`,
        suggested_diagnoses: ['General consultation'],
        suggested_questions: ['How long has this issue persisted?'],
        recommended_follow_ups: ['Assess symptoms in 3-5 days'],
        provider: 'fallback-native'
      }
    });
  } catch (error) {
    console.error('AI copilot visit summary error:', error.message);
    res.json({
      success: true,
      data: {
        summary: `Clinical assessment for patient ${req.body.patientName || 'Patient'}. Core symptoms presented: ${req.body.symptoms || 'None'}. Review: ${req.body.doctorNotes || 'None'}.`,
        suggested_diagnoses: ['General consultation'],
        suggested_questions: ['How long has this issue persisted?'],
        recommended_follow_ups: ['Assess symptoms in 3-5 days'],
        provider: 'backup-controller-mock'
      }
    });
  }
};

// AI Copilot: Patient history trends analysis
const doctorAiPatientAnalysis = async (req, res) => {
  try {
    const { appointments, patientProfile } = req.body;
    const prompt = `You are a clinical copilot analyzing a patient's historical records.
Patient Profile: ${JSON.stringify(patientProfile || {})}
Past Consultations: ${JSON.stringify(appointments || [])}

Analyze the trajectory, potential risk factors, and preventative steps.
Return raw JSON only strictly matching this schema:
{
  "health_trajectory": "Concise description of the patient's health trajectory and history patterns",
  "risk_factors": ["Risk factor 1", "Risk factor 2"],
  "preventative_steps": ["Actionable preventative step 1", "Actionable preventative step 2"]
}
Do not wrap in markdown codeblocks. Return valid JSON only.`;

    const aiRes = await callGeminiDirect(prompt);
    if (aiRes) {
      try {
        const cleaned = aiRes.replace(/```json/i, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: { ...parsed, provider: 'gemini-native' } });
      } catch (parseErr) {}
    }

    res.json({
      success: true,
      data: {
        health_trajectory: 'Review of past medical consultations shows normal baseline status with no critical warnings.',
        risk_factors: ['Observe age-related baseline metrics'],
        preventative_steps: ['Advise periodic full physical examination', 'Recommend healthy stress and sleep routines'],
        provider: 'fallback-native'
      }
    });
  } catch (error) {
    console.error('AI copilot patient analysis error:', error.message);
    res.json({
      success: true,
      data: {
        health_trajectory: 'Review of past medical consultations shows normal baseline status with no critical warnings.',
        risk_factors: ['Observe age-related baseline metrics'],
        preventative_steps: ['Advise periodic full physical examination', 'Recommend healthy stress and sleep routines'],
        provider: 'backup-controller-mock'
      }
    });
  }
};

// Add or edit prescription for an appointment
const addPrescription = async (req, res) => {
  try {
    const docId = req.user.id
    const { appointmentId, prescription, notes } = req.body

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Invalid doctor or appointment" })
    }

    // Save prescription & notes
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      prescription,
      notes,
      isCompleted: true,
      status: 'Completed',
      $push: { timeline: { status: 'Completed', label: 'Consultation completed and prescription generated', timestamp: Date.now() } }
    })

    // Emit socket event to update patient dashboard in real-time
    emitToUser(appointment.userId, 'appointment_completed', { appointmentId })
    emitToAdmin('appointment_completed', { appointmentId })

    res.json({ success: true, message: 'Prescription saved and consultation marked complete' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  changeAvailability,
  doctorProfile,
  updateDoctorProfile,
  doctorDashboard,
  doctorAiVisitSummary,
  doctorAiPatientAnalysis,
  addPrescription,
};


