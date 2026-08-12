import React from 'react'
import { assets } from '../assets/assets'
import { Phone, Mail, MapPin, Briefcase, Sparkles } from 'lucide-react'

const Contact = () => {
  return (
    <div className="pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/30 text-primary border border-sky-100 dark:border-sky-900/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Support Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          Contact <span className="text-primary">Our Team</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          Have questions or need assistance? Reach out to our technical support team, or explore career opportunities.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Side Image Frame */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
            <img 
              className="w-full rounded-2xl object-cover aspect-[4/3] sm:aspect-[16/10]" 
              src={assets.contact_image} 
              alt="Medical representative on support call" 
            />
          </div>
        </div>

        {/* Right Side Content Block */}
        <div className="space-y-8">
          {/* Office Address Card */}
          <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Our Corporate Headquarters
            </h3>
            
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              <p className="font-semibold text-zinc-850 dark:text-zinc-200">HealthVerse Technologies Inc.</p>
              <p>
                54709 Willms Station <br /> 
                Suite 350, Seattle, Washington, USA
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <a 
                href="tel:+14155550132" 
                className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors py-2"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-150 dark:border-zinc-700/50">
                  <Phone className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Phone</span>
                  <span>(415) 555-0132</span>
                </div>
              </a>

              <a 
                href="mailto:support@healthverse.ai" 
                className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors py-2"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-150 dark:border-zinc-700/50">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Email</span>
                  <span>support@healthverse.ai</span>
                </div>
              </a>
            </div>
          </div>

          {/* Careers Card */}
          <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Careers at HealthVerse
            </h3>
            
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              We are constantly seeking brilliant engineers, UI specialists, and data scientists to shape the future of medical diagnostics. Learn more about our remote-first culture and discover open job roles.
            </p>

            <button className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99]">
              Explore Open Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
