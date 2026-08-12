import express from 'express'
import { addMedicine, listMedicines, updateMedicineStock, createPharmacyOrder, listPharmacyOrders, updateOrderStatus } from '../controllers/pharmacyController.js'
import authAdmin from '../middlewares/authAdmin.js'
import authUser from '../middlewares/authUser.js'

const pharmacyRouter = express.Router()

// Admin inventory controls
pharmacyRouter.post('/add-medicine', authAdmin, addMedicine)
pharmacyRouter.post('/update-stock', authAdmin, updateMedicineStock)
pharmacyRouter.get('/admin-orders', authAdmin, listPharmacyOrders)
pharmacyRouter.post('/update-order-status', authAdmin, updateOrderStatus)

// Patient/Doctor catalog operations
pharmacyRouter.get('/list', listMedicines)
pharmacyRouter.post('/order', authUser, createPharmacyOrder)

export default pharmacyRouter
