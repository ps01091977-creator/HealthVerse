import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AdminContext } from '../../context/AdminContext'

const AdminSidebar = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return (
    <div className='min-h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 w-16 md:w-72 transition-all duration-300'>
      {aToken && <ul className='text-zinc-600 dark:text-zinc-400 mt-5 space-y-1'>
        <NavLink to={'/admin-dashboard'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.home_icon} alt='' />
          <p className='hidden md:block text-sm'>Dashboard</p>
        </NavLink>
        <NavLink to={'/all-appointments'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block text-sm'>Appointments</p>
        </NavLink>
        <NavLink to={'/add-doctor'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.add_icon} alt='' />
          <p className='hidden md:block text-sm'>Add Doctor</p>
        </NavLink>
        <NavLink to={'/doctor-list'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.people_icon} alt='' />
          <p className='hidden md:block text-sm'>Doctors List</p>
        </NavLink>
      </ul>}

      {dToken && <ul className='text-zinc-600 dark:text-zinc-400 mt-5 space-y-1'>
        <NavLink to={'/doctor-dashboard'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.home_icon} alt='' />
          <p className='hidden md:block text-sm'>Dashboard</p>
        </NavLink>
        <NavLink to={'/doctor-appointments'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block text-sm'>Appointments</p>
        </NavLink>
        <NavLink to={'/doctor-profile'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-5 md:px-8 cursor-pointer transition-all duration-200 border-r-4 ${isActive ? 'bg-zinc-100/70 dark:bg-zinc-800/80 border-primary text-zinc-950 dark:text-white font-semibold' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}`}>
          <img className='w-5 h-5 min-w-5 dark:invert' src={assets.people_icon} alt='' />
          <p className='hidden md:block text-sm'>Profile</p>
        </NavLink>
      </ul>}
    </div>
  )
}

export default AdminSidebar