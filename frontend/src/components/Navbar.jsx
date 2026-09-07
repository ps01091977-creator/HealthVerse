import React, { useContext, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../store/uiSlice'
import { 
  Sun, Moon, Sparkles, ChevronDown, User, Calendar, LogOut, Menu, X, Shield, 
  Home, Stethoscope, Pill, HeartHandshake, AlertTriangle, Info, Phone, Activity
} from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  
  const theme = useSelector((state) => state.ui.theme)
  const { token, setToken, userData } = useContext(AppContext)

  // Prevent background body scroll when mobile menu is active
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMenu])

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    setShowProfileDropdown(false)
    setShowMenu(false)
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

      {/* Nav Links (Desktop) */}
      <ul className='hidden md:flex items-center gap-6 text-zinc-600 dark:text-zinc-300 text-xs font-medium'>
        <li>
          <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Home</NavLink>
        </li>
        <li>
          <NavLink to='/doctors' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Find Doctors</NavLink>
        </li>
        <li>
          <NavLink to='/about' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>About Us</NavLink>
        </li>
        <li>
          <NavLink to='/contact' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Contact</NavLink>
        </li>
        <li>
          <NavLink to='/ai-hub' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Clinical Hub</NavLink>
        </li>
        <li>
          <NavLink to='/pharmacy-shop' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Report AI</NavLink>
        </li>
        <li>
          <NavLink to='/blood-donation' className={({ isActive }) => isActive ? 'text-primary dark:text-primary font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors'}>Blood Bank</NavLink>
        </li>
        <li>
          <NavLink to='/emergency-sos' className={({ isActive }) => isActive ? 'text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20' : 'text-red-500 hover:text-red-600 transition-colors border border-red-500/20 px-2 py-1 rounded-lg bg-red-500/5'}>Emergency SOS</NavLink>
        </li>
      </ul>

      {/* Right Section: Theme switch, Admin CTA, Profile dropdown */}
      <div className='flex items-center gap-3'>
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Admin Portal link */}
        <button
          onClick={() => navigate('/admin-login')}
          className='border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs px-3.5 py-2 rounded-xl transition-all hidden md:flex items-center gap-1.5 cursor-pointer font-medium'
        >
          <Shield className="w-3.5 h-3.5 text-primary" /> Portal
        </button>

        {token && userData ? (
          <div className='relative'>
            <div 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className='flex items-center gap-2 cursor-pointer select-none p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/50 transition-all'
            >
              <img 
                className='w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover' 
                src={userData.image || assets.profile_pic} 
                alt="profile" 
                onError={(e) => { e.currentTarget.src = assets.profile_pic }}
              />
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </div>
            
            {showProfileDropdown && (
              <>
                <div onClick={() => setShowProfileDropdown(false)} className="fixed inset-0 z-30" />
                <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-40 p-2 animate-in fade-in slide-in-from-top-2 duration-150'>
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{userData.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{userData.email}</p>
                  </div>
                  <button 
                    onClick={() => { navigate('/my-profile'); setShowProfileDropdown(false); }}
                    className='w-full px-3 py-2 rounded-xl text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 transition-colors'
                  >
                    <User className="w-3.5 h-3.5" /> Profile
                  </button>
                  <button 
                    onClick={() => { navigate('/my-appointments'); setShowProfileDropdown(false); }}
                    className='w-full px-3 py-2 rounded-xl text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 transition-colors'
                  >
                    <Calendar className="w-3.5 h-3.5" /> Appointments
                  </button>
                  <hr className="my-1 border-zinc-100 dark:border-zinc-800" />
                  <button 
                    onClick={logout}
                    className='w-full px-3 py-2 rounded-xl text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors'
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
            className='bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all hidden md:block cursor-pointer'
          >
            Sign In
          </button>
        )}

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setShowMenu(true)} 
          className='md:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer'
          aria-label="Open Mobile Menu"
        >
          <Menu className='w-5 h-5' />
        </button>

        {/* ---- Mobile Menu Drawer (Teleported via Portal to body) ---- */}
        {showMenu && typeof document !== 'undefined' && createPortal(
          <div className='fixed inset-0 z-[99999999] flex justify-end animate-in fade-in duration-200'>
            {/* Solid Dark Backdrop */}
            <div 
              onClick={() => setShowMenu(false)} 
              className='fixed inset-0 bg-black/80 backdrop-blur-sm'
            />

            {/* Solid Slide-in Drawer with Full 100dvh Height */}
            <div className='relative w-[85vw] max-w-[340px] h-[100dvh] bg-[#ffffff] dark:bg-[#0c0d14] text-zinc-900 dark:text-zinc-50 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-250'>
              
              <div className="space-y-4">
                {/* Header inside drawer */}
                <div className='flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80'>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white leading-none block">HealthVerse</span>
                      <span className="text-[8px] text-zinc-400 font-semibold tracking-wider uppercase">Patient Portal</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMenu(false)} 
                    className='p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>

                {/* User Profile info if logged in */}
                {token && userData && (
                  <div className='flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800 rounded-xl'>
                    <img 
                      className='w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover' 
                      src={userData.image || assets.profile_pic} 
                      alt="profile" 
                      onError={(e) => { e.currentTarget.src = assets.profile_pic }}
                    />
                    <div className="truncate flex-1">
                      <p className='font-bold text-xs text-zinc-900 dark:text-zinc-50 truncate leading-tight'>{userData.name}</p>
                      <p className='text-[10px] text-zinc-400 truncate leading-none mt-0.5'>{userData.email}</p>
                    </div>
                  </div>
                )}

                {/* Nav items list */}
                <div className='flex flex-col gap-1 text-xs'>
                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/' 
                    className={({isActive}) => `px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Home className="w-4 h-4 text-zinc-500" />
                    <span>Home</span>
                  </NavLink>

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/doctors' 
                    className={({isActive}) => `px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Stethoscope className="w-4 h-4 text-blue-500" />
                    <span>Find Doctors</span>
                  </NavLink>

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/ai-hub' 
                    className={({isActive}) => `px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Clinical AI Hub</span>
                  </NavLink>

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/pharmacy-shop' 
                    className={({isActive}) => `px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>AI Report Analyzer</span>
                  </NavLink>

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/blood-donation' 
                    className={({isActive}) => `px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <HeartHandshake className="w-4 h-4 text-rose-500" />
                    <span>Blood Bank & Donors</span>
                  </NavLink>

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/emergency-sos' 
                    className={({isActive}) => `px-3.5 py-2.5 rounded-xl flex items-center justify-between font-semibold transition-all ${isActive ? 'bg-red-500/15 text-red-500 border border-red-500/30' : 'text-red-500 hover:bg-red-500/10 border border-red-500/20 bg-red-500/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>Emergency SOS</span>
                    </div>
                    <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-md font-bold uppercase">24/7</span>
                  </NavLink>

                  <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/about' 
                    className={({isActive}) => `px-3.5 py-2 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Info className="w-4 h-4 text-zinc-400" />
                    <span>About Us</span>
                  </NavLink>

                  <NavLink 
                    onClick={() => setShowMenu(false)} 
                    to='/contact' 
                    className={({isActive}) => `px-3.5 py-2 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span>Contact Support</span>
                  </NavLink>

                  {token && userData && (
                    <>
                      <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                      <NavLink 
                        onClick={() => setShowMenu(false)} 
                        to='/my-profile' 
                        className={({isActive}) => `px-3.5 py-2 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>My Profile</span>
                      </NavLink>
                      <NavLink 
                        onClick={() => setShowMenu(false)} 
                        to='/my-appointments' 
                        className={({isActive}) => `px-3.5 py-2 rounded-xl flex items-center gap-3 font-medium transition-all ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-primary font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                      >
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span>My Appointments</span>
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-3">
                {token && userData ? (
                  <button 
                    onClick={logout} 
                    className='w-full py-2.5 rounded-xl border border-red-200 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer'
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setShowMenu(false); }} 
                    className='w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md shadow-primary/25 transition-all cursor-pointer active:scale-98'
                  >
                    Get Started / Sign In
                  </button>
                )}

                <button 
                  onClick={() => { navigate('/admin-login'); setShowMenu(false); }} 
                  className='w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer'
                >
                  <Shield className="w-4 h-4 text-primary" /> Doctor & Admin Portal
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}

export default Navbar

