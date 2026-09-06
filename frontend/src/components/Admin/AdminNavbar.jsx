import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { DoctorContext } from '../../context/DoctorContext'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../../store/uiSlice'
import { Sun, Moon, LogOut, ArrowLeftRight } from 'lucide-react'

const AdminNavbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.ui.theme)

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  const goToUserPanel = () => {
    navigate('/')
  }

  const isOnDashboard =
    location.pathname === '/admin-dashboard' ||
    location.pathname === '/doctor-dashboard'

  return (
    <div className='flex justify-between items-center px-6 sm:px-10 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm transition-colors duration-300'>
      <div className='flex items-center gap-4 text-xs'>
        
        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 select-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/10">
            <span className="font-black text-sm">H</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">HealthVerse</span>
        </div>

        {/* Role Label */}
        <p className='border px-3 py-1 rounded-full border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 font-bold tracking-wide uppercase text-[9px]'>
          {aToken ? 'Admin' : 'Doctor'}
        </p>

        {/* User Panel Button */}
        {isOnDashboard && (
          <button
            onClick={goToUserPanel}
            className='ml-2 inline-flex items-center gap-1 text-white bg-primary hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm shadow-primary/10'
          >
            <ArrowLeftRight className="w-3 h-3" /> User Panel
          </button>
        )}
      </div>

      <div className='flex items-center gap-4'>
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className='bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.96] flex items-center gap-1.5 shadow-sm'
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </div>
  )
}

export default AdminNavbar
