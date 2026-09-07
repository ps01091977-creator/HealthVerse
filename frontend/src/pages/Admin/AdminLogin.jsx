import React, { useContext, useState } from 'react'
import axios from 'axios'
import { DoctorContext } from '../../context/DoctorContext'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { 
  ShieldCheck, 
  Stethoscope, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Sparkles, 
  KeyRound, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('Admin') // 'Admin' or 'Doctor'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://healthverse-1.onrender.com'

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      if (role === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
          toast.success('🎉 Welcome to Admin Console!')
          navigate('/admin-dashboard')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
          toast.success('🩺 Welcome back, Doctor!')
          navigate('/doctor-dashboard')
        } else {
          toast.error(data.message)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFillDemo = (targetRole) => {
    setRole(targetRole)
    if (targetRole === 'Admin') {
      setEmail('priyanshushakyaps789@gmail.com')
      setPassword('Priyanshu@999')
    } else {
      setEmail('richard.james@healthverse.ai')
      setPassword('Doctor@123')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-br from-zinc-50 via-zinc-100 to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      
      {/* Top Bar Back to Site */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Patient Portal</span>
        </button>

        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          Secure Terminal
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-950/5 dark:shadow-black/40 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg shadow-primary/25 mb-1">
            {role === 'Admin' ? <ShieldCheck className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
            {role === 'Admin' ? 'Admin Console' : 'Doctor Portal'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Authorized healthcare provider & administrator authentication gateway
          </p>
        </div>

        {/* Role Switcher Segmented Control */}
        <div className="grid grid-cols-2 p-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => { setRole('Admin'); setEmail(''); setPassword(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              role === 'Admin'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Administrator</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('Doctor'); setEmail(''); setPassword(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              role === 'Doctor'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-primary" />
            <span>Doctor Specialist</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Official Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'Admin' ? 'admin@healthverse.ai' : 'doctor@healthverse.ai'}
                required
                className="w-full pl-10 pr-4 py-3 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Autofill Pills */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-primary" /> Demo Access:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('Admin')}
                className="text-left px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/50 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:shadow-sm cursor-pointer"
              >
                <div className="text-[10px] text-zinc-400">Fill Admin</div>
                <div className="truncate font-bold text-primary">priyanshu@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('Doctor')}
                className="text-left px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/50 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:shadow-sm cursor-pointer"
              >
                <div className="text-[10px] text-zinc-400">Fill Doctor</div>
                <div className="truncate font-bold text-primary">richard.james@...</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-blue-700 hover:from-primary-dark hover:to-blue-800 text-white font-bold text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to {role} Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            Protected by End-to-End Enterprise Encryption
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin