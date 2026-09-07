import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, aiSymptomCheck, rescheduleAppointment, rateDoctor, aiChatbot, aiMedicineInfo, aiDietNutrition, aiReportSummary, aiReportRagAnalyze, aiReportRagChat, aiFollowUp } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import { validateSchema, registerUserSchema, loginUserSchema, bookAppointmentSchema, rescheduleAppointmentSchema, rateDoctorSchema } from '../middlewares/validation.js';

const userRouter = express.Router();

userRouter.post("/register", validateSchema(registerUserSchema), registerUser)
userRouter.post("/login", validateSchema(loginUserSchema), loginUser)
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, validateSchema(bookAppointmentSchema), bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/ai/symptom-check", authUser, aiSymptomCheck)
userRouter.post("/ai/chatbot", authUser, aiChatbot)
userRouter.post("/ai/medicine-info", authUser, aiMedicineInfo)
userRouter.post("/ai/diet-nutrition", authUser, aiDietNutrition)
userRouter.post("/ai/report-summary", authUser, aiReportSummary)
userRouter.post("/ai/report-rag-analyze", upload.single('reportFile'), aiReportRagAnalyze)
userRouter.post("/ai/report-rag-chat", aiReportRagChat)
userRouter.post("/ai/follow-up", authUser, aiFollowUp)
userRouter.post("/reschedule-appointment", authUser, validateSchema(rescheduleAppointmentSchema), rescheduleAppointment)
userRouter.post("/rate-doctor", authUser, validateSchema(rateDoctorSchema), rateDoctor)

export default userRouter;
