import React, { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../../store/uiSlice'
import { Sun, Moon, LogOut, ArrowLeftRight, Menu, ShieldCheck, Stethoscope, Sparkles } from 'lucide-react'

const AdminNavbar = ({ onToggleMobileSidebar }) => {
  const { dToken, setDToken, profileData } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.ui.theme)

  const logout = () => {
    navigate('/admin-login')
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
  }

  const goToUserPanel = () => {
    navigate('/')
  }

  const role = aToken ? 'Admin' : 'Doctor'

  return (
    <header className='sticky top-0 z-30 w-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors duration-300'>
      <div className='flex items-center justify-between gap-2 max-w-7xl mx-auto'>
        
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className='flex items-center gap-2.5 sm:gap-4'>
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            onClick={onToggleMobileSidebar}
            className='md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none'
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div 
            onClick={() => navigate(aToken ? '/admin-dashboard' : '/doctor-dashboard')}
            className="flex items-center gap-2.5 select-none cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm sm:text-base tracking-tighter">H</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white">
                  Health<span className="text-primary">Verse</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                  <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 font-bold text-[10px] tracking-wider uppercase">
            {aToken ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Admin Console</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-3 h-3 text-primary" />
                <span>Doctor Portal</span>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Navigation & User Actions */}
        <div className='flex items-center gap-2 sm:gap-3'>
          
          {/* Switch to Patient Site Button */}
          <button
            onClick={goToUserPanel}
            className='inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 hover:text-primary dark:hover:text-primary bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 border border-zinc-200/60 dark:border-zinc-700/50 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer'
            title="Switch to Patient Portal"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Patient View</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600 animate-in spin-in-90 duration-300" />
            )}
          </button>

          {/* User Profile / Status Indicator */}
          {dToken && profileData && (
            <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              <img 
                src={profileData.image || '/fallback-doctor.png'} 
                alt={profileData.name} 
                className="w-7 h-7 rounded-full object-cover border border-primary/30"
              />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[100px]">
                {profileData.name?.split(' ')[0]}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className='bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl cursor-pointer transition-all active:scale-[0.96] flex items-center gap-1.5 shadow-sm hover:shadow'
            title="Log out of console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
