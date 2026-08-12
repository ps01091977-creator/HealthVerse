import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../store/uiSlice'
import { Sun, Moon, Sparkles, ChevronDown, User, Calendar, LogOut, Menu, X, Shield } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  
  const theme = useSelector((state) => state.ui.theme)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    setShowProfileDropdown(false)
    navigate('/login')
  }

  return (
    <div className='flex items-center justify-between py-4 text-sm font-medium transition-all'>
      {/* Logo & Brand Name */}
      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">HealthVerse</span>
          <span className="text-[9px] text-zinc-400 font-semibold tracking-wider uppercase leading-none mt-0.5">Patient Portal</span>
        </div>
      </div>

      {/* Nav Links */}
      <ul className='hidden md:flex items-center gap-6 text-zinc-600 dark:text-zinc-300'>
        <li>
          <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Home</NavLink>
        </li>
        <li>
          <NavLink to='/doctors' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Find Doctors</NavLink>
        </li>
        <li>
          <NavLink to='/about' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>About Us</NavLink>
        </li>
        <li>
          <NavLink to='/contact' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Contact</NavLink>
        </li>
        <li>
          <NavLink to='/ai-hub' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Clinical Hub</NavLink>
        </li>
        <li>
          <NavLink to='/pharmacy-shop' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Pharmacy</NavLink>
        </li>
        <li>
          <NavLink to='/blood-donation' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-semibold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Blood Bank</NavLink>
        </li>
        <li>
          <NavLink to='/emergency-sos' className={({ isActive }) => isActive ? 'text-red-500 font-bold' : 'text-red-500 hover:text-red-650 transition-colors border border-red-500/20 px-2 py-0.5 rounded-lg bg-red-500/5'}>Emergency SOS</NavLink>
        </li>
      </ul>





      {/* Right Section: Theme switch, Admin CTA, Profile dropdown */}
      <div className='flex items-center gap-4'>
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Portal link */}
        {location.pathname === '/' && (
          <a
            href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5180'}
            target="_blank"
            rel="noopener noreferrer"
            className='border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs px-3.5 py-2 rounded-xl transition-all hidden md:flex items-center gap-1.5'
          >
            <Shield className="w-3.5 h-3.5" /> Portal
          </a>
        )}

        {token && userData ? (
          <div className='relative'>
            <div 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className='flex items-center gap-2 cursor-pointer select-none p-1 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/50 transition-all'
            >
              <img className='w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover' src={userData.image || '/fallback-user.png'} alt="profile" />
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </div>
            
            {showProfileDropdown && (
              <>
                <div onClick={() => setShowProfileDropdown(false)} className="fixed inset-0 z-10" />
                <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150'>
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{userData.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{userData.email}</p>
                  </div>
                  <button 
                    onClick={() => { navigate('/my-profile'); setShowProfileDropdown(false); }}
                    className='w-full px-3 py-2 rounded-lg text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 transition-colors'
                  >
                    <User className="w-3.5 h-3.5" /> Profile
                  </button>
                  <button 
                    onClick={() => { navigate('/my-appointments'); setShowProfileDropdown(false); }}
                    className='w-full px-3 py-2 rounded-lg text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 transition-colors'
                  >
                    <Calendar className="w-3.5 h-3.5" /> Appointments
                  </button>
                  <hr className="my-1 border-zinc-100 dark:border-zinc-900" />
                  <button 
                    onClick={logout}
                    className='w-full px-3 py-2 rounded-lg text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors'
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all hidden md:block cursor-pointer'
          >
            Create Account
          </button>
        )}

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setShowMenu(true)} 
          className='md:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
        >
          <Menu className='w-4 h-4' />
        </button>

        {/* ---- Mobile Menu Drawer ---- */}
        {showMenu && (
          <>
            <div 
              onClick={() => setShowMenu(false)} 
              className='md:hidden fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200'
            />
            <div className='md:hidden fixed right-0 top-0 bottom-0 z-50 w-[75vw] max-w-xs bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-850 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-250'>
              <div className="space-y-6">
                <div className='flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900'>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-bold text-sm tracking-tight">HealthVerse</span>
                  </div>
                  <button 
                    onClick={() => setShowMenu(false)} 
                    className='p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>

                {token && userData && (
                  <div className='flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl'>
                    <img className='w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover' src={userData.image || '/fallback-user.png'} alt="profile" />
                    <div className="truncate">
                      <p className='font-semibold text-xs text-zinc-900 dark:text-zinc-50 leading-tight'>{userData.name}</p>
                      <p className='text-[10px] text-zinc-400 truncate leading-none mt-0.5'>{userData.email}</p>
                    </div>
                  </div>
                )}

                <ul className='flex flex-col gap-2 text-xs'>
                  <NavLink onClick={() => setShowMenu(false)} to='/' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>Home</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/doctors' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>Find Doctors</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/about' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>About Us</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/contact' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>Contact</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/ai-hub' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>AI Assistant</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/pharmacy-shop' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>Pharmacy</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/blood-donation' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>Blood Bank</NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/emergency-sos' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-red-500 font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-red-500 font-semibold'}`}>Emergency SOS</NavLink>
                  
                  <hr className='w-full border-zinc-100 dark:border-zinc-900 my-2' />




                  {token && userData ? (
                      <>
                        <NavLink onClick={() => setShowMenu(false)} to='/my-profile' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>My Profile</NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/my-appointments' className={({isActive}) => `px-4 py-2.5 rounded-lg flex items-center transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary dark:text-primary font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>My Appointments</NavLink>
                      </>
                  ) : null}
                </ul>
              </div>

              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                {token && userData ? (
                  <button 
                    onClick={() => { logout(); setShowMenu(false); }} 
                    className='w-full py-2.5 rounded-xl border border-red-200 dark:border-red-950/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98'
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setShowMenu(false); }} 
                    className='w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center transition-all active:scale-98'
                  >
                    Get Started
                  </button>
                )}

                {location.pathname === '/' && (
                  <a 
                    href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5180'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className='w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all'
                  >
                    <Shield className="w-3.5 h-3.5" /> Portal Access
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar

