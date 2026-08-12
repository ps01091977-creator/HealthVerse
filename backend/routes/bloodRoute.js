import express from 'express'
import { registerDonor, createBloodRequest, listDonors, listRequests, updateRequestStatus } from '../controllers/bloodController.js'
import authAdmin from '../middlewares/authAdmin.js'
import authUser from '../middlewares/authUser.js'

const bloodRouter = express.Router()

// Admin operations
bloodRouter.post('/update-request-status', authAdmin, updateRequestStatus)
bloodRouter.get('/admin-requests', authAdmin, listRequests)

// Donor & Patient operations
bloodRouter.post('/register', authUser, registerDonor)
bloodRouter.post('/request', authUser, createBloodRequest)
bloodRouter.get('/list-donors', listDonors)
bloodRouter.get('/list-requests', listRequests)

export default bloodRouter
