import mongoose from "mongoose"

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    supplier: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    description: { type: String, default: "" },
    diseases: { type: [String], default: [] },
    genericName: { type: String, default: "" },
    sideEffects: { type: [String], default: [] },
    interactions: { type: [String], default: [] },
    alternatives: { type: [String], default: [] },
    date: { type: Number, required: true }
})

const medicineModel = mongoose.models.medicine || mongoose.model("medicine", medicineSchema)
export default medicineModel
