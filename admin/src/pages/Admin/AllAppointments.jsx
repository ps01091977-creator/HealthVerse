import React, { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {

  const { aToken, appointments, cancelAppointment, approveAppointment, getAllAppointments } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5 space-y-6'>
      <p className='text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white'>All Appointments</p>

      <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm max-h-[80vh] overflow-y-auto shadow-sm'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3.5 px-6 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/50'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-zinc-600 dark:text-zinc-300 py-3.5 px-6 border-b border-zinc-150 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors' key={index}>
            <p className='max-sm:hidden font-medium text-zinc-400 dark:text-zinc-500'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100' alt="" /> 
              <p className='font-bold text-zinc-900 dark:text-white'>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden font-semibold'>{calculateAge(item.userData.dob)}</p>
            <p className='font-medium'>{slotDateFormat(item.slotDate)}, <span className='text-xs text-zinc-400 font-normal'>{item.slotTime}</span></p>
            <div className='flex items-center gap-2'>
              <img src={item.docData.image} className='w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100' alt="" /> 
              <p className='font-bold text-zinc-900 dark:text-white'>{item.docData.name}</p>
            </div>
            <p className='font-black text-zinc-850 dark:text-zinc-100'>{currency}{item.amount}</p>
            {item.cancelled ? <p className='text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full inline-block text-center w-fit'>Cancelled</p>
              : item.isCompleted ? <p className='text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block text-center w-fit'>Completed</p> 
              : item.status === 'Approved' ? <p className='text-blue-500 text-xs font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full inline-block text-center w-fit'>Approved</p>
              : <div className='flex gap-2.5'>
                  <img onClick={() => approveAppointment(item._id)} className='w-7 h-7 cursor-pointer hover:scale-108 active:scale-95 transition-all bg-emerald-500/10 hover:bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/20' src={assets.tick_icon} alt="Approve" title="Approve" />
                  <img onClick={() => cancelAppointment(item._id)} className='w-7 h-7 cursor-pointer hover:scale-108 active:scale-95 transition-all bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded-lg border border-red-500/20' src={assets.cancel_icon} alt="Decline" title="Decline" />
                </div>}
          </div>
        ))}
      </div>

    </div>
  )
}

export default AllAppointments