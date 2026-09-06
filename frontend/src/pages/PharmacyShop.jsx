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
  ArrowDownUp,
  ShoppingCart,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Truck,
  Award,
  Zap,
  Tag,
  ChevronRight,
  BadgePercent,
  Star
} from 'lucide-react'

const PharmacyShop = () => {
  const { backendUrl, token } = useContext(AppContext)

  // Sub-sections navigation: 'store' (Medicine Store & Catalog), 'checker' (Drug Interaction Checker), 'prescriptions' (Doctor Prescriptions)
  const [activeTab, setActiveTab] = useState('store')

  // Catalog State
  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedDisease, setSelectedDisease] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Clinical Guide Modal
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  // Cart State
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderSuccessModal, setOrderSuccessModal] = useState(null)

  // Drug Interaction Checker State
  const [checkerDrugs, setCheckerDrugs] = useState(['', ''])
  const [checkerResult, setCheckerResult] = useState(null)
  const [isCheckerLoading, setIsCheckerLoading] = useState(false)

  // Consultation Prescriptions State
  const [userPrescriptions, setUserPrescriptions] = useState([])
  const [isPrescLoading, setIsPrescLoading] = useState(false)

  // AI Advisor State
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

  // Cart Management
  const addToCart = (med) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === med._id)
      if (existing) {
        return prev.map(item => item._id === med._id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...med, quantity: 1 }]
    })
    toast.success(`Added ${med.name} to cart!`, { autoClose: 1800 })
  }

  const updateCartQuantity = (medId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item._id === medId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)
    })
  }

  const removeFromCart = (medId) => {
    setCart(prev => prev.filter(item => item._id !== medId))
  }

  // Calculate totals
  const subtotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalMrp = cart.reduce((sum, item) => sum + ((item.mrp || item.price * 1.2) * item.quantity), 0)
  const totalSavings = Math.max(0, Math.round(totalMrp - subtotalPrice))
  const deliveryFee = subtotalPrice >= 299 || subtotalPrice === 0 ? 0 : 40
  const finalPayable = subtotalPrice + deliveryFee
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Handle Checkout Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!token) {
      toast.warn('Please sign in to your patient account to place orders.')
      return
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty.')
      return
    }
    if (!deliveryAddress.trim() || !deliveryPhone.trim()) {
      toast.warn('Please enter complete delivery address and phone number.')
      return
    }

    setIsPlacingOrder(true)
    try {
      const orderPayload = {
        patientName: 'Patient User',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          packSize: item.packSize || 'Standard Pack'
        })),
        totalAmount: finalPayable,
        paymentMethod,
        phone: deliveryPhone,
        address: deliveryAddress,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'
      }

      const { data } = await axios.post(`${backendUrl}/api/pharmacy/order`, orderPayload, {
        headers: { token }
      })

      if (data.success) {
        setOrderSuccessModal({
          orderId: `HV-MED-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: finalPayable,
          itemsCount: totalCartCount,
          address: deliveryAddress,
          paymentMethod
        })
        setCart([])
        setIsCartOpen(false)
        toast.success('🎉 Pharmacy order placed successfully!')
      } else {
        toast.error(data.message || 'Order placement failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error while placing order.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // AI Pharmacy Advisor call
  const handleAiAdvisor = async (e) => {
    if (e) e.preventDefault()
    if (!aiQuery.trim()) return
    setIsAiLoading(true)
    setAiReply(null)

    const medsContext = medicines.map(m => `- ${m.name} (${m.category}): treats ${m.diseases.join(', ')}. Generic name: ${m.genericName || m.name}`).join('\n')

    const messageToSend = `CONTEXT: You are the HealthVerse Clinical Medicine Advisor. You have access to our medical database:
${medsContext}

USER ENQUIRY: ${aiQuery}

INSTRUCTIONS:
1. Provide a professional, concise, clinical analysis of the symptoms or questions.
2. Recommend the matching drug name(s) from our database above if appropriate.
3. Explain their dosage, generic names, and side effects.
4. Wrap any suggested drug name from our database exactly in brackets, e.g. [Dolo 650mg Tablet] or [Augmentin 625 Duo Tablet].
5. Always advise the patient to consult a doctor. Do not wrap in general markdown code blocks.`

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/chatbot`,
        { message: messageToSend, chat_history: [] },
        { headers: token ? { token } : {} }
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

  // Disease mapping with icons and colors
  const diseaseCategories = [
    { id: 'all', label: 'All Health Categories', icon: Pill, color: 'border-zinc-200 dark:border-zinc-800' },
    { id: 'Fever', label: 'Fever & Pain Relief', icon: Thermometer, color: 'text-red-500 bg-red-500/5 border-red-500/20' },
    { id: 'Diabetes', label: 'Diabetes & Glucose', icon: Activity, color: 'text-orange-500 bg-orange-500/5 border-orange-500/20' },
    { id: 'Hypertension', label: 'Cardiac & BP', icon: Heart, color: 'text-rose-500 bg-rose-500/5 border-rose-500/20' },
    { id: 'Bacterial Infections', label: 'Antibiotics & Throat', icon: ShieldAlert, color: 'text-amber-500 bg-amber-500/5 border-amber-500/20' },
    { id: 'Acidity', label: 'Acidity & Digestion', icon: Flame, color: 'text-yellow-600 bg-yellow-500/5 border-yellow-500/20' },
    { id: 'Allergies', label: 'Allergy & Cold', icon: Sparkles, color: 'text-teal-500 bg-teal-500/5 border-teal-500/20' },
    { id: 'Asthma', label: 'Asthma & Wheezing', icon: Wind, color: 'text-sky-500 bg-sky-500/5 border-sky-500/20' }
  ]

  // Category mapping
  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'Pain Relief & Fever', label: 'Pain & Fever' },
    { id: 'Antibiotics & Infections', label: 'Antibiotics' },
    { id: 'Acidity & Digestion', label: 'Acidity & Gut' },
    { id: 'Cardiac & BP', label: 'Cardiac & BP' },
    { id: 'Diabetes & Chronic Care', label: 'Diabetes Care' },
    { id: 'Vitamins & Immunity', label: 'Vitamins & Minerals' },
    { id: 'Allergies & Respiratory', label: 'Allergies & Cold' },
    { id: 'Skin & Hair Care', label: 'Dermatology & Skin' },
    { id: 'Medical Devices & Diagnostics', label: 'Medical Devices' }
  ]

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto py-6 px-4 sm:px-6 relative">
      
      {/* Background glow decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 🌟 1. HERO BANNER: TRUST & CERTIFICATION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xl text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/20 text-indigo-300 border border-primary/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 9001:2015 Certified Pharmacy Network
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              HealthVerse <span className="bg-gradient-to-r from-primary via-indigo-300 to-emerald-300 bg-clip-text text-transparent">e-Pharmacy & Diagnostic Hub</span>
            </h1>
            
            <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
              100% Genuine, verified medications sourced directly from top pharmaceutical manufacturers (GSK, Abbott, Sun Pharma, Cipla, Pfizer). Delivered in temperature-controlled packaging.
            </p>

            {/* Guarantee Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>⚡ 2-Hr Express Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Genuine Certified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                <BadgePercent className="w-3.5 h-3.5 text-primary" />
                <span>Up to 25% Off MRP</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pharmacist Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Cart Status & Tab Switcher */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto flex-shrink-0">
            {/* View Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center justify-between gap-4 bg-primary hover:bg-primary-dark text-white px-5 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>My Pharmacy Cart</span>
              </div>
              <span className="bg-white text-primary text-xs px-2.5 py-0.5 rounded-full font-black">
                {totalCartCount} items • ₹{finalPayable}
              </span>
            </button>

            {/* Navigation Tabs */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl text-xs">
              <button 
                onClick={() => setActiveTab('store')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                  activeTab === 'store' 
                    ? 'bg-white text-zinc-950 shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                Medicine Store
              </button>
              <button 
                onClick={() => setActiveTab('checker')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                  activeTab === 'checker' 
                    ? 'bg-white text-zinc-950 shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Drug Checker
              </button>
              <button 
                onClick={() => setActiveTab('prescriptions')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                  activeTab === 'prescriptions' 
                    ? 'bg-white text-zinc-950 shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                My Prescriptions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🛍️ TAB 1: MEDICINE STORE & CATALOG */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          
          {/* Health Category Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" /> Filter by Health Condition
              </h3>
              {selectedDisease !== 'all' && (
                <button 
                  onClick={() => setSelectedDisease('all')}
                  className="text-xs text-primary hover:underline font-bold cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {diseaseCategories.map((dis) => {
                const Icon = dis.icon
                const isSelected = selectedDisease === dis.id
                return (
                  <button
                    key={dis.id}
                    onClick={() => {
                      setSelectedDisease(dis.id)
                      setCategory('all')
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.03]'
                        : `bg-zinc-50 dark:bg-zinc-850/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${dis.color}`
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold leading-tight line-clamp-1">{dis.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search and Category Badges */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                id="pharmacy-search-input"
                name="pharmacySearch"
                type="text"
                placeholder="Search by brand name (Dolo, Augmentin, Pan-D), active salt (Paracetamol, Metformin), or manufacturer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-800 dark:text-zinc-200 shadow-sm"
              />
            </div>

            {/* Categories Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
              {categories.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id)
                      setSelectedDisease('all')
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl h-72 animate-pulse space-y-3" />
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3 bg-white dark:bg-zinc-900">
              <Pill className="w-10 h-10 mx-auto text-zinc-400 animate-pulse" />
              <p className="text-zinc-700 dark:text-zinc-300 text-sm font-bold">No medicines matching your search.</p>
              <p className="text-zinc-400 text-xs">Try clearing filters or search by salt name (e.g. Paracetamol, Metformin, Telmisartan).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {medicines.map((med) => {
                const inCart = cart.find(item => item._id === med._id)
                const discountVal = med.discount || Math.round(((med.mrp - med.price) / (med.mrp || 1)) * 100) || 15

                return (
                  <div 
                    key={med._id} 
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl transition-all duration-300 relative"
                  >
                    {/* Top Image & Badges */}
                    <div className="space-y-3">
                      <div className="relative w-full h-40 bg-zinc-50 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-850 flex items-center justify-center p-2">
                        <img 
                          src={med.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop"} 
                          alt={med.name}
                          className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Rx vs OTC Badge */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {med.requiresPrescription ? (
                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                              Rx Required
                            </span>
                          ) : (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                              OTC
                            </span>
                          )}
                        </div>

                        {/* Discount Badge */}
                        {discountVal > 0 && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
                            <Tag className="w-3 h-3" /> {discountVal}% OFF
                          </div>
                        )}
                      </div>

                      {/* Brand, Manufacturer & Rating */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="font-semibold text-primary truncate max-w-[140px]">{med.manufacturer || 'Certified Pharma'}</span>
                          <span className="flex items-center gap-0.5 font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {med.rating || 4.8}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors line-clamp-1">
                          {med.name}
                        </h3>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 font-medium">
                          {med.composition || med.genericName}
                        </p>

                        <p className="text-[10px] text-zinc-400">
                          {med.packSize || 'Standard Pack'} • {med.dosageForm || 'Tablet'}
                        </p>
                      </div>
                    </div>

                    {/* Price, Stock & Cart Actions */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                            ₹{med.price}
                          </span>
                          {med.mrp > med.price && (
                            <span className="text-xs text-zinc-400 line-through">
                              ₹{med.mrp}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedMedicine(med)}
                          className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5 text-primary" /> Guide
                        </button>

                        {inCart ? (
                          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-2 py-1 text-xs font-bold text-primary">
                            <button 
                              onClick={() => updateCartQuantity(med._id, -1)}
                              className="p-1 hover:bg-primary/20 rounded-md cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span>{inCart.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(med._id, 1)}
                              className="p-1 hover:bg-primary/20 rounded-md cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(med)}
                            className="w-full py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-98"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 🧪 TAB 2: AI DRUG INTERACTION & SAFETY CHECKER */}
      {activeTab === 'checker' && (
        <div className="max-w-3xl mx-auto space-y-6">
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" /> E-Prescriptions from Doctor Consultations
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Access digital prescriptions issued by HealthVerse verified doctors and add prescribed medications to cart in 1 click.
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
                                const matchingMed = medicines.find(m => m.name.toLowerCase().includes(rx.name.toLowerCase()) || rx.name.toLowerCase().includes(m.name.toLowerCase()))
                                if (matchingMed) {
                                  addToCart(matchingMed)
                                } else {
                                  toast.info(`Added ${rx.name} to pharmacy order list.`)
                                }
                              }}
                              className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md hover:bg-primary-dark cursor-pointer"
                            >
                              + Add to Cart
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

      {/* 🛒 4. SLIDE-OUT CART & CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-zinc-200 dark:border-zinc-800 animate-slideLeft">
            
            {/* Cart Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">Pharmacy Cart ({totalCartCount})</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingCart className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 animate-bounce" />
                  <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Your cart is currently empty.</p>
                  <p className="text-xs text-zinc-400">Browse verified medicines and add items to begin checkout.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">{item.name}</h4>
                        <p className="text-[10px] text-zinc-400">{item.packSize || 'Strip of 10'} • ₹{item.price} each</p>
                        <p className="text-xs font-extrabold text-primary mt-1">₹{item.price * item.quantity}</p>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1 text-xs font-bold">
                        <button 
                          onClick={() => updateCartQuantity(item._id, -1)}
                          className="p-1 hover:text-primary cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item._id, 1)}
                          className="p-1 hover:text-primary cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Free Delivery Bar */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                    <Truck className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {subtotalPrice >= 299 
                        ? '🎉 You unlocked FREE Express Delivery!' 
                        : `Add ₹${299 - subtotalPrice} more for FREE Express Delivery!`}
                    </span>
                  </div>

                  {/* Checkout Form */}
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider">Delivery Details</h4>
                    
                    <div>
                      <label htmlFor="pharmacy-delivery-address" className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Delivery Address</label>
                      <input
                        id="pharmacy-delivery-address"
                        name="deliveryAddress"
                        autoComplete="street-address"
                        type="text"
                        placeholder="House/Flat No, Street, City, Pincode"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="pharmacy-delivery-phone" className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Phone Number</label>
                      <input
                        id="pharmacy-delivery-phone"
                        name="deliveryPhone"
                        autoComplete="tel"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Payment Mode</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                      >
                        <option value="Cash on Delivery">💵 Cash on Delivery (Pay at doorstep)</option>
                        <option value="Online UPI / Cards">⚡ Instant UPI / Credit & Debit Cards</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary & Order CTA */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Total MRP:</span>
                    <span className="line-through">₹{totalMrp}</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Discount Savings:</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Express Delivery:</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-500 font-bold">FREE</strong> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Final Payable:</span>
                    <span className="text-primary text-base">₹{finalPayable}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isPlacingOrder ? 'Confirming Order...' : `Place Order (₹${finalPayable})`} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📄 5. CLINICAL INFORMATION & SUBSTANCE GUIDE MODAL */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-left relative animate-scaleUp">
            
            <button
              onClick={() => setSelectedMedicine(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <img 
                src={selectedMedicine.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop"} 
                alt={selectedMedicine.name} 
                className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {selectedMedicine.category}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{selectedMedicine.name}</h3>
                <p className="text-xs text-zinc-500 font-semibold">{selectedMedicine.manufacturer} • {selectedMedicine.packSize}</p>
                <p className="text-xs font-extrabold text-primary">₹{selectedMedicine.price} <span className="line-through text-zinc-400 font-normal ml-1">₹{selectedMedicine.mrp}</span></p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white">Active Composition & Salt:</span>
                <p className="text-primary font-semibold">{selectedMedicine.composition || selectedMedicine.genericName}</p>
              </div>

              <div>
                <span className="font-bold text-zinc-900 dark:text-white">Clinical Indications & Uses:</span>
                <p className="mt-0.5">{selectedMedicine.description}</p>
              </div>

              {selectedMedicine.diseases?.length > 0 && (
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white">Treats Conditions:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedMedicine.diseases.map((d, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMedicine.sideEffects?.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Possible Side Effects:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {selectedMedicine.sideEffects.map((se, i) => (
                      <li key={i}>{se}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMedicine.alternatives?.length > 0 && (
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white">Equivalent Brand Substitutes:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedMedicine.alternatives.map((alt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                addToCart(selectedMedicine)
                setSelectedMedicine(null)
              }}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Order Cart (₹{selectedMedicine.price})
            </button>
          </div>
        </div>
      )}

      {/* 🎉 6. ORDER CONFIRMATION SUCCESS MODAL */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">Pharmacy Order Confirmed!</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your genuine certified medicines have been scheduled for dispatch. Expected delivery within 2 hours.
            </p>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{orderSuccessModal.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Items:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{orderSuccessModal.itemsCount} medicines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Paid:</span>
                <span className="font-bold text-primary">₹{orderSuccessModal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{orderSuccessModal.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccessModal(null)}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default PharmacyShop
