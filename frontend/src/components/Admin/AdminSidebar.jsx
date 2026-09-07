import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AdminContext } from '../../context/AdminContext'
import { 
  LayoutDashboard, 
  CalendarDays, 
  UserPlus, 
  Users, 
  User, 
  Stethoscope, 
  X, 
  ShieldCheck, 
  Activity, 
  LogOut,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

const AdminSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { dToken, profileData, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const adminNavLinks = [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & metrics' },
    { to: '/all-appointments', icon: CalendarDays, label: 'Appointments', desc: 'Manage patient bookings' },
    { to: '/add-doctor', icon: UserPlus, label: 'Add Doctor', desc: 'Onboard new physician' },
    { to: '/doctor-list', icon: Users, label: 'Doctors List', desc: 'Roster & availability' },
  ]

  const doctorNavLinks = [
    { to: '/doctor-dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Analytics & queues' },
    { to: '/doctor-appointments', icon: CalendarDays, label: 'Appointments', desc: 'Patient schedule' },
    { to: '/doctor-profile', icon: User, label: 'Doctor Profile', desc: 'Credentials & fees' },
  ]

  const navItems = aToken ? adminNavLinks : dToken ? doctorNavLinks : []

  const renderNavList = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full py-4">
      {/* Navigation Links */}
      <div className="space-y-1.5 px-3">
        <div className="px-3 py-1.5 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {aToken ? 'Administration' : 'Clinical Workspace'}
          </p>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (isMobile && onCloseMobile) onCloseMobile()
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-primary group-hover:bg-primary/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="leading-tight">{item.label}</span>
                      <span
                        className={`text-[10px] font-normal leading-tight ${
                          isActive ? 'text-blue-100' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Bottom Info Card */}
      <div className="px-3 pt-4 mt-auto">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100/80 dark:from-zinc-900 dark:to-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {aToken ? <ShieldCheck className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                {aToken ? 'Hospital Admin' : profileData?.name || 'Dr. Specialist'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 min-h-[calc(100vh-57px)] bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-300 select-none sticky top-[57px]">
        {renderNavList(false)}
      </aside>

      {/* Mobile Drawer Overlay & Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  H
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-zinc-900 dark:text-white">HealthVerse</h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                    {aToken ? 'Admin Control' : 'Doctor Portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto">
              {renderNavList(true)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminSidebar