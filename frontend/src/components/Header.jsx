import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, Sparkles, Star, ShieldCheck } from 'lucide-react'

const Header = () => {
    return (
        <div className='relative flex flex-col lg:flex-row items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-6 py-12 sm:px-12 lg:px-16 overflow-hidden my-6 shadow-sm relative'>
            {/* Soft decorative background circles (minimal and clean) */}
            <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[20vw] h-[20vw] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            {/* --------- Header Left --------- */}
            <div className='lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 relative z-10'>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 
                  Vetted Clinical Medical Network
                </div>
                
                <h1 className='text-3xl sm:text-5xl lg:text-5xl text-zinc-900 dark:text-zinc-50 font-extrabold tracking-tight leading-tight lg:leading-[1.1] font-sans'>
                    Professional Healthcare <br />
                    <span className="text-primary">Appointments Made Simple</span>
                </h1>
                
                <p className="text-zinc-505 dark:text-zinc-400 text-sm max-w-lg leading-relaxed font-normal">
                    Schedule consultations with board-certified clinical professionals. Use our verified AI assistant for symptom assessments and doctor matches.
                </p>

                <div className='flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs text-zinc-500 dark:text-zinc-450'>
                    <img className='w-20 border border-white dark:border-zinc-800 rounded-full shadow-sm' src={assets.group_profiles} alt="Team" />
                    <div className="text-left">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">Over 10,000+ appointments scheduled</p>
                      <p className="text-[10px] text-zinc-400">Trusted by patient communities nationwide</p>
                    </div>
                </div>

                <div className="pt-2 w-full flex justify-center lg:justify-start">
                  <a 
                    href='#speciality' 
                    className='inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer'
                  >
                      Book Consultation <ArrowRight className='w-4 h-4' />
                  </a>
                </div>
            </div>

            {/* --------- Header Right --------- */}
            <div className='hidden lg:block lg:w-1/2 relative self-end pt-8 pl-8'>
                <img 
                  className='w-full max-w-[440px] ml-auto h-auto rounded-t-xl object-contain object-bottom filter drop-shadow-sm border-l border-t border-zinc-200/60 dark:border-zinc-800' 
                  src={assets.header_img} 
                  alt="Clinical Professional Illustration" 
                />
            </div>
        </div>
    )
}

export default Header