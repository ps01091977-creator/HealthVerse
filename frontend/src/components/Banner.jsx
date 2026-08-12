import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Banner = () => {
    const navigate = useNavigate()

    return (
        <div className='relative flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-6 py-12 sm:px-12 md:px-16 my-12 overflow-hidden shadow-sm justify-between items-center'>
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/4 w-[25vw] h-[25vw] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            {/* ------- Left Side ------- */}
            <div className='flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-5 relative z-10'>
                <h2 className='text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight font-sans'>
                    Register Online & <br />
                    <span className="text-primary">Connect with Verified Doctors</span>
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-sm leading-relaxed font-normal">
                    Create an account to securely save clinical booking history, consult our symptom checking AI assistant, and receive live notifications.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => { navigate('/login'); scrollTo(0, 0) }} 
                    className='inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer'
                  >
                      Get Started Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
            </div>

            {/* ------- Right Side ------- */}
            <div className='hidden md:block md:w-1/2 max-w-[320px] relative self-end pt-10'>
                <img 
                  className='w-full object-contain filter drop-shadow-sm border-l border-t border-zinc-200/60 dark:border-zinc-800 rounded-tl-xl' 
                  src={assets.appointment_img} 
                  alt="Clinical Booking Interface" 
                />
            </div>
        </div>
    )
}

export default Banner