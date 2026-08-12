import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  Pill, 
  Search, 
  ClipboardList, 
  Check, 
  Activity, 
  Plus, 
  Minus,
  Sparkles,
  ArrowRight,
  X,
  Thermometer,
  Heart,
  ShieldAlert,
  Flame,
  Wind,
  Bot,
  Send,
  AlertTriangle,
  FileText,
  HelpCircle,
  Clock,
  Info,
  Layers,
  ArrowDownUp
} from 'lucide-react'

const PharmacyShop = () => {
  const { backendUrl, token, slotDateFormat } = useContext(AppContext)

  // Sub-sections navigation: 'finder' (Medicine Finder), 'checker' (Drug Interaction Checker), 'prescriptions' (Consultation Prescriptions)
  const [activeTab, setActiveTab] = useState('finder')

  // Catalog State
  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedDisease, setSelectedDisease] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Clinical Guide Modal
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  // Drug Interaction Checker State
  const [checkerDrugs, setCheckerDrugs] = useState(['', ''])
  const [checkerResult, setCheckerResult] = useState(null)
  const [isCheckerLoading, setIsCheckerLoading] = useState(false)

  // Consultation Prescriptions State
  const [userPrescriptions, setUserPrescriptions] = useState([])
  const [isPrescLoading, setIsPrescLoading] = useState(false)

  // AI Advisor Chat State
  const [aiQuery, setAiQuery] = useState('')
  const [aiReply, setAiReply] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Fetch medicines
  const fetchMedicines = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/pharmacy/list?search=${search}&category=${category}&disease=${selectedDisease}`
      )
      if (data.success) {
        setMedicines(data.medicines)
      }
    } catch (err) {
      toast.error('Failed to load medicine database.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Doctor Prescriptions from Appointments
  const fetchUserPrescriptions = async () => {
    if (!token) return
    setIsPrescLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } })
      if (data.success) {
        const prescriptions = data.appointments.filter(
          appt => appt.isCompleted && appt.prescription && appt.prescription.length > 0
        )
        setUserPrescriptions(prescriptions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsPrescLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [search, category, selectedDisease])

  useEffect(() => {
    if (token) {
      fetchUserPrescriptions()
    }
  }, [token])

  // AI Pharmacy Advisor call
  const handleAiAdvisor = async (e) => {
    if (e) e.preventDefault()
    if (!aiQuery.trim()) return
    setIsAiLoading(true)
    setAiReply(null)

    // Build context of live medicine inventory for Gemini to cross-reference
    const medsContext = medicines.map(m => `- ${m.name} (${m.category}): treats ${m.diseases.join(', ')}. Generic name: ${m.genericName || m.name}`).join('\n')

    const messageToSend = `CONTEXT: You are the HealthVerse Clinical Medicine Advisor. You have access to our medical database:
${medsContext}

USER ENQUIRY: ${aiQuery}

INSTRUCTIONS:
1. Provide a professional, concise, clinical analysis of the symptoms or questions.
2. Recommend the matching drug name(s) from our database above if appropriate.
3. Explain their dosage, generic names, and side effects.
4. Wrap any suggested drug name from our database exactly in brackets, e.g. [Paracetamol 500mg] or [Metformin 850mg].
5. Always advise the patient to consult a doctor. Do not wrap in general markdown code blocks.`

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/chatbot`,
        { message: messageToSend, chat_history: [] },
        { headers: { token } }
      )
      if (data.success && data.data) {
        const replyText = data.data.reply
        const recommendedMeds = []

        medicines.forEach(m => {
          if (replyText.toLowerCase().includes(`[${m.name.toLowerCase()}]`) || replyText.toLowerCase().includes(m.name.toLowerCase())) {
            if (!recommendedMeds.find(x => x._id === m._id)) {
              recommendedMeds.push(m)
            }
          }
        })

        setAiReply({
          text: replyText.replace(/\[/g, '').replace(/\]/g, ''),
          medicines: recommendedMeds
        })
      } else {
        toast.error('AI advisor is currently offline.')
      }
    } catch (err) {
      toast.error('AI advisor is currently offline.')
    } finally {
      setIsAiLoading(false)
    }
  }

  // Trigger AI explanation for a prescription
  const handleExplainPrescription = (rxList) => {
    const rxText = rxList.map(r => `${r.name} (dosage: ${r.dosage}, frequency: ${r.frequency}, duration: ${r.duration})`).join(', ')
    setAiQuery(`Please explain these prescribed medications in detail, highlighting usage, safety warnings, and potential side effects: ${rxText}`)
    setActiveTab('finder')
    // Wait slightly for tab switch, then call advisor
    setTimeout(() => {
      const chatInput = document.getElementById('ai-advisor-input')
      if (chatInput) {
        chatInput.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Check drug interactions using Gemini
  const handleCheckInteractions = async (e) => {
    e.preventDefault()
    const activeDrugs = checkerDrugs.filter(d => d.trim() !== '')
    if (activeDrugs.length < 2) {
      return toast.warn('Please enter at least 2 medicine names to check interactions.')
    }
    setIsCheckerLoading(true)
    setCheckerResult(null)

    const prompt = `You are a clinical pharmacologist and drug safety checker. Analyze the safety and potential drug-drug interactions between: ${activeDrugs.join(', ')}.
    Provide the response in raw JSON format only, matching this structure:
    {
      "severity": "None" | "Mild" | "Moderate" | "Severe",
      "summary": "A short summary of the safety status.",
      "mechanism": "The pharmacological mechanism of the interaction, if any.",
      "precautions": ["precaution 1", "precaution 2"]
    }
    Do not wrap in markdown or backticks. Return valid JSON only.`

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/chatbot`,
        { message: prompt, chat_history: [] },
        { headers: { token } }
      )
      if (data.success && data.data) {
        try {
          const cleaned = data.data.reply.replace(/```json/i, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleaned)
          setCheckerResult(parsed)
        } catch (parseErr) {
          console.error(parseErr)
          toast.error('Failed to parse safety report.')
        }
      }
    } catch (err) {
      toast.error('AI checker service is offline.')
    } finally {
      setIsCheckerLoading(false)
    }
  }

  const addDrugInput = () => {
    if (checkerDrugs.length >= 5) return toast.warn('You can check up to 5 drugs at a time.')
    setCheckerDrugs([...checkerDrugs, ''])
  }

  const removeDrugInput = (index) => {
    if (checkerDrugs.length <= 2) return
    setCheckerDrugs(checkerDrugs.filter((_, i) => i !== index))
  }

  const updateDrugInput = (index, val) => {
    const updated = [...checkerDrugs]
    updated[index] = val
    setCheckerDrugs(updated)
  }

  // Disease mapping with icons and colors
  const diseaseCategories = [
    { id: 'all', label: 'All Conditions', icon: Pill, color: 'bg-zinc-50/50 border-zinc-200/60 dark:bg-zinc-900/40 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400' },
    { id: 'Fever', label: 'Fever & Pain', icon: Thermometer, color: 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/20 text-red-650 dark:text-red-400' },
    { id: 'Diabetes', label: 'Diabetes Care', icon: Activity, color: 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/10 hover:border-orange-500/20 text-orange-650 dark:text-orange-400' },
    { id: 'Hypertension', label: 'Blood Pressure', icon: Heart, color: 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/20 text-rose-650 dark:text-rose-400' },
    { id: 'Bacterial Infections', label: 'Infections', icon: ShieldAlert, color: 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20 text-amber-650 dark:text-amber-400' },
    { id: 'Acidity', label: 'Acidity & Ulcers', icon: Flame, color: 'bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/10 hover:border-yellow-500/20 text-yellow-650 dark:text-yellow-400' },
    { id: 'Allergies', label: 'Allergy & Itch', icon: Sparkles, color: 'bg-teal-500/5 hover:bg-teal-500/10 border-teal-500/10 hover:border-teal-500/20 text-teal-650 dark:text-teal-400' },
    { id: 'Asthma', label: 'Asthma & COPD', icon: Wind, color: 'bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/10 hover:border-sky-500/20 text-sky-650 dark:text-sky-400' }
  ]

  // Category mapping with icons
  const categories = [
    { id: 'all', label: 'All Classes', icon: Pill },
    { id: 'Analgesics & Antipyretics', label: 'Analgesics', icon: Activity },
    { id: 'Antidiabetics', label: 'Antidiabetics', icon: ArrowDownUp },
    { id: 'Antibiotics', label: 'Antibiotics', icon: Sparkles },
    { id: 'Cardiovascular', label: 'Cardiovascular', icon: Heart },
    { id: 'Gastrointestinal', label: 'Gastrointestinal', icon: Flame },
    { id: 'Antihistamines', label: 'Antihistamines', icon: Layers }
  ]

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto py-6 px-4 sm:px-6 relative">
      
      {/* Background glow decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Block */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/60 dark:to-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              <Bot className="w-3.5 h-3.5 text-primary" /> AI Clinical Intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                <Pill className="w-7 h-7" />
              </span> 
              <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-300 bg-clip-text text-transparent">
                Clinical Medicine Finder & Advisor
              </span>
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-xs sm:text-sm font-medium">
              Explore professional drug guides, check drug interactions, and explain physician prescriptions instantly.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex overflow-x-auto no-scrollbar max-w-full p-1 bg-zinc-100/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/40 dark:border-zinc-800/60 rounded-2xl text-xs w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('finder')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'finder' 
                  ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm shadow-zinc-200/50 dark:shadow-none' 
                  : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-200'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              Medicine Finder
            </button>
            <button 
              onClick={() => setActiveTab('checker')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'checker' 
                  ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm shadow-zinc-200/50 dark:shadow-none' 
                  : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Interaction Checker
            </button>
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'prescriptions' 
                  ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm shadow-zinc-200/50 dark:shadow-none' 
                  : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Prescription Explainer
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE PAGE VIEW */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: MEDICINE FINDER */}
          {activeTab === 'finder' && (
            <div className="space-y-6">
              
              {/* Shop by Health Condition */}
              <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/60 p-5 rounded-3xl">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-555 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary animate-pulse" /> Shop by Health Condition
                  </h3>
                  {selectedDisease !== 'all' && (
                    <button 
                      onClick={() => setSelectedDisease('all')}
                      className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {diseaseCategories.map((dis) => {
                    const Icon = dis.icon
                    const isSelected = selectedDisease === dis.id
                    return (
                      <button
                        key={dis.id}
                        onClick={() => {
                          setSelectedDisease(dis.id)
                          setCategory('all') // Reset class category filter
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] duration-250 ${
                          isSelected
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                            : `${dis.color}`
                        }`}
                      >
                        <span className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-white dark:bg-zinc-800 shadow-sm text-primary'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold tracking-tight leading-tight">{dis.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Search and Category Badges */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search medicines by brand name, generic formulation, or disease (e.g. sugar, fever)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
                  />
                </div>

                {/* Categories Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id)
                          setSelectedDisease('all') // Reset condition filter
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                            : 'bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Medicine Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/80 p-5 rounded-2xl h-44 animate-pulse space-y-4" />
                  ))}
                </div>
              ) : medicines.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                  <Pill className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 animate-pulse" />
                  <p className="text-zinc-550 dark:text-zinc-450 text-xs font-bold">No clinical medicines matching filters.</p>
                  <p className="text-zinc-400 text-[10px]">Try expanding your query terms or selection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {medicines.map((med) => (
                    <div 
                      key={med._id} 
                      className="group bg-white dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-5 hover:border-primary/40 dark:hover:border-primary/30 hover:shadow-md hover:shadow-primary/[0.02] hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {med.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-450">
                            Rx Prescription Only
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                          {med.name}
                        </h3>

                        {med.diseases && med.diseases.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {med.diseases.map((d, i) => (
                              <span key={i} className="text-[9px] font-bold bg-primary/5 dark:bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/10">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                          {med.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3.5 border-t border-zinc-100 dark:border-zinc-850">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-zinc-405 font-bold uppercase tracking-wide">Generic Formulation</span>
                          <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                            {med.genericName || "Unspecified"}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedMedicine(med)}
                          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Clinical Guide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DRUG INTERACTION CHECKER */}
          {activeTab === 'checker' && (
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-primary animate-pulse" /> Drug-Drug Interaction Checker
                </h3>
                <p className="text-[10px] text-zinc-400 font-medium">Verify if taking multiple medications concurrently is clinically safe.</p>
              </div>

              <form onSubmit={handleCheckInteractions} className="space-y-4">
                <div className="space-y-2">
                  {checkerDrugs.map((drug, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-450 w-16">Medication {index + 1}:</span>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol, Ibuprofen, Atorvastatin..."
                        value={drug}
                        onChange={e => updateDrugInput(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none dark:text-zinc-100 text-[11px]"
                      />
                      {checkerDrugs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeDrugInput(index)}
                          className="p-2 text-zinc-450 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={addDrugInput}
                    className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl text-[10px] font-bold text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    + Add Medication
                  </button>

                  <button
                    type="submit"
                    disabled={isCheckerLoading}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCheckerLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Check Compatibility
                  </button>
                </div>
              </form>

              {/* Interaction Checker Output Report */}
              {checkerResult && (
                <div className="border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden mt-6 shadow-sm">
                  <div className={`p-4 flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 ${
                    checkerResult.severity === 'Severe' 
                      ? 'bg-red-500/10 text-red-500' 
                      : checkerResult.severity === 'Moderate'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-[11px] uppercase tracking-wider">Severity: {checkerResult.severity}</p>
                      <p className="text-[10px] opacity-90">{checkerResult.summary}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 text-[11px] text-zinc-650 dark:text-zinc-400 bg-zinc-50/20 dark:bg-zinc-950/20">
                    {checkerResult.mechanism && (
                      <div className="space-y-1">
                        <p className="font-bold text-zinc-850 dark:text-zinc-200">Pharmacological Mechanism:</p>
                        <p className="leading-relaxed">{checkerResult.mechanism}</p>
                      </div>
                    )}

                    {checkerResult.precautions && checkerResult.precautions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="font-bold text-zinc-850 dark:text-zinc-200">Clinical Guidelines & Precautions:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {checkerResult.precautions.map((pr, i) => (
                            <li key={i}>{pr}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-xl text-[9px] text-zinc-400 font-bold flex gap-1.5">
                      <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span>Note: This is an automated compatibility analysis. Consult a physician before starting or modifying dosages.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCTOR PRESCRIPTIONS INTEGRATIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
                  <ClipboardList className="w-4.5 h-4.5 text-primary" /> Active Prescription Logs
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold border border-primary/20">
                  {userPrescriptions.length} Records
                </span>
              </div>

              {isPrescLoading ? (
                <div className="py-20 text-center text-xs text-zinc-450 flex flex-col items-center justify-center space-y-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading prescriptions...</span>
                </div>
              ) : userPrescriptions.length === 0 ? (
                <div className="py-16 text-center text-xs text-zinc-450 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-2xl space-y-2">
                  <ClipboardList className="w-8 h-8 mx-auto text-zinc-350 dark:text-zinc-700" />
                  <p className="font-semibold text-zinc-550 dark:text-zinc-450">No consultation prescriptions found.</p>
                  <p className="text-[10px] text-zinc-405">Only completed consultations with prescriptions will show here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userPrescriptions.map((appt) => (
                    <div 
                      key={appt._id} 
                      className="p-5 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl space-y-4 text-xs bg-zinc-50/40 dark:bg-zinc-900/20"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/60 pb-3">
                        <div className="space-y-1">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Prescription ID: #{appt._id.slice(-6)}
                          </p>
                          <p className="text-[10px] text-zinc-455 font-medium">Consulted on {slotDateFormat(appt.slotDate)}</p>
                        </div>
                        <button
                          onClick={() => handleExplainPrescription(appt.prescription)}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Explain with AI
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {appt.prescription.map((rx, idx) => (
                          <div 
                            key={idx} 
                            className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-150/40 dark:border-zinc-800/60 hover:border-zinc-250 dark:hover:border-zinc-700 transition-colors"
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-zinc-800 dark:text-zinc-100">{rx.name}</p>
                              <p className="text-[10px] text-zinc-450">
                                Dosage: <span className="text-zinc-650 dark:text-zinc-300 font-semibold">{rx.dosage}</span> | Frequency: <span className="text-zinc-650 dark:text-zinc-300 font-semibold">{rx.frequency}</span>
                              </p>
                            </div>
                            <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-200/20 dark:border-zinc-750">
                              {rx.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI CLINICAL DRUG EXPLAINER PANEL */}
        <div className="lg:col-span-1">
          <div id="ai-advisor-panel" className="bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
            
            <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <span className="p-2 bg-primary/10 text-primary rounded-xl">
                <Bot className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                  AI Pharmacy Advisor
                </h3>
                <p className="text-[9px] text-zinc-450 font-medium">Describe symptoms to get matched remedies.</p>
              </div>
            </div>

            <form onSubmit={handleAiAdvisor} className="flex gap-2">
              <input
                id="ai-advisor-input"
                type="text"
                placeholder="e.g. Fever, diabetes, joint pain, acidity..."
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955/40 rounded-xl focus:outline-none dark:text-zinc-100 text-[10px]"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl active:scale-[0.96] transition-all cursor-pointer shadow-sm shadow-primary/10"
              >
                {isAiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {aiReply ? (
              <div className="space-y-4 bg-zinc-50/40 dark:bg-zinc-950/30 p-4 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/60 text-[10px] max-h-96 overflow-y-auto no-scrollbar">
                <div className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium space-y-1">
                  <p className="font-bold text-[8px] uppercase tracking-wider text-zinc-405">Diagnosis & Guidance</p>
                  <p className="whitespace-pre-line text-[10px]">{aiReply.text}</p>
                </div>

                {aiReply.medicines && aiReply.medicines.length > 0 && (
                  <div className="space-y-2 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3">
                    <p className="font-bold text-[8px] uppercase tracking-wider text-emerald-500">Available Database Matches</p>
                    <div className="space-y-1.5">
                      {aiReply.medicines.map(med => (
                        <div key={med._id} className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-2 rounded-xl">
                          <div className="space-y-0.5 truncate max-w-[70%]">
                            <p className="font-bold text-zinc-850 dark:text-zinc-150 truncate text-[10px]">{med.name}</p>
                            <p className="text-[8px] text-zinc-450">{med.category}</p>
                          </div>
                          <button
                            onClick={() => setSelectedMedicine(med)}
                            className="px-2.5 py-1 text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg cursor-pointer transition-all"
                          >
                            Guide
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400 text-xs flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-2xl space-y-3">
                <Bot className="w-8 h-8 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                <p className="font-bold text-zinc-500 dark:text-zinc-400">Ask a question to begin</p>
                <p className="text-[8px] text-zinc-400 px-4 leading-normal">
                  Our clinical AI assistant can analyze symptoms, dosage safety, and match them with appropriate catalog solutions.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CLINICAL DETAIL MODAL */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 text-xs text-left shadow-2xl relative">
            
            <div className="flex justify-between items-start border-b border-zinc-150 dark:border-zinc-800 pb-3.5">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 mb-1">
                  {selectedMedicine.category}
                </span>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50">
                  {selectedMedicine.name}
                </h3>
                <p className="text-[10px] text-zinc-450 font-bold">Generic: <span className="text-zinc-750 dark:text-zinc-300 font-black">{selectedMedicine.genericName || "Unspecified"}</span></p>
              </div>
              <button 
                onClick={() => setSelectedMedicine(null)}
                className="text-zinc-405 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Indications */}
              <div className="space-y-1">
                <p className="font-extrabold text-[8px] uppercase tracking-wider text-zinc-400">Clinical Uses & Indications</p>
                <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">
                  {selectedMedicine.description}
                </p>
              </div>

              {/* Side Effects */}
              {selectedMedicine.sideEffects && selectedMedicine.sideEffects.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-extrabold text-[8px] uppercase tracking-wider text-red-500">Possible Side Effects</p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-650 dark:text-zinc-400 leading-normal font-medium">
                    {selectedMedicine.sideEffects.map((se, i) => (
                      <li key={i}>{se}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactions */}
              {selectedMedicine.interactions && selectedMedicine.interactions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-extrabold text-[8px] uppercase tracking-wider text-amber-500">Key Drug Interactions</p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-650 dark:text-zinc-400 leading-normal font-medium">
                    {selectedMedicine.interactions.map((inter, i) => (
                      <li key={i}>{inter}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {selectedMedicine.alternatives && selectedMedicine.alternatives.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-extrabold text-[8px] uppercase tracking-wider text-emerald-500">Generic Brands & Substitutes</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedMedicine.alternatives.map((alt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearch(alt)
                          setSelectedMedicine(null)
                        }}
                        className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 rounded-lg font-bold text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer text-[10px]"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Supplier Info */}
              {selectedMedicine.supplier && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl space-y-1 text-[9px] text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  <p className="font-extrabold text-[8px] uppercase tracking-wider text-zinc-400">Inventory Sourcing Details</p>
                  <p><span className="font-bold text-zinc-700 dark:text-zinc-350">Manufacturer:</span> {selectedMedicine.supplier.name}</p>
                  <p><span className="font-bold text-zinc-700 dark:text-zinc-350">Clinical Category:</span> {selectedMedicine.category}</p>
                  <p><span className="font-bold text-zinc-700 dark:text-zinc-350">Formulation SKU:</span> {selectedMedicine.sku}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-zinc-150 dark:border-zinc-800 pt-3">
              <button 
                onClick={() => setSelectedMedicine(null)}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-primary/10 active:scale-[0.97]"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default PharmacyShop
