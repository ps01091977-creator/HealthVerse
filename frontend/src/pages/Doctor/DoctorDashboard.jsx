import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import io from 'socket.io-client'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Bot, 
  Sparkles, 
  FileText, 
  Activity, 
  HelpCircle,
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Loader2,
  TrendingUp,
  Search,
  Video,
  ListFilter,
  Eye,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Settings,
  User
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const DoctorDashboard = () => {
  const queryClient = useQueryClient()
  const { dToken, backendUrl, cancelAppointment, completeAppointment, appointments, getAppointments } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge } = useContext(AppContext)

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'roster', 'prescriptions', 'availability'

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Selected Patient for history/notes
  const [selectedAppt, setSelectedAppt] = useState(null)
  
  // AI States
  const [docNotes, setDocNotes] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Prescription Form State
  const [prescriptionList, setPrescriptionList] = useState([{ name: '', dosage: '', frequency: '', duration: '' }])
  const [rxNotes, setRxNotes] = useState('')
  const [isRxSaving, setIsRxSaving] = useState(false)

  // Profile / Availability Toggle
  const [isAvailable, setIsAvailable] = useState(true)

  // Fetch Doctor Dashboard metrics
  const { data: dashData, isLoading, error } = useQuery({
    queryKey: ['doctorDashboard', dToken],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, { headers: { dToken } })
      if (data.success) {
        setIsAvailable(data.dashData.isAvailable ?? true)
        return data.dashData
      }
      throw new Error(data.message || 'Failed to fetch dashboard')
    },
    enabled: !!dToken,
  })

  // Load appointments
  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  // Hook up WebSockets for real-time alerts
  useEffect(() => {
    if (dToken && dashData?.latestAppointments?.[0]) {
      const docId = dashData.latestAppointments[0].docId
      const socketUrl = import.meta.env.VITE_BACKEND_URL || 'https://healthverse-2.onrender.com'
      const socket = io(socketUrl)

      socket.emit('join_doctor', docId)

      socket.on('appointment_booked', (data) => {
        toast.info(`🔔 New consultation booked by ${data.patientName || 'a patient'}!`)
        queryClient.invalidateQueries(['doctorDashboard'])
        getAppointments()
      })

      socket.on('appointment_cancelled', () => {
        toast.warn('⚠️ An appointment was cancelled.')
        queryClient.invalidateQueries(['doctorDashboard'])
        getAppointments()
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [dToken, dashData, queryClient])

  // Set default selected appointment
  useEffect(() => {
    if (appointments?.length > 0 && !selectedAppt) {
      setSelectedAppt(appointments[0])
    }
  }, [appointments])

  // Handle AI clinical synthesis
  const handleGenerateSummary = async () => {
    if (!selectedAppt) return
    setIsAiLoading(true)
    setAiResult(null)

    try {
      const response = await axios.post(
        `${backendUrl}/api/doctor/ai/visit-summary`,
        {
          patientName: selectedAppt.userData?.name || 'Patient',
          patientAge: selectedAppt.userData?.dob ? calculateAge(selectedAppt.userData.dob) : 30,
          gender: selectedAppt.userData?.gender || 'Unspecified',
          symptoms: selectedAppt.slotTime ? `Consultation slot on ${selectedAppt.slotDate} at ${selectedAppt.slotTime}` : 'General consultation',
          doctorNotes: docNotes || 'Routine patient checkup and vitals assessment.',
          history: ''
        },
        { headers: { dToken } }
      )

      if (response.data?.success && response.data.data) {
        setAiResult(response.data.data)
        toast.success('AI clinical synthesis completed!')
      } else {
        toast.error('Could not generate insights.')
      }
    } catch (err) {
      toast.error('AI Service is currently offline.')
    } finally {
      setIsAiLoading(false)
    }
  }

  // Handle Saving Prescription
  const handleSavePrescription = async (e) => {
    e.preventDefault()
    if (!selectedAppt) return
    
    // Check if at least one medicine name is entered
    if (prescriptionList.some(med => !med.name.trim())) {
      return toast.warning('Please enter medicine names')
    }

    setIsRxSaving(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/add-prescription`,
        { appointmentId: selectedAppt._id, prescription: prescriptionList, notes: rxNotes },
        { headers: { dToken } }
      )
      if (data.success) {
        toast.success('Prescription generated successfully!')
        queryClient.invalidateQueries(['doctorDashboard'])
        getAppointments()
        setRxNotes('')
        setPrescriptionList([{ name: '', dosage: '', frequency: '', duration: '' }])
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsRxSaving(false)
    }
  }

  // Handle Availability Toggle
  const handleToggleAvailability = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/change-availability`,
        { docId: dashData.latestAppointments?.[0]?.docId },
        { headers: { dToken } }
      )
      if (data.success) {
        setIsAvailable(!isAvailable)
        toast.success('Availability settings updated')
        queryClient.invalidateQueries(['doctorDashboard'])
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Prescription Form row additions
  const addMedicineRow = () => {
    setPrescriptionList([...prescriptionList, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedicineRow = (idx) => {
    setPrescriptionList(prescriptionList.filter((_, i) => i !== idx))
  }

  const updateMedicineRow = (idx, field, value) => {
    const updated = [...prescriptionList]
    updated[idx][field] = value
    setPrescriptionList(updated)
  }

  // Filter Appointments for Roster Tab
  const getFilteredAppointments = () => {
    if (!appointments) return []
    return appointments.filter(appt => {
      const matchesSearch = appt.userData?.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'upcoming' && !appt.cancelled && !appt.isCompleted) ||
                            (filterStatus === 'completed' && appt.isCompleted) ||
                            (filterStatus === 'cancelled' && appt.cancelled)
      return matchesSearch && matchesStatus
    })
  }

  const filteredAppointments = getFilteredAppointments()

  // Setup Chart Data for Earnings
  const getChartData = () => {
    if (!dashData?.latestAppointments) return null
    let cumulative = 0
    const points = dashData.latestAppointments.map(app => {
      cumulative += app.amount
      return cumulative
    })

    return {
      labels: dashData.latestAppointments.map((_, i) => `Session ${i + 1}`),
      datasets: [
        {
          fill: true,
          label: 'Revenue growth',
          data: points,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.04)',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3
        }
      ]
    }
  }

  const chartData = getChartData()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(128, 128, 128, 0.03)' } },
      x: { grid: { display: false } }
    }
  }

  const StatCardSkeleton = () => (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="bg-zinc-200 dark:bg-zinc-800 h-3.5 w-1/3 rounded"></div>
        <div className="bg-zinc-200 dark:bg-zinc-800 h-8 w-8 rounded-lg"></div>
      </div>
      <div className="bg-zinc-200 dark:bg-zinc-800 h-6 w-1/2 rounded"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-6 w-full text-left">
      {/* Top Navbar tabs navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-200/60 dark:border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">Provider Administration</h1>
          <p className="text-zinc-505 dark:text-zinc-400 text-xs">Analytics updates, roster trackers, and prescription generators.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'overview' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50' 
                : 'text-zinc-500'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'roster' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50' 
                : 'text-zinc-500'
            }`}
          >
            Appointments
          </button>
          <button 
            onClick={() => setActiveTab('prescriptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'prescriptions' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50' 
                : 'text-zinc-500'
            }`}
          >
            Prescriptions & Notes
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'availability' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50' 
                : 'text-zinc-500'
            }`}
          >
            Availability
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      ) : error ? (
        <div className="p-6 border border-red-200/50 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/10 text-red-500 text-xs rounded-xl">
          Failed to load dashboard metrics.
        </div>
      ) : dashData ? (
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gross Income</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">₹{dashData.earnings}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Consultations</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{dashData.appointments}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unique Patients</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{dashData.patients}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Chart & Recent list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary" /> Revenue Growth Log</h3>
                  {chartData ? (
                    <div className="h-[200px]">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-zinc-400 text-xs">No records available.</div>
                  )}
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-505" /> Today's Queue</h3>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {dashData.latestAppointments.slice(0, 4).map((appt) => (
                      <div key={appt._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <img className="w-7 h-7 rounded-full object-cover" src={appt.userData?.image || '/fallback-user.png'} alt="user" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{appt.userData?.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{appt.slotTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROSTER LIST */}
          {activeTab === 'roster' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
              
              {/* Search Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-zinc-400" />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-zinc-200 dark:border-zinc-850 p-2 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="all">All States</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/60 dark:border-zinc-800 text-zinc-500 font-semibold">
                      <th className="p-3">Patient</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Age</th>
                      <th className="p-3">Paid status</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Consultation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {filteredAppointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="p-3 flex items-center gap-2.5">
                          <img className="w-7 h-7 rounded-full object-cover border" src={appt.userData?.image || '/fallback-user.png'} alt="" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-100">{appt.userData?.name}</span>
                        </td>
                        <td className="p-3">{slotDateFormat(appt.slotDate)} at {appt.slotTime}</td>
                        <td className="p-3">{calculateAge(appt.userData?.dob)} Years</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            appt.payment ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-505 border border-amber-500/20'
                          }`}>
                            {appt.payment ? 'Online' : 'CASH'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold ${appt.cancelled ? 'text-red-500' : appt.isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                            {appt.cancelled ? 'Cancelled' : appt.isCompleted ? 'Completed' : 'Upcoming'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {!appt.cancelled && !appt.isCompleted && appt.videoLink && (
                            <a 
                              href={appt.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]"
                            >
                              <Video className="w-3.5 h-3.5" /> Telehealth Join
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Selector & Medical History */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-4 rounded-2xl shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Consultation Case</h4>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {appointments?.filter(a => !a.cancelled).map((appt) => (
                      <div 
                        key={appt._id}
                        onClick={() => setSelectedAppt(appt)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          selectedAppt?._id === appt._id 
                            ? 'bg-zinc-50 dark:bg-zinc-950 border-primary' 
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{appt.userData?.name}</p>
                          <p className="text-[10px] text-zinc-405">{appt.slotDate}</p>
                        </div>
                        <span className={`text-[9px] font-bold ${appt.isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                          {appt.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Patient details */}
                {selectedAppt && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-4 rounded-2xl shadow-sm space-y-3 text-xs">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><User className="w-3.5 h-3.5" /> Patient Demographics</h4>
                    <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/50">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedAppt.userData?.name}</p>
                      <p>Gender: {selectedAppt.userData?.gender || 'Unspecified'}</p>
                      <p>Age: {selectedAppt.userData?.dob ? calculateAge(selectedAppt.userData.dob) : '30'} Years</p>
                      <p>Email: {selectedAppt.userData?.email}</p>
                    </div>

                    {/* Symptoms notes */}
                    <div className="space-y-1">
                      <span className="font-semibold text-zinc-450 uppercase text-[9px] tracking-wider">Symptoms / Intake info</span>
                      <p className="text-[11px] bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border italic text-zinc-600">
                        {selectedAppt.symptoms || 'Intake data unavailable.'}
                      </p>
                    </div>

                    {/* Diagnostic AI Copilot panel */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50 text-[10px] flex items-center gap-1">
                          <Bot className="w-4 h-4 text-primary" /> diagnostic copilot
                        </span>
                        <button 
                          onClick={handleGenerateSummary}
                          disabled={isAiLoading}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[9px] rounded-lg flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          {isAiLoading ? 'Synthesizing...' : 'Call AI Assistant'}
                        </button>
                      </div>
                      
                      {aiResult && (
                        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/50 p-3 rounded-xl text-[10px] space-y-2 max-h-36 overflow-y-auto">
                          <p className="font-semibold text-primary uppercase">Summary Analysis:</p>
                          <p className="text-zinc-700 leading-relaxed italic">"{aiResult.summary}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Prescription Form */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Generate Prescription</h3>
                    <p className="text-[10px] text-zinc-400">Add medicines, dosage, clinical observations, and finalize.</p>
                  </div>
                </div>

                {selectedAppt ? (
                  <form onSubmit={handleSavePrescription} className="space-y-4 text-xs text-left">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-500">Medicine Roster</span>
                        <button 
                          type="button" 
                          onClick={addMedicineRow}
                          className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Drug
                        </button>
                      </div>

                      <div className="space-y-2">
                        {prescriptionList.map((med, idx) => (
                          <div key={idx} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                            <input
                              type="text"
                              placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                              value={med.name}
                              onChange={(e) => updateMedicineRow(idx, 'name', e.target.value)}
                              className="flex-1 min-w-[150px] p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Dosage (e.g. 1 tablet)"
                              value={med.dosage}
                              onChange={(e) => updateMedicineRow(idx, 'dosage', e.target.value)}
                              className="w-24 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Freq (e.g. 1-0-1)"
                              value={med.frequency}
                              onChange={(e) => updateMedicineRow(idx, 'frequency', e.target.value)}
                              className="w-24 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Duration (5 days)"
                              value={med.duration}
                              onChange={(e) => updateMedicineRow(idx, 'duration', e.target.value)}
                              className="w-24 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                            
                            {prescriptionList.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeMedicineRow(idx)}
                                className="p-2 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-550">Consultation Summary / Medical Advice</label>
                      <textarea
                        value={rxNotes}
                        onChange={(e) => setRxNotes(e.target.value)}
                        placeholder="Type final instructions, follow-up advice, precautions..."
                        className="w-full h-24 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="submit"
                        disabled={isRxSaving}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isRxSaving ? 'Finalizing...' : 'Save & Finalize Prescription'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-20 text-center text-zinc-400 text-xs flex flex-col items-center justify-center">
                    <Clock className="w-6 h-6 mb-2 animate-pulse" />
                    Select a patient consultation to draft a prescription.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AVAILABILITY CONTROLS */}
          {activeTab === 'availability' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6 max-w-xl text-left">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Availability Roster Controls</h3>
                  <p className="text-[10px] text-zinc-400">Configure global availability toggles and doctor scheduling hours.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Roster Availability</h4>
                  <p className="text-[10px] text-zinc-405 mt-0.5">Toggle whether you are currently taking clinical bookings.</p>
                </div>
                <button
                  onClick={handleToggleAvailability}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    isAvailable
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-650'
                  }`}
                >
                  {isAvailable ? 'Taking Bookings' : 'On Leave'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-500">
                <h4 className="font-bold text-zinc-700 dark:text-zinc-350">Scheduled Slot Hours</h4>
                <p>Appointments book automatically in 30-minute intervals between 10:00 AM and 9:00 PM daily when set as available.</p>
              </div>
            </div>
          )}

        </div>
      ) : null}
    </div>
  )
}

export default DoctorDashboard