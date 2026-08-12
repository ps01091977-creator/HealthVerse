import mongoose from "mongoose"

const bloodRequestSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true },
    hospital: { type: String, required: true },
    phone: { type: String, required: true },
    urgency: { type: String, default: 'Urgent' }, // Critical, Urgent, Standard
    status: { type: String, default: 'Pending' }, // Pending, Approved, Fulfilled, Rejected
    address: { type: String, required: true },
    latitude: { type: Number, default: 12.9716 },
    longitude: { type: Number, default: 77.5946 },
    date: { type: Number, required: true }
})

const bloodRequestModel = mongoose.models.bloodRequest || mongoose.model("bloodRequest", bloodRequestSchema)
export default bloodRequestModel
