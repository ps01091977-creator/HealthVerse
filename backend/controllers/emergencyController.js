import emergencySOSModel from "../models/emergencySOSModel.js"
import { emitToAdmin, emitToUser } from "../config/socket.js"

// Trigger SOS
const triggerSOS = async (req, res) => {
    try {
        const { userId, patientName, phone, latitude, longitude, address } = req.body
        const newSOS = new emergencySOSModel({
            userId: userId || null,
            patientName: patientName || "Emergency Guest",
            phone,
            latitude: Number(latitude),
            longitude: Number(longitude),
            address: address || "Locating...",
            status: 'Triggered',
            date: Date.now()
        })
        await newSOS.save()

        // Socket notify admin panel immediately
        emitToAdmin('sos_triggered', {
            sosId: newSOS._id,
            patientName: newSOS.patientName,
            phone: newSOS.phone,
            latitude: newSOS.latitude,
            longitude: newSOS.longitude,
            address: newSOS.address
        })

        res.json({ success: true, message: "SOS signal broadcasted successfully!", sosId: newSOS._id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// List all active SOS cases (Admin Response tab)
const listSOSEmergencies = async (req, res) => {
    try {
        const emergencies = await emergencySOSModel.find({}).sort({ date: -1 })
        res.json({ success: true, emergencies })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Dispatch Responder Ambulance
const dispatchAmbulance = async (req, res) => {
    try {
        const { sosId, ambulanceId } = req.body
        const sos = await emergencySOSModel.findByIdAndUpdate(sosId, {
            status: 'Responding',
            ambulanceId
        }, { new: true })

        if (!sos) {
            return res.status(404).json({ success: false, message: "SOS record not found" })
        }

        // Notify client user if logged in
        if (sos.userId) {
            emitToUser(sos.userId, 'sos_dispatched', {
                sosId: sos._id,
                status: 'Responding',
                ambulanceId,
                eta: "12 mins"
            })
        }
        
        // Notify admin panel
        emitToAdmin('sos_dispatched', { sosId: sos._id, status: 'Responding', ambulanceId })

        res.json({ success: true, message: `Ambulance responder ${ambulanceId} dispatched successfully!` })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export { triggerSOS, listSOSEmergencies, dispatchAmbulance }
