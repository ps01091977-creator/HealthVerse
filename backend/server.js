import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import { initSocket } from './config/socket.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import pharmacyRouter from './routes/pharmacyRoute.js'
import bloodRouter from './routes/bloodRoute.js'
import emergencyRouter from './routes/emergencyRoute.js'
import aiRouter from './ai/routes/aiRoute.js'
import { initQdrant } from './ai/services/qdrantService.js'

// app config
const app = express()
const port = process.env.PORT || 8080

// Create HTTP server
const server = createServer(app)

// Connect to socket.io
initSocket(server)

// Connect to databases and AI vector services
connectDB()
connectCloudinary()
initQdrant().catch(err => console.warn('Qdrant init warning:', err.message))

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images (Cloudinary)
}))

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// standard middlewares
app.use(express.json())
app.use(cors())

import { handleSTT } from './ai/controllers/aiChatController.js'
import upload from './middlewares/multer.js'

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use("/api/user", userRouter)
app.use("/api/pharmacy", pharmacyRouter)
app.use("/api/blood", bloodRouter)
app.use("/api/emergency", emergencyRouter)
app.use("/api/ai", aiRouter)
app.post("/api/transcribe", upload.single('audio'), handleSTT)




app.get("/", (req, res) => {
  res.send("API Working")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// Listen on HTTP server
server.listen(port, () => console.log(`🚀 Server started on PORT:${port}`))
// Backend live with Groq Whisper STT & AI clinical engine

