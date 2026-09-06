import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  Bot, 
  Sparkles, 
  Pill, 
  Apple, 
  FileText, 

  Send, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  ChevronRight, 
  HelpCircle,
  Clock
} from 'lucide-react'

import AiVoiceChat from '../components/AiVoiceChat'

const AiHub = () => {
  const { backendUrl, token } = useContext(AppContext)

  // Sub-modules navigation
  const [activeModule, setActiveModule] = useState('chatbot') // 'chatbot', 'medicine', 'diet', 'reports'

  // Chatbot State
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Hello! I am your clinical AI assistant. How can I help you today?' }
  ])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Medicine State
  const [medQuery, setMedQuery] = useState('')
  const [medResult, setMedResult] = useState(null)
  const [isMedLoading, setIsMedLoading] = useState(false)

  // Diet State
  const [dietConditions, setDietConditions] = useState([])
  const [dietGoal, setDietGoal] = useState('')
  const [dietResult, setDietResult] = useState(null)
  const [isDietLoading, setIsDietLoading] = useState(false)

  // Reports State
  const [reportText, setReportText] = useState('')
  const [reportResult, setReportResult] = useState(null)
  const [isReportLoading, setIsReportLoading] = useState(false)

  const predefinedConditions = [
    'Diabetes Type-2',
    'Hypertension',
    'High Cholesterol',
    'Acid Reflux (GERD)',
    'General Weight Management'
  ]

  const handleToggleCondition = (cond) => {
    if (dietConditions.includes(cond)) {
      setDietConditions(dietConditions.filter(c => c !== cond))
    } else {
      setDietConditions([...dietConditions, cond])
    }
  }

  // API 1: Chatbot
  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    const userMsg = { sender: 'user', text: chatMessage }
    setChatHistory(prev => [...prev, userMsg])
    setChatMessage('')
    setIsChatLoading(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/chatbot`,
        { message: chatMessage, chat_history: chatHistory.slice(-6) },
        { headers: { token } }
      )
      if (data.success && data.data) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.data.reply }])
      } else {
        toast.error('Failed to retrieve reply.')
      }
    } catch (err) {
      toast.error('AI chat module is currently offline.')
    } finally {
      setIsChatLoading(false)
    }
  }

  // API 2: Medicine Info
  const handleMedSearch = async (e) => {
    e.preventDefault()
    if (!medQuery.trim()) return
    setIsMedLoading(true)
    setMedResult(null)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/medicine-info`,
        { medicine_name: medQuery },
        { headers: { token } }
      )
      if (data.success && data.data) {
        setMedResult(data.data)
      }
    } catch (err) {
      toast.error('Medicine info module offline.')
    } finally {
      setIsMedLoading(false)
    }
  }

  // API 3: Diet & Nutrition
  const handleDietSubmit = async (e) => {
    e.preventDefault()
    setIsDietLoading(true)
    setDietResult(null)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/diet-nutrition`,
        { health_conditions: dietConditions, goals: dietGoal || 'Balanced health' },
        { headers: { token } }
      )
      if (data.success && data.data) {
        setDietResult(data.data)
      }
    } catch (err) {
      toast.error('Diet Planner offline.')
    } finally {
      setIsDietLoading(false)
    }
  }

  // API 4: Report summary
  const handleReportSubmit = async (e) => {
    e.preventDefault()
    if (!reportText.trim()) return
    setIsReportLoading(true)
    setReportResult(null)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/report-summary`,
        { report_text: reportText },
        { headers: { token } }
      )
      if (data.success && data.data) {
        setReportResult(data.data)
      }
    } catch (err) {
      toast.error('Report summary offline.')
    } finally {
      setIsReportLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto py-4">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Bot className="w-6.5 h-6.5 text-primary" /> HealthVerse Clinical Hub
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs">Access clinical chatbot models, pharmaceutical libraries, and diet planners.</p>
        </div>

        {/* Navigation Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
          <button 
            onClick={() => setActiveModule('chatbot')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeModule === 'chatbot' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary' : 'text-zinc-500'
            }`}
          >
            Wellness Chat
          </button>
          <button 
            onClick={() => setActiveModule('medicine')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeModule === 'medicine' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary' : 'text-zinc-500'
            }`}
          >
            Medicine Library
          </button>
          <button 
            onClick={() => setActiveModule('diet')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeModule === 'diet' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary' : 'text-zinc-500'
            }`}
          >
            Diet Planner
          </button>
          <button 
            onClick={() => setActiveModule('reports')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeModule === 'reports' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary' : 'text-zinc-500'
            }`}
          >
            Report Summarizer
          </button>
        </div>
      </div>

      {/* Main workspace cards */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[50vh] flex flex-col">
        
        {/* MODULE 1: CONVERSATIONAL VOICE & RAG CHATBOT */}
        {activeModule === 'chatbot' && (
          <div className="w-full">
            <AiVoiceChat mode="page" />
          </div>
        )}

        {/* MODULE 2: MEDICINE LIBRARY */}
        {activeModule === 'medicine' && (
          <div className="space-y-6">
            <form onSubmit={handleMedSearch} className="flex gap-2 max-w-md">
              <input
                id="med-search-input"
                name="medQuery"
                type="text"
                placeholder="Enter medicine name (e.g. Metformin, Paracetamol)..."
                value={medQuery}
                onChange={(e) => setMedQuery(e.target.value)}
                className="flex-1 p-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl text-xs focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={isMedLoading}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                {isMedLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {medResult && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 max-w-xl text-xs bg-zinc-50/50">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                    <Pill className="w-4 h-4 text-primary" /> {medQuery} Synthesis
                  </h3>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Clinical Description</span>
                    <p className="text-zinc-700 mt-1 leading-relaxed">{medResult.description}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Side Effects</span>
                    <ul className="list-disc list-inside space-y-0.5 text-zinc-600 mt-1 pl-1">
                      {medResult.side_effects?.map((se, idx) => <li key={idx}>{se}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Typical Dosage Recommendation</span>
                    <p className="text-zinc-700 mt-1 leading-relaxed italic">"{medResult.typical_dosage}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE 3: DIET PLANNER */}
        {activeModule === 'diet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Planner setup */}
            <div className="md:col-span-1 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-zinc-600">Select Clinical Conditions:</label>
                <div className="flex flex-col gap-1.5">
                  {predefinedConditions.map(cond => {
                    const isChecked = dietConditions.includes(cond)
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => handleToggleCondition(cond)}
                        className={`text-left p-2 border rounded-xl font-semibold cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-primary/10 border-primary/20 text-primary' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-650'
                        }`}
                      >
                        {cond}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="diet-goal-input" className="font-bold text-zinc-600">What are your health goals?</label>
                <input
                  id="diet-goal-input"
                  name="dietGoal"
                  type="text"
                  placeholder="e.g. Lose weight, stabilize insulin levels"
                  value={dietGoal}
                  onChange={(e) => setDietGoal(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleDietSubmit}
                disabled={isDietLoading}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {isDietLoading ? 'Generating Diet...' : 'Generate Diet Plan'}
              </button>
            </div>

            {/* Results */}
            <div className="md:col-span-2 space-y-4 text-xs">
              {dietResult ? (
                <div className="border border-zinc-250/50 p-5 rounded-2xl bg-zinc-50/50 space-y-4">
                  <div className="border-b pb-2 flex items-center gap-1.5">
                    <Apple className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="font-extrabold text-zinc-900">Personalized Nutrition Framework</h4>
                      <p className="text-[9px] text-zinc-400">Customized according to select parameters.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Recommended Foods</span>
                      <ul className="list-disc list-inside space-y-0.5 text-zinc-650 mt-1 pl-1">
                        {dietResult.recommended_foods?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Foods to Limit / Avoid</span>
                      <ul className="list-disc list-inside space-y-0.5 text-zinc-650 mt-1 pl-1">
                        {dietResult.avoid_foods?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/50">
                    <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Single-Day Meal Schedule</span>
                    <p className="text-zinc-700 mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-zinc-200/50 italic">
                      "{dietResult.meal_plan_suggestion}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-400 border border-dashed rounded-2xl flex flex-col items-center justify-center">
                  <Apple className="w-6 h-6 mb-2" />
                  Your personalized nutritional guidelines will show here.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 4: REPORT SUMMARIZER */}
        {activeModule === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Paste box */}
            <div className="md:col-span-1 space-y-3 text-xs">
              <label className="font-bold text-zinc-650">Paste Diagnostic Report Text:</label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Paste metrics results (e.g. Glucose: 110 mg/dL, Hemoglobin: 14.2 g/dL, Cholesterol: 210 mg/dL)..."
                className="w-full h-44 p-2 bg-white border border-zinc-200 rounded-xl focus:outline-none text-[11px]"
              />
              <button
                onClick={handleReportSubmit}
                disabled={isReportLoading}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {isReportLoading ? 'Analyzing Report...' : 'Analyze Lab Report'}
              </button>
            </div>

            {/* Results */}
            <div className="md:col-span-2 space-y-4 text-xs">
              {reportResult ? (
                <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl bg-zinc-50/50 space-y-4">
                  <div className="border-b pb-2 flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-extrabold text-zinc-900">Lab Analysis Assessment</h4>
                      <p className="text-[9px] text-zinc-400">Summarized markers logs.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Clinical Synthesis</span>
                      <p className="text-zinc-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border italic">"{reportResult.summary}"</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider text-red-500">Abnormal / Low Markers</span>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-650 mt-1 pl-1">
                          {reportResult.abnormal_values?.map((v, i) => <li key={i}>{v}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider text-emerald-500">Key Scientific Findings</span>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-650 mt-1 pl-1">
                          {reportResult.key_findings?.map((v, i) => <li key={i}>{v}</li>)}
                        </ul>
                      </div>
                    </div>

                    {reportResult.recommended_questions && (
                      <div className="pt-2 border-t">
                        <span className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-505" /> Questions to Ask Doctor
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-600 mt-1.5 pl-1">
                          {reportResult.recommended_questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-400 border border-dashed rounded-2xl flex flex-col items-center justify-center">
                  <FileText className="w-6 h-6 mb-2" />
                  Your analyzed diagnostic metrics summaries will show here.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AiHub
