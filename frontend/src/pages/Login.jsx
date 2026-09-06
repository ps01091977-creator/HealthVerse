import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react'

// Zod schemas for client-side validation
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const [state, setState] = useState('Login') // 'Login' or 'Sign Up'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrors({})
    setIsLoading(true)

    // Run client-side Zod validation
    try {
      if (state === 'Sign Up') {
        signupSchema.parse({ name, email, password })
      } else {
        loginSchema.parse({ email, password })
      }
    } catch (err) {
      setIsLoading(false)
      if (err instanceof z.ZodError) {
        const formattedErrors = {}
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message
        })
        setErrors(formattedErrors)
        // Toast first error
        toast.error(err.errors[0].message)
        return
      }
    }

    // Submit request
    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, { name, email, password })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Registration successful!')
        } else {
          toast.error(data.message || 'Registration failed')
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, { email, password })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Welcome back!')
        } else {
          toast.error(data.message || 'Login failed')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Server error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <div className='min-h-[75vh] flex items-center justify-center py-10'>
      <form 
        onSubmit={onSubmitHandler} 
        className='w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 text-left'
      >
        {/* Branding header */}
        <div className="text-center space-y-1.5 pb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white mx-auto shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className='text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-zinc-405 dark:text-zinc-400">
            {state === 'Sign Up' ? 'Get started with HealthVerse' : 'Login to your patient account'}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {state === 'Sign Up' && (
            <div className='space-y-1 w-full text-xs'>
              <label htmlFor="user-name-input" className='font-semibold text-zinc-600 dark:text-zinc-400'>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  id="user-name-input"
                  name="fullName"
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  placeholder="John Doe" 
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.name ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                  }`} 
                  type="text" 
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.name}</p>}
            </div>
          )}

          <div className='space-y-1 w-full text-xs'>
            <label htmlFor="user-email-input" className='font-semibold text-zinc-600 dark:text-zinc-400'>Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                id="user-email-input"
                name="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                placeholder="example@email.com" 
                className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                  errors.email ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`} 
                type="email" 
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.email}</p>}
          </div>

          <div className='space-y-1 w-full text-xs'>
            <label htmlFor="user-password-input" className='font-semibold text-zinc-600 dark:text-zinc-400'>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                id="user-password-input"
                name="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                placeholder="••••••••" 
                className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                  errors.password ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`} 
                type="password" 
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.password}</p>}
          </div>
        </div>

        {state === 'Login' && (
          <div className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Demo Patient</span>
            <button
              type="button"
              onClick={() => {
                setEmail('testuser999@healthverse.com')
                setPassword('Password@123')
              }}
              className="text-primary dark:text-primary font-semibold bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              Auto Fill
            </button>
          </div>
        )}

        {/* Submit */}
        <button 
          type='submit' 
          disabled={isLoading}
          className='w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50'
        >
          {isLoading ? 'Processing...' : state === 'Sign Up' ? 'Create Account' : 'Login'} <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Toggle */}
        <div className="text-center pt-2">
          {state === 'Sign Up' ? (
            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <span 
                onClick={() => { setState('Login'); setErrors({}); }} 
                className='text-primary dark:text-zinc-200 font-semibold underline cursor-pointer hover:text-primary-dark transition-colors'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              New to HealthVerse?{' '}
              <span 
                onClick={() => { setState('Sign Up'); setErrors({}); }} 
                className='text-primary dark:text-zinc-200 font-semibold underline cursor-pointer hover:text-primary-dark transition-colors'
              >
                Create one now
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login