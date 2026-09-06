import mongoose from "mongoose"

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    requiresPrescription: { type: Boolean, default: false },
    dosageForm: { type: String, default: "Tablet" },
    packSize: { type: String, default: "Strip of 10" },
    manufacturer: { type: String, default: "HealthVerse Certified Pharma" },
    composition: { type: String, default: "" },
    rating: { type: Number, default: 4.8 },
    ratingCount: { type: Number, default: 120 },
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
