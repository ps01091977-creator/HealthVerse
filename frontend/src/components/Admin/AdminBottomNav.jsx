import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, UserPlus, Users, User, Stethoscope } from 'lucide-react'
import { AdminContext } from '../../context/AdminContext'
import { DoctorContext } from '../../context/DoctorContext'

const AdminBottomNav = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  if (!aToken && !dToken) return null

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {aToken && (
          <>
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/all-appointments"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <CalendarDays className="w-5 h-5 mb-0.5" />
              <span>Bookings</span>
            </NavLink>

            <NavLink
              to="/add-doctor"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <UserPlus className="w-5 h-5 mb-0.5" />
              <span>Add Doc</span>
            </NavLink>

            <NavLink
              to="/doctor-list"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span>Doctors</span>
            </NavLink>
          </>
        )}

        {dToken && (
          <>
            <NavLink
              to="/doctor-dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <Stethoscope className="w-5 h-5 mb-0.5" />
              <span>Console</span>
            </NavLink>

            <NavLink
              to="/doctor-appointments"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <CalendarDays className="w-5 h-5 mb-0.5" />
              <span>Schedule</span>
            </NavLink>

            <NavLink
              to="/doctor-profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary dark:text-primary font-bold bg-primary/10 dark:bg-primary/20 scale-105'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>My Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

export default AdminBottomNav
