import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Bot, 
  AlertTriangle, 
  Pill, 
  Activity, 
  ShieldAlert, 
  Map, 
  Users, 
  Award, 
  HeartHandshake,
  ArrowRight,
  FileText
} from 'lucide-react'

const HomeFeatures = () => {
  const stats = [
    { label: "Onboarded Clinical Specialists", value: "150+", desc: "Verified credential doctors across 12+ domains", icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Emergency Response Uptime", value: "99.99%", desc: "Direct GPS dispatch & active routing system", icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
    { label: "AI Consultation Hours", value: "48,000+", desc: "Symptom check assessments completed", icon: Bot, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Patient Care Satisfaction", value: "4.9/5", desc: "Top-rated digital clinical platform", icon: HeartHandshake, color: "text-emerald-500 bg-emerald-500/10" }
  ]

  const featureCards = [
    {
      title: "Clinical AI Companion",
      description: "Analyze symptoms, get instant drug summaries, translate lab reports, and manage personalized diets using state-of-the-art Generative AI models.",
      link: "/ai-hub",
      linkText: "Launch AI Hub",
      icon: Bot,
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Real-Time Emergency SOS",
      description: "Direct-dial critical desks and broadcast your live coordinate location to active dispatchers. View oncoming ambulance tracking on interactive satellite maps.",
      link: "/emergency-sos",
      linkText: "Request Emergency SOS",
      icon: AlertTriangle,
      color: "from-red-600 to-orange-500"
    },
    {
      title: "AI Medical Report Analyzer & RAG",
      description: "Upload medical lab reports and prescriptions to get metric breakdowns, abnormal value alerts, AI-suggested medicines, and interactive report Q&A.",
      link: "/pharmacy-shop",
      linkText: "Analyze Report with AI",
      icon: FileText,
      color: "from-indigo-600 to-teal-500"
    }
  ]

  return (
    <div className="space-y-16 py-12 text-left">
      
      {/* 1. KEY ANALYTIC METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl shadow-sm relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-2xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* 2. PLATFORM CAPABILITIES */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Next-Generation Clinical Tools</h2>
          <p className="text-zinc-500 text-xs">Access modern health management frameworks, clinical copilots, and real-time medical logistics instantly from your dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Colored top gradient accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feat.color}`} />
              
              <div className="space-y-4 pt-2">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shadow-md`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">{feat.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-[11px]">{feat.description}</p>
              </div>

              <div className="pt-6">
                <Link 
                  to={feat.link}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:gap-1.5 transition-all cursor-pointer"
                >
                  {feat.linkText} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PREMIUM MEDICAL VALUE CALL-OUT */}
      <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-zinc-950 dark:via-zinc-900/90 dark:to-[#0c0d14] rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-3 z-10 max-w-xl">
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
            Clinical Trust & Security
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Your health data is protected under complete enterprise standards.</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px] sm:text-xs">
            Every consultation, symptom analysis, and prescription check is secured using industry-standard encrypted channels. Access verified medical care without compromises.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 z-10 w-full lg:w-auto">
          <Link 
            to="/doctors"
            className="px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-[11px] sm:text-xs font-extrabold shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all text-center w-full sm:w-auto"
          >
            Find a Specialist
          </Link>
          <Link 
            to="/about"
            className="px-5 py-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl text-[11px] sm:text-xs font-extrabold shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all text-center w-full sm:w-auto"
          >
            Learn About HealthVerse
          </Link>
        </div>

      </div>

    </div>
  )
}

export default HomeFeatures
