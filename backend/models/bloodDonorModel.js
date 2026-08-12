import mongoose from "mongoose"

const bloodDonorSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, default: 12.9716 }, // Default Bangalore coord placeholder
    longitude: { type: Number, default: 77.5946 },
    isAvailable: { type: Boolean, default: true },
    lastDonationDate: { type: Number, default: 0 },
    date: { type: Number, required: true }
})

const bloodDonorModel = mongoose.models.bloodDonor || mongoose.model("bloodDonor", bloodDonorSchema)
export default bloodDonorModel
