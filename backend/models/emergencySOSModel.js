import mongoose from "mongoose"

const emergencySOSSchema = new mongoose.Schema({
    userId: { type: String, default: null },
    patientName: { type: String, default: "Emergency Guest" },
    phone: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: "Awaiting GPS confirmation" },
    status: { type: String, default: 'Triggered' }, // Triggered, Responding, Completed, Cancelled
    ambulanceId: { type: String, default: "" },
    date: { type: Number, required: true }
})

const emergencySOSModel = mongoose.models.emergencySOS || mongoose.model("emergencySOS", emergencySOSSchema)
export default emergencySOSModel
