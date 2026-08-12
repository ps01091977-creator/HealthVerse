import React from 'react'
import { assets } from '../assets/assets'
import { Sparkles, Shield, Cpu, Zap, Activity, Users } from 'lucide-react'

const About = () => {
  return (
    <div className="pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/30 text-primary border border-sky-100 dark:border-sky-900/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Healthcare Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          About <span className="text-primary">HealthVerse</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          Bridging the gap between clinical excellence and intelligent diagnostics to empower patient lives worldwide.
        </p>
      </div>

      {/* Main Core Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
        {/* Left Side Visual Image Frame */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
            <img 
              className="w-full rounded-2xl object-cover aspect-[4/3] sm:aspect-[16/10]" 
              src={assets.about_image} 
              alt="Healthcare professionals team" 
            />
          </div>
        </div>

        {/* Right Side Text Block */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Who We Are
            </h3>
            <p className="text-zinc-600 dark:text-zinc-450 text-sm leading-relaxed">
              Welcome to <span className="font-semibold text-zinc-900 dark:text-zinc-100">HealthVerse</span>, your premium platform for complete medical coordination. We streamline patient scheduling, host smart diagnostic assistants, and connect users with elite clinical specialists.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Our Mission
            </h3>
            <p className="text-zinc-600 dark:text-zinc-450 text-sm leading-relaxed">
              We aim to make clinical scheduling seamless and stress-free. By merging deep learning tools (powered by Gemini) with modern booking workflows, HealthVerse ensures you access premium consultation whenever required.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 md:p-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center mb-24">
        <div>
          <h4 className="text-3xl sm:text-4xl font-extrabold text-primary">99.8%</h4>
          <p className="text-zinc-500 dark:text-zinc-450 text-xs sm:text-sm mt-1 uppercase tracking-wider font-semibold">Uptime SLA</p>
        </div>
        <div className="border-y sm:border-y-0 sm:border-x border-zinc-200 dark:border-zinc-800 py-6 sm:py-0">
          <h4 className="text-3xl sm:text-4xl font-extrabold text-emerald-500">12k+</h4>
          <p className="text-zinc-500 dark:text-zinc-450 text-xs sm:text-sm mt-1 uppercase tracking-wider font-semibold">Verified Specialists</p>
        </div>
        <div>
          <h4 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">1.2M</h4>
          <p className="text-zinc-500 dark:text-zinc-450 text-xs sm:text-sm mt-1 uppercase tracking-wider font-semibold">Diagnosis Queries</p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3.5xl font-extrabold text-zinc-900 dark:text-zinc-100">Why Choose Us</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">Engineered to deliver precision, reliability, and security for peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 hover:shadow-xl dark:hover:shadow-black/20 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Efficiency</h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Instant appointment scheduling with zero waiting lines. Book, reschedule, or cancel within seconds.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 hover:shadow-xl dark:hover:shadow-black/20 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Convenience</h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Find and consult vetted specialists near your coordinate bounds or request instant ambulance dispatches.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 hover:shadow-xl dark:hover:shadow-black/20 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Personalization</h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Get personalized AI symptom checkers and diet guidelines mapped directly to your history records.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
