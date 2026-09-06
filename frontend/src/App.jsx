import React, { useEffect, useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import io from 'socket.io-client'
import { toast } from 'react-toastify'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointment from './pages/MyAppointment'
import Appointment from './Appointment'
import AiHub from './pages/AiHub'
import PharmacyShop from './pages/PharmacyShop'
import BloodDonation from './pages/BloodDonation'
import EmergencySOS from './pages/EmergencySOS'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SymptomChecker from './components/SymptomChecker'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AppContext } from './context/AppContext'

const App = () => {
  const theme = useSelector((state) => state.ui.theme)
  const queryClient = useQueryClient()
  const { token, userData } = useContext(AppContext)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Real-time WebSocket connection
  useEffect(() => {
    if (token && userData && userData._id) {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || 'https://healthverse-2.onrender.com'
      const socket = io(socketUrl)

      socket.emit('join_user', userData._id)

      socket.on('appointment_approved', (data) => {
        toast.success('🎉 Your appointment slot has been approved!', {
          position: "top-right",
          autoClose: 5000,
        })
        queryClient.invalidateQueries(['appointments'])
      })

      socket.on('appointment_cancelled', (data) => {
        toast.error('⚠️ An appointment was cancelled.', {
          position: "top-right",
          autoClose: 5000,
        })
        queryClient.invalidateQueries(['appointments'])
      })

      socket.on('appointment_completed', (data) => {
        toast.success('🩺 Appointment marked as completed. Thank you!', {
          position: "top-right",
          autoClose: 5000,
        })
        queryClient.invalidateQueries(['appointments'])
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [token, userData, queryClient])

  return (
    <div className='w-full min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300 relative flex flex-col'>
      <ToastContainer theme={theme === 'dark' ? 'dark' : 'light'} />
      
      <header className='w-full sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 sm:px-[10%]'>
        <Navbar />
      </header>

      <main className='flex-grow px-4 sm:px-[10%] py-6'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/my-appointments' element={<MyAppointment />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/ai-hub' element={<AiHub />} />
          <Route path='/pharmacy-shop' element={<PharmacyShop />} />
          <Route path='/blood-donation' element={<BloodDonation />} />
          <Route path='/emergency-sos' element={<EmergencySOS />} />
        </Routes>
      </main>





      {/* Floating AI Symptom Checker Widget */}
      <SymptomChecker />
      
      <Footer />
    </div>
  )
}

export default App


