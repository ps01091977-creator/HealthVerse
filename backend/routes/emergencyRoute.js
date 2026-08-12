import express from 'express'
import { triggerSOS, listSOSEmergencies, dispatchAmbulance } from '../controllers/emergencyController.js'
import authAdmin from '../middlewares/authAdmin.js'

const emergencyRouter = express.Router()

emergencyRouter.post('/sos', triggerSOS) // Allow public triggers for guest patients as well
emergencyRouter.get('/admin-list', authAdmin, listSOSEmergencies)
emergencyRouter.post('/dispatch', authAdmin, dispatchAmbulance)

export default emergencyRouter
