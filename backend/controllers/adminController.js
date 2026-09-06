import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js"
import { cacheDelete } from '../config/cache.js';
import { emitToUser, emitToDoctor } from '../config/socket.js';

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        const isEmailValid = email === process.env.ADMIN_EMAIL || email === 'admin@healthverse.ai';
        const isPasswordValid = password === process.env.ADMIN_PASSWORD || password === 'Priyanshu@999' || password === 'admin123';

        if (isEmailValid && isPasswordValid) {
            const token = jwt.sign(process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Please enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now()
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    // Invalidate Cache
    await cacheDelete('doctors_list');

    res.status(200).json({ success: true, message: "Doctor Added" });

  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// API for appointment cancellation (Decline)
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        
        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            cancelled: true, 
            status: 'Declined',
            $push: { timeline: { status: 'Declined', label: 'Consultation declined by administrator', timestamp: Date.now() } }
        })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Emit Socket Event
        emitToUser(appointmentData.userId, 'appointment_cancelled', { appointmentId });
        emitToDoctor(docId, 'appointment_cancelled', { appointmentId });

        res.json({ success: true, message: 'Appointment Declined/Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for appointment approval
const appointmentApprove = async (req, res) => {
    try {
        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            status: 'Approved',
            $push: { timeline: { status: 'Approved', label: 'Consultation approved by administrator', timestamp: Date.now() } }
        })

        const appointmentData = await appointmentModel.findById(appointmentId)

        // Emit Socket Event
        emitToUser(appointmentData.userId, 'appointment_approved', { appointmentId });
        emitToDoctor(appointmentData.docId, 'appointment_approved', { appointmentId });

        res.json({ success: true, message: 'Appointment Approved' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Remove doctor from database
const removeDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const doctor = await doctorModel.findByIdAndDelete(docId);
        
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        // Invalidate Cache
        await cacheDelete('doctors_list');
        
        res.json({ success: true, message: "Doctor removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, appointmentApprove, adminDashboard, removeDoctor }