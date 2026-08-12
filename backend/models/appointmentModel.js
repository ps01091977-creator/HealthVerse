import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    status: { type: String, default: 'Pending' }, // Pending, Approved, Declined
    videoLink: { type: String, default: '' },
    rescheduledCount: { type: Number, default: 0 },
    rescheduleHistory: { type: Array, default: [] },
    rating: { type: Number, default: 0 },
    review: { type: String, default: '' },
    timeline: { type: Array, default: [] },
    prescription: { type: Array, default: [] },
    notes: { type: String, default: '' }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel