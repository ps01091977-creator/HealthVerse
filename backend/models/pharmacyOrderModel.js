import mongoose from "mongoose"

const pharmacyOrderSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    appointmentId: { type: String, default: "" }, // If linked to doctor prescription
    items: [{
        medicineId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: 'Pending' }, // Pending, Paid
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    orderStatus: { type: String, default: 'Pending' }, // Pending, Dispatched, Delivered
    date: { type: Number, required: true }
})

const pharmacyOrderModel = mongoose.models.pharmacyOrder || mongoose.model("pharmacyOrder", pharmacyOrderSchema)
export default pharmacyOrderModel
