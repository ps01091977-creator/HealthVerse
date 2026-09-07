import React, { useContext, useEffect, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Pill, 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  Bot, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Printer, 
  Info, 
  RotateCcw, 
  Check, 
  X, 
  Zap, 
  Heart, 
  Eye, 
  Clock, 
  ClipboardList, 
  FileCheck, 
  ChevronRight, 
  MessageSquare,
  HelpCircle,
  Apple,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Copy
} from 'lucide-react'

const PharmacyShop = () => {
  const { backendUrl, token } = useContext(AppContext)

  // Tabs: 'report' (AI Report Analyzer & RAG), 'checker' (AI Drug Interaction Checker), 'prescriptions' (Doctor Consultation Prescriptions)
  const [activeTab, setActiveTab] = useState('report')

  // --- Report Analyzer State ---
  const [inputMode, setInputMode] = useState('file') // 'file' | 'text'
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [reportText, setReportText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const fileInputRef = useRef(null)

  // --- RAG Chat on Current Report State ---
  const [ragChatHistory, setRagChatHistory] = useState([])
  const [ragQuery, setRagQuery] = useState('')
  const [isRagLoading, setIsRagLoading] = useState(false)
  const chatBottomRef = useRef(null)

  // --- Drug Checker State ---
  const [checkerDrugs, setCheckerDrugs] = useState(['', ''])
  const [checkerResult, setCheckerResult] = useState(null)
  const [isCheckerLoading, setIsCheckerLoading] = useState(false)

  // --- Doctor Prescriptions State ---
  const [userPrescriptions, setUserPrescriptions] = useState([])
  const [isPrescLoading, setIsPrescLoading] = useState(false)

  // Sample Reports for Instant Demo
  const sampleReports = [
    {
      id: 'diabetes',
      title: '🩸 Diabetes & Lipid Profile (HbA1c / Cholesterol)',
      text: `PATIENT: Rohit Sharma | AGE: 45 | GENDER: Male | DATE: 04-Sep-2026
LAB: HealthVerse Metropolis Diagnostics
TEST PARAMETERS:
1. Fasting Blood Sugar (FBS): 158 mg/dL (Normal Range: 70 - 99 mg/dL) [HIGH]
2. Post Prandial Blood Sugar (PPBS): 224 mg/dL (Normal Range: < 140 mg/dL) [HIGH]
3. HbA1c (Glycated Hemoglobin): 7.6 % (Normal Range: < 5.7 %, Diabetic > 6.5 %) [HIGH]
4. Serum Total Cholesterol: 232 mg/dL (Desirable: < 200 mg/dL) [HIGH]
5. Triglycerides: 210 mg/dL (Normal: < 150 mg/dL) [HIGH]
6. HDL Cholesterol (Good): 36 mg/dL (Normal: > 40 mg/dL) [LOW]
7. Serum Creatinine: 0.9 mg/dL (Normal Range: 0.7 - 1.3 mg/dL) [NORMAL]`
    },
    {
      id: 'cbc',
      title: '🔬 Complete Blood Count (CBC & Anemia)',
      text: `PATIENT: Ananya Verma | AGE: 28 | GENDER: Female | DATE: 02-Sep-2026
LAB: HealthVerse Clinical Pathology
TEST PARAMETERS:
1. Hemoglobin (Hb): 9.8 g/dL (Normal Range: 12.0 - 15.5 g/dL) [LOW]
2. Total WBC Count: 12,400 /cumm (Normal Range: 4,000 - 11,000 /cumm) [HIGH]
3. RBC Count: 3.4 million/cumm (Normal Range: 3.8 - 4.8 million/cumm) [LOW]
4. Platelet Count: 165,000 /cumm (Normal Range: 150,000 - 450,000 /cumm) [NORMAL]
5. Packed Cell Volume (PCV): 30.5 % (Normal Range: 36 - 46 %) [LOW]
6. ESR (1st Hour): 34 mm/hr (Normal Range: 0 - 20 mm/hr) [HIGH]`
    },
    {
      id: 'thyroid',
      title: '🦋 Thyroid (TSH) & Vitamin Deficiency',
      text: `PATIENT: Sunita Devi | AGE: 38 | GENDER: Female | DATE: 05-Sep-2026
LAB: HealthVerse Diagnostic Labs
TEST PARAMETERS:
1. TSH (Thyroid Stimulating Hormone): 8.4 uIU/mL (Normal Range: 0.4 - 4.2 uIU/mL) [HIGH]
2. Total T3: 0.8 ng/mL (Normal Range: 0.8 - 2.0 ng/mL) [BORDERLINE LOW]
3. Free T4: 0.72 ng/dL (Normal Range: 0.93 - 1.7 ng/dL) [LOW]
4. Vitamin D (25-OH): 14.2 ng/mL (Deficiency: < 20 ng/mL, Normal: 30 - 100 ng/mL) [LOW]
5. Vitamin B12: 180 pg/mL (Normal Range: 211 - 911 pg/mL) [LOW]`
    },
    {
      id: 'lft',
      title: '🫀 Liver Function (LFT) & Uric Acid',
      text: `PATIENT: Amit Patel | AGE: 52 | GENDER: Male | DATE: 01-Sep-2026
LAB: HealthVerse Diagnostics
TEST PARAMETERS:
1. SGPT / ALT: 72 U/L (Normal Range: 7 - 56 U/L) [HIGH]
2. SGOT / AST: 58 U/L (Normal Range: 10 - 40 U/L) [HIGH]
3. Total Bilirubin: 1.1 mg/dL (Normal Range: 0.2 - 1.2 mg/dL) [NORMAL]
4. Alkaline Phosphatase (ALP): 142 U/L (Normal Range: 44 - 147 U/L) [NORMAL]
5. Serum Uric Acid: 7.8 mg/dL (Normal Range: 3.4 - 7.0 mg/dL) [HIGH]`
    }
  ]

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      return toast.warn('File size exceeds 10MB limit.')
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setFilePreview(ev.target?.result)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  // Load Preset Sample Report
  const handleLoadSample = (sample) => {
    setInputMode('text')
    setReportText(sample.text)
    setSelectedFile(null)
    setFilePreview(null)
    toast.info(`Loaded sample: ${sample.title}`)
  }

  // Clear Report Input
  const handleClear = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setReportText('')
    setAnalysisResult(null)
    setRagChatHistory([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Submit Report for AI Analysis
  const handleAnalyzeReport = async (e) => {
    if (e) e.preventDefault()

    if (inputMode === 'file' && !selectedFile) {
      return toast.warn('Please select a report image or PDF to analyze.')
    }
    if (inputMode === 'text' && !reportText.trim()) {
      return toast.warn('Please enter or paste your medical test text.')
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setRagChatHistory([])

    // Simulated progress steps
    setAnalysisStep('1/4: Reading document & OCR text parsing...')
    const step2Timer = setTimeout(() => setAnalysisStep('2/4: Extracting clinical parameters & reference intervals...'), 1200)
    const step3Timer = setTimeout(() => setAnalysisStep('3/4: Assessing biomarker abnormalities & clinical risk...'), 2400)
    const step4Timer = setTimeout(() => setAnalysisStep('4/4: Generating recommended medicines, diet & doctor guide...'), 3600)

    try {
      const formData = new FormData()
      if (inputMode === 'file' && selectedFile) {
        formData.append('reportFile', selectedFile)
      }
      if (reportText.trim()) {
        formData.append('report_text', reportText)
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/report-rag-analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { token } : {})
          }
        }
      )

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        // Initialize RAG chat greeting
        setRagChatHistory([
          {
            sender: 'ai',
            text: `Hello! I have analyzed **"${data.data.report_title || 'your uploaded medical report'}"**. You can ask me any questions about your test values, suggested medicines, diet, or precautions!`
          }
        ])
        toast.success('🎉 Report analyzed successfully!')
      } else {
        toast.error(data.message || 'Report analysis failed.')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Server error while analyzing medical report.')
    } finally {
      clearTimeout(step2Timer)
      clearTimeout(step3Timer)
      clearTimeout(step4Timer)
      setIsAnalyzing(false)
      setAnalysisStep('')
    }
  }

  // Handle RAG Follow-up Chat Question
  const handleRagChatSubmit = async (e) => {
    e.preventDefault()
    if (!ragQuery.trim()) return
    if (!analysisResult) {
      return toast.warn('Please analyze a report first before asking questions.')
    }

    const userMessage = ragQuery.trim()
    setRagChatHistory(prev => [...prev, { sender: 'user', text: userMessage }])
    setRagQuery('')
    setIsRagLoading(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/report-rag-chat`,
        {
          message: userMessage,
          report_context: analysisResult,
          chat_history: ragChatHistory.slice(-6)
        },
        { headers: token ? { token } : {} }
      )

      if (data.success && data.data) {
        setRagChatHistory(prev => [...prev, { sender: 'ai', text: data.data.reply }])
      } else {
        toast.error('Failed to get answer from AI.')
      }
    } catch (err) {
      console.error(err)
      toast.error('AI chat module offline.')
    } finally {
      setIsRagLoading(false)
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  // Handle Drug Interaction Checker
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
        { headers: token ? { token } : {} }
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
    if (token) {
      fetchUserPrescriptions()
    }
  }, [token])

  // Copy clinical summary to clipboard
  const handleCopySummary = () => {
    if (!analysisResult) return
    const textToCopy = `HEALTHVERSE CLINICAL REPORT ANALYSIS
Report: ${analysisResult.report_title}
Patient: ${analysisResult.patient_name}
Severity: ${analysisResult.severity}
Summary: ${analysisResult.overall_summary}

METRICS:
${analysisResult.metrics?.map(m => `- ${m.name}: ${m.value} ${m.unit} (Ref: ${m.reference_range}) -> [${m.status}]`).join('\n')}

SUGGESTED MEDICATIONS:
${analysisResult.suggested_medicines?.map(m => `- ${m.name} (${m.generic_name}): ${m.dosage_guideline} | ${m.indication}`).join('\n')}`

    navigator.clipboard.writeText(textToCopy)
    toast.success('📋 Clinical report summary copied!')
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto py-6 px-4 sm:px-6 relative">
      
      {/* Background glow decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 🌟 1. HERO BANNER: CLINICAL REPORT AI & SAFETY HUB */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/50 dark:from-zinc-900 dark:via-zinc-950 dark:to-indigo-950 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl text-zinc-900 dark:text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-700 dark:bg-primary/20 dark:text-indigo-300 border border-emerald-500/20 dark:border-primary/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> ISO 15189 Clinical Lab AI & Safety System
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              HealthVerse <span className="bg-gradient-to-r from-primary via-indigo-600 to-teal-600 dark:from-primary dark:via-indigo-300 dark:to-emerald-300 bg-clip-text text-transparent">Clinical Report AI & Medicine Advisor</span>
            </h1>
            
            <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
              Upload blood tests, pathology reports, or prescriptions. Get instant biomarker explanations, abnormal metric badges, tailored medicine suggestions, and interactive RAG report Q&A.
            </p>

            {/* Feature Guarantee Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 px-2.5 py-1.5 rounded-xl shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Multimodal Vision OCR</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 px-2.5 py-1.5 rounded-xl shadow-xs">
                <Activity className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Biomarker High/Low Flags</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 px-2.5 py-1.5 rounded-xl shadow-xs">
                <Pill className="w-3.5 h-3.5 text-primary" />
                <span>Smart Medicine Suggestions</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 px-2.5 py-1.5 rounded-xl shadow-xs">
                <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Interactive RAG Q&A</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl text-xs w-full lg:w-auto flex-shrink-0">
            <button 
              onClick={() => setActiveTab('report')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                activeTab === 'report' 
                  ? 'bg-white dark:bg-zinc-800 text-primary dark:text-white shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Report Analyzer (RAG)
            </button>
            <button 
              onClick={() => setActiveTab('checker')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                activeTab === 'checker' 
                  ? 'bg-white dark:bg-zinc-800 text-primary dark:text-white shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              Drug Checker
            </button>
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                activeTab === 'prescriptions' 
                  ? 'bg-white dark:bg-zinc-800 text-primary dark:text-white shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              My Prescriptions
            </button>
          </div>
        </div>
      </div>

      {/* 📄 TAB 1: AI MEDICAL REPORT ANALYZER & RAG ASSISTANT */}
      {activeTab === 'report' && (
        <div className="space-y-8">
          
          {/* UPLOAD & INPUT WORKSPACE */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 rounded-3xl shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-primary" /> Upload Medical Lab Report or Prescription
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Supports blood test reports, pathology panels (CBC, HbA1c, LFT, KFT, Thyroid), MRI/X-ray summaries, and doctor prescription slips.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    inputMode === 'file' ? 'bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Document / Image
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    inputMode === 'text' ? 'bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Paste Report Text
                </button>
              </div>
            </div>

            {/* Quick Demo Sample Badges */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Demo Samples (Click to test with 1-click):
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleReports.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleLoadSample(sample)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Input Form */}
            <form onSubmit={handleAnalyzeReport} className="space-y-5">
              
              {inputMode === 'file' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="report-file-input"
                  />

                  {!selectedFile ? (
                    <label
                      htmlFor="report-file-input"
                      className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-750 hover:border-primary dark:hover:border-primary rounded-3xl bg-zinc-50/60 dark:bg-zinc-950/40 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all cursor-pointer text-center space-y-3 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          Click to upload or drag & drop your medical report
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Supports JPG, PNG, WEBP, and PDF files (Max 10MB)
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <FileCheck className="w-6 h-6" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-zinc-400">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI extraction</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    placeholder="Paste medical report parameters, test findings, or doctor's prescription text here (e.g. Fasting Sugar: 145 mg/dL, HbA1c: 7.2%, Hemoglobin: 11.0 g/dL)..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-zinc-800 dark:text-zinc-200 font-mono resize-y"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Input
                </button>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/25 disabled:opacity-50 transition-all active:scale-98"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Analyzing Biomarkers...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Report with Clinical AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Animated Analysis Progress Step Indicator */}
              {isAnalyzing && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-xs text-primary flex items-center gap-3 animate-pulse">
                  <Activity className="w-5 h-5 flex-shrink-0 animate-bounce" />
                  <div className="font-semibold">{analysisStep}</div>
                </div>
              )}
            </form>
          </div>

          {/* 📊 RESULTS DASHBOARD */}
          {analysisResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Info & Severity */}
              <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                analysisResult.severity === 'Critical'
                  ? 'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200'
                  : analysisResult.severity === 'Attention Needed'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black">{analysisResult.report_title}</h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      analysisResult.severity === 'Critical'
                        ? 'bg-red-500 text-white border-red-600'
                        : analysisResult.severity === 'Attention Needed'
                        ? 'bg-amber-500 text-zinc-950 border-amber-600'
                        : 'bg-emerald-500 text-white border-emerald-600'
                    }`}>
                      {analysisResult.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 font-medium">
                    Patient: <strong>{analysisResult.patient_name}</strong> • Lab: <strong>{analysisResult.lab_name}</strong> • Date: {analysisResult.test_date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="px-3.5 py-2 bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold shadow-xs hover:bg-white cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Summary
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary-dark cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary & Detected Conditions */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Executive Clinical Assessment
                </h4>
                
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-line">
                  {analysisResult.overall_summary}
                </p>

                {analysisResult.conditions_detected?.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500">Key Clinical Indications:</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {analysisResult.conditions_detected.map((cond, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-xl border border-primary/20">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Parameters & Biomarkers Table */}
              {analysisResult.metrics?.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4 overflow-hidden">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Extracted Parameters & Measured Reference Values
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                          <th className="pb-3 px-2">Parameter Name</th>
                          <th className="pb-3 px-2">Measured Value</th>
                          <th className="pb-3 px-2">Reference Range</th>
                          <th className="pb-3 px-2">Status</th>
                          <th className="pb-3 px-2">Clinical Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                        {analysisResult.metrics.map((m, idx) => {
                          const isHigh = m.status === 'High' || m.status === 'Critical'
                          const isLow = m.status === 'Low'
                          const isNormal = m.status === 'Normal'

                          return (
                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors">
                              <td className="py-3 px-2 font-bold text-zinc-900 dark:text-white">
                                {m.name}
                              </td>
                              <td className="py-3 px-2 font-black text-sm">
                                <span className={isHigh ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-500'}>
                                  {m.value} {m.unit}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                {m.reference_range} {m.unit}
                              </td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                  isHigh
                                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                                    : isLow
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {isHigh && <TrendingUp className="w-3 h-3" />}
                                  {isLow && <TrendingDown className="w-3 h-3" />}
                                  {isNormal && <Check className="w-3 h-3" />}
                                  {m.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-zinc-600 dark:text-zinc-300 font-normal max-w-xs">
                                {m.explanation}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. 💊 Suggested Medicines Section */}
              {analysisResult.suggested_medicines?.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary" /> Recommended Standard Medications & Care Plan
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Evidence-based pharmacological formulations matching the detected diagnostic biomarkers.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Doctor Consultation Mandatory for Rx
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysisResult.suggested_medicines.map((med, idx) => (
                      <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-sm text-zinc-900 dark:text-white">{med.name}</h5>
                              <p className="text-[11px] text-primary font-semibold">{med.generic_name} • {med.category}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                              med.requires_prescription 
                                ? 'bg-red-500 text-white' 
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {med.requires_prescription ? 'Rx Required' : 'OTC'}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-xs space-y-1">
                            <p className="text-zinc-500 font-semibold text-[10px] uppercase">Dosage Guideline:</p>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">{med.dosage_guideline}</p>
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-300">
                            <strong>Indication:</strong> {med.indication}
                          </p>

                          {med.precautions && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              ⚠️ <strong>Caution:</strong> {med.precautions}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('checker')
                            setCheckerDrugs([med.name, ''])
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                            toast.info(`Checking interactions for ${med.name}`)
                          }}
                          className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5" /> Check Drug Interactions
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. 🥗 Diet, Lifestyle & Doctor Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Diet & Nutrition */}
                {analysisResult.diet_and_lifestyle && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <Apple className="w-4 h-4 text-emerald-500" /> Dietary & Lifestyle Recovery Plan
                    </h4>

                    {analysisResult.diet_and_lifestyle.foods_to_eat?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Foods to Eat:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                          {analysisResult.diet_and_lifestyle.foods_to_eat.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.diet_and_lifestyle.foods_to_avoid?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-red-500 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Foods to Avoid:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                          {analysisResult.diet_and_lifestyle.foods_to_avoid.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.diet_and_lifestyle.daily_tips?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-primary flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> Daily Wellness Tips:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                          {analysisResult.diet_and_lifestyle.daily_tips.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Questions for Doctor */}
                {analysisResult.questions_for_doctor?.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Smart Questions to Ask Your Doctor
                    </h4>

                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                      Take these clinical questions to your doctor consultation to discuss your report findings with clarity:
                    </p>

                    <div className="space-y-2">
                      {analysisResult.questions_for_doctor.map((q, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. 💬 INTERACTIVE RAG Q&A ON THIS REPORT */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" /> Interactive RAG Assistant: Ask Questions on this Report
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Chat directly with our clinical AI about any specific metric, safe foods, symptoms, or medication doubts in this report.
                    </p>
                  </div>
                </div>

                {/* Chat History Box */}
                <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 text-xs">
                  {ragChatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xl p-3.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200/80 dark:border-zinc-800 shadow-xs'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-line font-medium">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isRagLoading && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-white dark:bg-zinc-900 text-primary rounded-2xl rounded-bl-none border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2">
                        <Bot className="w-4 h-4 animate-bounce" />
                        <span className="text-xs font-semibold">Consulting clinical context...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleRagChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask anything about your report (e.g. 'Can I drink tea with this sugar level?', 'What causes high ESR?')..."
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-zinc-800 dark:text-zinc-200"
                  />
                  <button
                    type="submit"
                    disabled={isRagLoading || !ragQuery.trim()}
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Ask
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 🧪 TAB 2: AI DRUG INTERACTION & SAFETY CHECKER (RETAINED) */}
      {activeTab === 'checker' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-2 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">AI Drug Interaction & Safety Checker</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Check potential adverse drug-drug interactions, contraindications, and clinical safety precautions before taking multiple medications.
              </p>
            </div>

            <form onSubmit={handleCheckInteractions} className="space-y-4">
              <div className="space-y-3">
                {checkerDrugs.map((drug, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-bold text-zinc-400">#{index + 1}</span>
                    <input
                      id={`checker-drug-input-${index}`}
                      name={`drugInput_${index}`}
                      type="text"
                      placeholder={`Enter medicine name (e.g. ${index === 0 ? 'Aspirin 75mg' : 'Warfarin 5mg'})`}
                      value={drug}
                      onChange={(e) => updateDrugInput(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-zinc-800 dark:text-zinc-200"
                    />
                    {checkerDrugs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeDrugInput(index)}
                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                {checkerDrugs.length < 5 && (
                  <button
                    type="button"
                    onClick={addDrugInput}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Medicine
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isCheckerLoading}
                  className="ml-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isCheckerLoading ? 'Analyzing Pharmacology...' : 'Check Interactions'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Checker Result Report */}
            {checkerResult && (
              <div className={`p-5 rounded-2xl border space-y-3 ${
                checkerResult.severity === 'Severe' 
                  ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300' 
                  : checkerResult.severity === 'Moderate'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Interaction Severity: {checkerResult.severity}
                  </h4>
                </div>
                <p className="text-xs leading-relaxed font-medium">{checkerResult.summary}</p>
                {checkerResult.mechanism && (
                  <div className="text-xs space-y-1 pt-2 border-t border-current/20">
                    <span className="font-bold">Mechanism:</span>
                    <p className="opacity-90">{checkerResult.mechanism}</p>
                  </div>
                )}
                {checkerResult.precautions?.length > 0 && (
                  <div className="text-xs space-y-1 pt-2 border-t border-current/20">
                    <span className="font-bold">Precautions:</span>
                    <ul className="list-disc list-inside space-y-0.5 opacity-90">
                      {checkerResult.precautions.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📋 TAB 3: DOCTOR CONSULTATION PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" /> E-Prescriptions from Doctor Consultations
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Access digital prescriptions issued by HealthVerse verified doctors and analyze them directly with AI.
                </p>
              </div>
            </div>

            {isPrescLoading ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse h-32" />
                ))}
              </div>
            ) : userPrescriptions.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="w-10 h-10 mx-auto text-zinc-400" />
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No consultation prescriptions found.</p>
                <p className="text-xs text-zinc-400">Once a doctor completes your appointment and issues an e-prescription, it will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPrescriptions.map((appt) => (
                  <div key={appt._id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{appt.docData?.name || 'Consulting Specialist'}</h4>
                        <p className="text-xs text-zinc-500">{appt.docData?.speciality} • Date: {appt.slotDate}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-full">
                        Verified Consultation
                      </span>
                    </div>

                    {/* Prescribed Drugs List */}
                    <div className="space-y-2 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Prescribed Medications:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {appt.prescription.map((rx, rIdx) => (
                          <div key={rIdx} className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200/50 dark:border-zinc-800 text-xs flex justify-between items-center">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{rx.name}</p>
                              <p className="text-[10px] text-zinc-500">{rx.dosage} • {rx.frequency} • {rx.duration}</p>
                            </div>
                            <button
                              onClick={() => {
                                setInputMode('text')
                                setReportText(`PRESCRIPTION DETAILS:\nDoctor: ${appt.docData?.name}\nDate: ${appt.slotDate}\nMedicine: ${rx.name} (${rx.dosage}, ${rx.frequency}, Duration: ${rx.duration})\nNotes: ${appt.notes || 'Routine consultation'}`)
                                setActiveTab('report')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                toast.info(`Loaded ${rx.name} prescription into AI Analyzer`)
                              }}
                              className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> Analyze with AI
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default PharmacyShop
