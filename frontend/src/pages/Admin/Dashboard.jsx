import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import io from 'socket.io-client'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  AlertOctagon, 
  Bed, 
  Layers, 
  Database, 
  FileText, 
  Plus, 
  Filter,
  Pill,
  ShoppingBag,
  Check,
  Search,
  Settings,
  Truck,
  Heart,
  Shield,
  MapPin,
  AlertTriangle,
  Compass,
  DollarSign
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2'

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const queryClient = useQueryClient()
  const { aToken, backendUrl, cancelAppointment, approveAppointment } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  // Sub-dashboard navigation: 'analytics', 'hospital', 'pharmacy', 'blood', 'emergency', 'enterprise'
  const [dashboardTab, setDashboardTab] = useState('analytics')

  // Date Filters
  const [datePreset, setDatePreset] = useState('all') // 'all', '30days', 'ytd'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pharmacy State variables
  const [pharmacyMeds, setPharmacyMeds] = useState([])
  const [pharmacyOrders, setPharmacyOrders] = useState([])
  const [medSearch, setMedSearch] = useState('')
  const [medCategory, setMedCategory] = useState('all')
  
  // Edit Stock states
  const [editStockId, setEditStockId] = useState(null)
  const [editStockVal, setEditStockVal] = useState(0)

  // Add medicine form state
  const [newMed, setNewMed] = useState({
    name: '', category: 'Analgesics', price: '', stock: '', sku: '',
    supplierName: '', supplierPhone: '', supplierEmail: '', description: ''
  })
  const [isMedAdding, setIsMedAdding] = useState(false)

  // Blood Bank states
  const [bloodRequestsAdmin, setBloodRequestsAdmin] = useState([])
  const [bloodDonorsAdmin, setBloodDonorsAdmin] = useState([])

  // Emergency SOS States
  const [emergencySOSAdmin, setEmergencySOSAdmin] = useState([])
  const [assignAmbId, setAssignAmbId] = useState({})

  // Enterprise Role-Permissions States
  const [rolePermissions, setRolePermissions] = useState([
    { role: "Super Admin", writeRx: true, manageStock: true, approveSlots: true, dispatchSOS: true },
    { role: "Medical Director", writeRx: true, manageStock: false, approveSlots: true, dispatchSOS: false },
    { role: "Pharmacist", writeRx: false, manageStock: true, approveSlots: false, dispatchSOS: false },
    { role: "Chief Nurse", writeRx: false, manageStock: false, approveSlots: true, dispatchSOS: true }
  ])

  const systemLogs = [
    { time: "06:42:15", type: "INFO", desc: "AI Copilot patient summary completed for Robert Chen." },
    { time: "06:40:02", type: "SUCCESS", desc: "Ambulance AMB-12 responded to SOS alert in Indiranagar." },
    { time: "06:38:55", type: "DB_WRITE", desc: "New medicine Amoxicillin 500mg logged in Pharmacy catalog." },
    { time: "06:35:10", type: "ALERT", desc: "Critical blood request group O- submitted for Apollo Hospital." },
    { time: "06:30:00", type: "WEBSOCKET", desc: "Doctor room doctor_660b joined client connection." }
  ]

  // Mock Hospital Operations Data (Enterprise scale)
  const hospitalResources = {
    beds: { occupied: 154, total: 200 },
    icu: { active: 18, total: 25 },
    operatingTheatres: { inUse: 4, total: 6 },
    staffOnDuty: 42,
    lowStockMeds: [
      { name: 'Insulin Glargine', qty: 15, unit: 'vials', status: 'critical' },
      { name: 'Amoxicillin 500mg', qty: 45, unit: 'capsules', status: 'low' },
      { name: 'Normal Saline 1L', qty: 8, unit: 'bags', status: 'critical' },
      { name: 'Epinephrine 1mg/ml', qty: 22, unit: 'ampoules', status: 'low' }
    ],
    pendingLabs: [
      { id: 'LAB-102', patient: 'Robert Chen', test: 'Lipid Panel', dept: 'Cardiology', status: 'pending' },
      { id: 'LAB-103', patient: 'Sarah Jenkins', test: 'Brain MRI Scan', dept: 'Neurology', status: 'running' },
      { id: 'LAB-104', patient: 'David Vance', test: 'CBC Blood Count', dept: 'Emergency', status: 'pending' }
    ],
    emergencies: [
      { id: 'ER-009', patient: 'Marcus Aurelius', triage: 'critical', complaint: 'Chest Pain / suspected MI', room: 'ICU-B1' },
      { id: 'ER-010', patient: 'Elena Rostova', triage: 'serious', complaint: 'Compound Fracture', room: 'OR-02' },
      { id: 'ER-011', patient: 'Jordan Wilkes', triage: 'stable', complaint: 'Severe Dehydration', room: 'ER-Bed-4' }
    ]
  }

  // Fetch Clinical Dashboard data
  const { data: dashData, isLoading, error } = useQuery({
    queryKey: ['adminDashboard', aToken],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { aToken } })
      if (data.success) {
        return data.dashData
      }
      throw new Error(data.message || 'Failed to fetch dashboard data')
    },
    enabled: !!aToken,
  })

  // Sockets for real-time dashboard refresh
  useEffect(() => {
    if (aToken) {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || 'https://healthverse-1.onrender.com'
      const socket = io(socketUrl)

      socket.emit('join_admin')

      socket.on('appointment_booked', () => {
        toast.info('🔔 New appointment booked by user!')
        queryClient.invalidateQueries(['adminDashboard'])
      })

      socket.on('appointment_cancelled', () => {
        queryClient.invalidateQueries(['adminDashboard'])
      })

      socket.on('appointment_approved', () => {
        queryClient.invalidateQueries(['adminDashboard'])
      })

      socket.on('sos_triggered', (data) => {
        toast.error(`🔥 Emergency SOS trigger received from patient ${data.patientName || 'Guest'}!`)
        loadEmergencyData()
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [aToken, queryClient])

  // Load pharmacy catalog and billing details
  const loadPharmacyData = async () => {
    try {
      const resMeds = await axios.get(`${backendUrl}/api/pharmacy/list?search=${medSearch}&category=${medCategory}`)
      if (resMeds.data.success) {
        setPharmacyMeds(resMeds.data.medicines)
      }
      const resOrders = await axios.get(`${backendUrl}/api/pharmacy/admin-orders`, { headers: { aToken } })
      if (resOrders.data.success) {
        setPharmacyOrders(resOrders.data.orders)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Load blood bank requests and donors
  const loadBloodBankData = async () => {
    try {
      const resReqs = await axios.get(`${backendUrl}/api/blood/admin-requests`, { headers: { aToken } })
      if (resReqs.data.success) {
        setBloodRequestsAdmin(resReqs.data.requests)
      }
      const resDonors = await axios.get(`${backendUrl}/api/blood/list-donors`)
      if (resDonors.data.success) {
        setBloodDonorsAdmin(resDonors.data.donors)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Load emergency SOS logs
  const loadEmergencyData = async () => {
    try {
      const resSOS = await axios.get(`${backendUrl}/api/emergency/admin-list`, { headers: { aToken } })
      if (resSOS.data.success) {
        setEmergencySOSAdmin(resSOS.data.emergencies)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (aToken) {
      if (dashboardTab === 'pharmacy') {
        loadPharmacyData()
      } else if (dashboardTab === 'blood') {
        loadBloodBankData()
      } else if (dashboardTab === 'emergency') {
        loadEmergencyData()
      } else if (dashboardTab === 'enterprise') {
        loadPharmacyData()
        loadBloodBankData()
        loadEmergencyData()
      } else if (dashboardTab === 'analytics') {
        loadPharmacyData()
        loadBloodBankData()
      }
    }
  }, [dashboardTab, medSearch, medCategory, aToken])

  // Stock edit save API trigger
  const handleUpdateStock = async (medId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/update-stock`, 
        { medicineId: medId, stock: editStockVal }, 
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success('Stock adjusted successfully!')
        setEditStockId(null)
        loadPharmacyData()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Update order delivery status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/update-order-status`, 
        { orderId, orderStatus: newStatus }, 
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(`Fulfillment state marked as ${newStatus}`)
        loadPharmacyData()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Submit new medicine entry
  const handleAddMedicineSubmit = async (e) => {
    e.preventDefault()
    if (!newMed.name || !newMed.price || !newMed.stock || !newMed.sku) {
      return toast.warning('Please enter required details')
    }
    setIsMedAdding(true)
    try {
      const payload = {
        name: newMed.name,
        category: newMed.category,
        price: Number(newMed.price),
        stock: Number(newMed.stock),
        sku: newMed.sku,
        supplier: {
          name: newMed.supplierName || 'General Supplier',
          phone: newMed.supplierPhone || '+91-9000000000',
          email: newMed.supplierEmail || 'orders@supp.com'
        },
        description: newMed.description
      }
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/add-medicine`, 
        payload, 
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success('Medicine cataloged successfully!')
        setNewMed({
          name: '', category: 'Analgesics', price: '', stock: '', sku: '',
          supplierName: '', supplierPhone: '', supplierEmail: '', description: ''
        })
        loadPharmacyData()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsMedAdding(false)
    }
  }

  // Approve or fulfill blood request
  const handleUpdateRequestStatus = async (reqId, newStatus) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/blood/update-request-status`, 
        { requestId: reqId, status: newStatus }, 
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(`Blood request status set to ${newStatus}`)
        loadBloodBankData()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Dispatch responder vehicle for SOS
  const handleDispatchAmbulance = async (sosId) => {
    const ambulanceId = assignAmbId[sosId] || 'AMB-09'
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/emergency/dispatch`, 
        { sosId, ambulanceId }, 
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(`Ambulance responder ${ambulanceId} assigned to SOS beacon!`)
        loadEmergencyData()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Role Permissions Toggles
  const handleTogglePermission = (idx, field) => {
    const updated = [...rolePermissions]
    updated[idx][field] = !updated[idx][field]
    setRolePermissions(updated)
    toast.success('Role permissions criteria updated!')
  }

  // Export CSV Report
  const handleExportCSV = () => {
    const rows = [
      ["Metric Category", "Operational Metric", "Total Logged Value"],
      ["Registered Doctors", "Doctors Directory Count", dashData?.doctors || 0],
      ["Consultations", "Scheduling Log Count", dashData?.appointments || 0],
      ["Registered Patients", "Patient Roster Count", dashData?.patients || 0],
      ["Pharmacy Roster", "Stock Inventory Val (INR)", `INR ${pharmacyMeds.reduce((sum, m) => sum + (m.price * m.stock), 0)}`],
      ["Pharmacy Roster", "Gross Medicine Sales (INR)", `INR ${pharmacyOrders.reduce((sum, o) => sum + o.totalAmount, 0)}`],
      ["Blood Registry", "Fulfilled units count", `${bloodRequestsAdmin.filter(r => r.status === 'Fulfilled').reduce((sum, r) => sum + r.units, 0)} Units`],
      ["AI Engagements", "Symptom checker queries count", "14 runs"],
      ["AI Engagements", "Doctor Copilot summary checks", "8 runs"]
    ]

    let csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `HealthVerse_Enterprise_Report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Report compiled successfully!')
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Quick Preset Filters
  const applyPresetFilter = (preset) => {
    setDatePreset(preset)
    const now = new Date()
    if (preset === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    } else if (preset === 'ytd') {
      setStartDate(`${now.getFullYear()}-01-01`)
      setEndDate(now.toISOString().split('T')[0])
    } else {
      setStartDate('')
      setEndDate('')
    }
  }

  // Dynamic charts calculations based on date filters
  const getFilteredData = () => {
    if (!dashData?.latestAppointments) return null

    // Filter appointments
    let filteredAppts = [...dashData.latestAppointments]
    if (startDate || endDate) {
      const startMs = startDate ? new Date(startDate).getTime() : 0
      const endMs = endDate ? new Date(endDate).getTime() : Infinity
      filteredAppts = filteredAppts.filter(app => {
        const appMs = new Date(app.date).getTime()
        return appMs >= startMs && appMs <= endMs
      })
    }

    return filteredAppts
  }

  const filteredAppts = getFilteredData() || []

  // Dynamic Chart 1: Patients Growth (Line)
  const patientGrowthChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Cumulative Registrations',
        data: [120, 160, 210, 280, 360, 440, 520, dashData?.patients || 600],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.05)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#0284c7',
      }
    ]
  }

  // Dynamic Chart 2: Revenue Stream Breakdown (Doughnut)
  const apptRevTotal = filteredAppts.reduce((sum, app) => sum + (app.docData?.fees || 500), 0)
  const pharmacyRevTotal = pharmacyOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  
  const revenueChartData = {
    labels: ['Clinical Bookings', 'Pharmacy Cart Sales'],
    datasets: [
      {
        data: [apptRevTotal || 45000, pharmacyRevTotal || 28000],
        backgroundColor: ['rgba(2, 132, 199, 0.75)', 'rgba(16, 185, 129, 0.75)'],
        hoverBackgroundColor: ['#0284c7', '#10b981'],
        borderWidth: 0,
      }
    ]
  }

  // Dynamic Chart 3: Disease Suspicions (Radar)
  const diseaseChartData = {
    labels: ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Gastroenterology'],
    datasets: [
      {
        label: 'Symptom Diagnostics Prevalence',
        data: [15, 22, 10, 18, 14],
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
      }
    ]
  }

  // Dynamic Chart 4: Hospital Capacity Statistics (Polar Area)
  const hospitalStatChartData = {
    labels: ['Bed Occupancy %', 'Active ICU %', 'Operating Rooms %', 'On-Duty Staff'],
    datasets: [
      {
        data: [
          Math.round((hospitalResources.beds.occupied / hospitalResources.beds.total) * 100),
          Math.round((hospitalResources.icu.active / hospitalResources.icu.total) * 100),
          Math.round((hospitalResources.operatingTheatres.inUse / hospitalResources.operatingTheatres.total) * 100),
          hospitalResources.staffOnDuty
        ],
        backgroundColor: [
          'rgba(2, 132, 199, 0.65)',
          'rgba(16, 185, 129, 0.65)',
          'rgba(245, 158, 11, 0.65)',
          'rgba(107, 114, 128, 0.65)'
        ],
        borderWidth: 0,
      }
    ]
  }

  // Top Doctor Performance Scorecards
  const topDoctorMetrics = [
    { name: "Dr. Richard James", spec: "General Physician", patients: 45, rating: 4.9, cancelRate: "2.1%" },
    { name: "Dr. Emily Sanders", spec: "Gynecologist", patients: 38, rating: 4.85, cancelRate: "3.4%" },
    { name: "Dr. Christopher Lee", spec: "Pediatrician", patients: 32, rating: 4.75, cancelRate: "4.0%" }
  ]

  // Setup Specialty Demand Chart
  const getSpecialtyChartData = () => {
    const specCounts = {}
    filteredAppts.forEach(app => {
      const spec = app.docData?.speciality || 'General'
      specCounts[spec] = (specCounts[spec] || 0) + 1
    })

    return {
      labels: Object.keys(specCounts).length ? Object.keys(specCounts) : ['General Physician', 'Gynecologist', 'Pediatrician'],
      datasets: [
        {
          label: 'Appointments',
          data: Object.values(specCounts).length ? Object.values(specCounts) : [12, 8, 5],
          backgroundColor: 'rgba(2, 132, 199, 0.1)', 
          borderColor: '#0284c7',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    }
  }

  const specialtyChartData = getSpecialtyChartData()

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
      {/* Header Selector Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-250/60 dark:border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">Enterprise Hospital Hub</h1>
          <p className="text-zinc-505 dark:text-zinc-400 text-xs font-normal">Monitor resource allocations, triage logs, and scheduling funnels.</p>
        </div>
        {/* Dash Type Selectors */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <button 
            onClick={() => setDashboardTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              dashboardTab === 'analytics' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Clinical Analytics
          </button>
          <button 
            onClick={() => setDashboardTab('hospital')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              dashboardTab === 'hospital' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Hospital Operations
          </button>
          <button 
            onClick={() => setDashboardTab('pharmacy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              dashboardTab === 'pharmacy' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Pharmacy Manager
          </button>
          <button 
            onClick={() => setDashboardTab('blood')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              dashboardTab === 'blood' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Blood Bank Manager
          </button>
          <button 
            onClick={() => setDashboardTab('emergency')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              dashboardTab === 'emergency' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Emergency SOS
          </button>
          <button 
            onClick={() => setDashboardTab('enterprise')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              dashboardTab === 'enterprise' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Enterprise Console
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      ) : error ? (
        <div className="p-6 border border-red-200/50 text-red-500 text-xs rounded-xl bg-red-50/50">
          Failed to load operations metrics.
        </div>
      ) : dashData ? (
        <div className="space-y-6 font-sans">
          
          {/* TAB 1: CLINICAL ANALYTICS */}
          {dashboardTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Dynamic Interactive Datepicker filters & quick presets */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                
                {/* Date presets */}
                <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-850/60 rounded-xl">
                  <button
                    onClick={() => applyPresetFilter('all')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      datePreset === 'all' 
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => applyPresetFilter('30days')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      datePreset === '30days' 
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
                    }`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => applyPresetFilter('ytd')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      datePreset === 'ytd' 
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
                    }`}
                  >
                    Year to Date
                  </button>
                </div>

                {/* Date selectors */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400 font-bold">Start Date:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setDatePreset('custom'); }}
                      className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400 font-bold">End Date:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setDatePreset('custom'); }}
                      className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced KPI metrics grids */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group'>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registered Patients</span>
                    <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>{dashData.patients}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className='bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group'>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Bookings</span>
                    <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>{filteredAppts.length}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className='bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group'>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Active Doctors</span>
                    <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>{dashData.doctors}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className='bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group'>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gross Income (INR)</span>
                    <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>₹{apptRevTotal + pharmacyRevTotal}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-505">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Advanced visual graphics grids (Chart.js dashboard layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Line: Patients growth */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" /> Patient Registry Timeline
                  </h4>
                  <div className="h-[200px]">
                    <Line data={patientGrowthChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                {/* Doughnut: Revenue Streams */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Revenue Channels Allocation
                  </h4>
                  <div className="h-[200px] flex items-center justify-center">
                    <Doughnut data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                {/* Specialty Demand */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" /> Specialty Distribution
                  </h4>
                  <div className="h-[200px]">
                    <Bar data={specialtyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                {/* Radar: Suspected Disease profiles */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-emerald-500" /> Disease Prevalence Index
                  </h4>
                  <div className="h-[200px] flex items-center justify-center">
                    <Radar data={diseaseChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                {/* Polar Area: Hospital statistics */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-primary" /> Hospital Resource Utilizations
                  </h4>
                  <div className="h-[200px] flex items-center justify-center">
                    <PolarArea data={hospitalStatChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                {/* Doctor Performance Scorecard list */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                    <UserCheck className="w-4.5 h-4.5 text-primary" /> Top Doctor Performance
                  </h4>

                  <div className="divide-y divide-zinc-100">
                    {topDoctorMetrics.map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 text-xs">
                        <div>
                          <p className="font-bold text-zinc-805">{doc.name}</p>
                          <p className="text-[10px] text-zinc-400">{doc.spec}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-700">{doc.patients} consultations</p>
                          <p className="text-[9px] text-zinc-405">★ {doc.rating} Rating | {doc.cancelRate} Cancel</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: HOSPITAL OPERATIONS */}
          {dashboardTab === 'hospital' && (
            <div className="space-y-6">
              
              {/* Critical resource grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bed occupancy */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5"><Bed className="w-4 h-4 text-primary" /> Bed Occupancy</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {Math.round((hospitalResources.beds.occupied / hospitalResources.beds.total) * 100)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {hospitalResources.beds.occupied} <span className="text-xs text-zinc-400 font-normal">/ {hospitalResources.beds.total} Occupied</span>
                  </h3>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${(hospitalResources.beds.occupied / hospitalResources.beds.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* ICU Active */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-455 uppercase tracking-wider flex items-center gap-1.5"><Activity className="w-4.5 h-4.5 text-emerald-500" /> Active ICU Units</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {Math.round((hospitalResources.icu.active / hospitalResources.icu.total) * 100)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {hospitalResources.icu.active} <span className="text-xs text-zinc-400 font-normal">/ {hospitalResources.icu.total} Active</span>
                  </h3>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${(hospitalResources.icu.active / hospitalResources.icu.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Operating Theatres */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-4 h-4 text-amber-505" /> Operating Rooms</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {Math.round((hospitalResources.operatingTheatres.inUse / hospitalResources.operatingTheatres.total) * 100)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {hospitalResources.operatingTheatres.inUse} <span className="text-xs text-zinc-400 font-normal">/ {hospitalResources.operatingTheatres.total} In Use</span>
                  </h3>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-550 h-full rounded-full" 
                      style={{ width: `${(hospitalResources.operatingTheatres.inUse / hospitalResources.operatingTheatres.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Active Staff */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="w-4.5 h-4.5 text-primary" /> Staff on Duty</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {hospitalResources.staffOnDuty} <span className="text-xs text-zinc-400 font-normal">Nurses & MDs</span>
                  </h3>
                  <p className="text-[10px] text-zinc-405">Across 6 specialty departments</p>
                </div>
              </div>

              {/* Emergency Cases & Pharmacy Inventory splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Emergency cases */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-95 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-zinc-100 dark:border-zinc-850">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <AlertOctagon className="w-4.5 h-4.5 text-red-500" /> Emergency Triage Logs
                    </h3>

                    {/* Filter triage */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Filter className="w-3.5 h-3.5 text-zinc-400" />
                      <select 
                        value={emergencyFilter}
                        onChange={(e) => setEmergencyFilter(e.target.value)}
                        className="p-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 rounded-lg text-[10px] focus:outline-none"
                      >
                        <option value="all">All Triage</option>
                        <option value="critical">Critical</option>
                        <option value="serious">Serious</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 text-zinc-400 font-semibold">
                          <th className="p-2.5">Case ID</th>
                          <th className="p-2.5">Patient</th>
                          <th className="p-2.5">Chief Complaint</th>
                          <th className="p-2.5">Triage Severity</th>
                          <th className="p-2.5 text-right">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                        {hospitalResources.emergencies
                          .filter(e => emergencyFilter === 'all' || e.triage === emergencyFilter)
                          .map((e) => (
                            <tr key={e.id} className="hover:bg-zinc-50/50">
                              <td className="p-2.5 font-bold text-zinc-500">{e.id}</td>
                              <td className="p-2.5 font-semibold text-zinc-800 dark:text-zinc-200">{e.patient}</td>
                              <td className="p-2.5">{e.complaint}</td>
                              <td className="p-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  e.triage === 'critical' 
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                    : 'bg-amber-500/10 text-amber-505 border border-amber-500/20'
                                }`}>
                                  {e.triage}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-semibold text-zinc-700">{e.room}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pharmacy stock alarms */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <Database className="w-4.5 h-4.5 text-primary" /> Low Stock Pharmacy Alerts
                  </h3>
                  
                  <div className="space-y-3">
                    {hospitalResources.lowStockMeds.map((med, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{med.name}</p>
                          <p className="text-[10px] text-zinc-400">{med.qty} {med.unit} remaining</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          med.status === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-505'
                        }`}>
                          {med.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lab Schedules tracker */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-primary" /> Diagnostic Lab Run Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {hospitalResources.pendingLabs.map((lab) => (
                    <div key={lab.id} className="p-3.5 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-400">{lab.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          lab.status === 'running' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {lab.status}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-150">{lab.patient}</p>
                        <p className="text-[10px] text-zinc-455">{lab.test} — {lab.dept}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PHARMACY INVENTORY MANAGER */}
          {dashboardTab === 'pharmacy' && (
            <div className="space-y-6">
              
              {/* Stats Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Catalog Inventory Value</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      ₹{pharmacyMeds.reduce((sum, m) => sum + (m.price * m.stock), 0)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Database className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Dispatches</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {pharmacyOrders.filter(o => o.orderStatus !== 'Delivered').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-505">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Sales Revenue</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      ₹{pharmacyOrders.reduce((sum, o) => sum + o.totalAmount, 0)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Main Catalog & Order List Splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns: Medicine Catalog and Form */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Catalog table */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                        <Pill className="w-4.5 h-4.5 text-primary" /> Inventory Catalog
                      </h3>

                      {/* Filters */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Search brand name..."
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                          className="px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl text-[10px] focus:outline-none"
                        />
                        <select
                          value={medCategory}
                          onChange={(e) => setMedCategory(e.target.value)}
                          className="border border-zinc-200 rounded-xl text-[10px] p-1.5 bg-white"
                        >
                          <option value="all">All Groups</option>
                          <option value="Analgesics">Analgesics</option>
                          <option value="Antidiabetics">Antidiabetics</option>
                          <option value="Antibiotics">Antibiotics</option>
                          <option value="Cardiovascular">Cardiovascular</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200/60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 text-zinc-455 font-bold">
                            <th className="p-3">SKU</th>
                            <th className="p-3">Medicine</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock Units</th>
                            <th className="p-3 text-right">Adjust Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                          {pharmacyMeds.map((med) => (
                            <tr key={med._id} className="hover:bg-zinc-50/50">
                              <td className="p-3 font-semibold text-zinc-400">{med.sku}</td>
                              <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{med.name}</td>
                              <td className="p-3">{med.category}</td>
                              <td className="p-3 font-bold">₹{med.price}</td>
                              <td className="p-3">
                                {editStockId === med._id ? (
                                  <input
                                    type="number"
                                    value={editStockVal}
                                    onChange={(e) => setEditStockVal(Number(e.target.value))}
                                    className="w-16 border rounded p-1 text-xs"
                                  />
                                ) : (
                                  <span className={`font-semibold ${med.stock <= 15 ? 'text-red-500 font-bold' : ''}`}>
                                    {med.stock} units
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {editStockId === med._id ? (
                                  <button
                                    onClick={() => handleUpdateStock(med._id)}
                                    className="p-1 rounded bg-emerald-500 text-white cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setEditStockId(med._id); setEditStockVal(med.stock); }}
                                    className="text-primary hover:underline font-bold cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add medicine form */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <Plus className="w-4.5 h-4.5 text-primary" /> Catalog New Medicine
                    </h3>

                    <form onSubmit={handleAddMedicineSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-550">Medicine Brand Name *</label>
                        <input
                          type="text"
                          required
                          value={newMed.name}
                          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                          placeholder="e.g. Lipitor 10mg"
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-550">Category *</label>
                        <select
                          value={newMed.category}
                          onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white"
                        >
                          <option value="Analgesics">Analgesics</option>
                          <option value="Antidiabetics">Antidiabetics</option>
                          <option value="Antibiotics">Antibiotics</option>
                          <option value="Cardiovascular">Cardiovascular</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-550">SKU Code *</label>
                        <input
                          type="text"
                          required
                          value={newMed.sku}
                          onChange={(e) => setNewMed({ ...newMed, sku: e.target.value })}
                          placeholder="e.g. RX-LIPI-10"
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-550">Price (INR) *</label>
                        <input
                          type="number"
                          required
                          value={newMed.price}
                          onChange={(e) => setNewMed({ ...newMed, price: e.target.value })}
                          placeholder="e.g. 150"
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-550">Initial Stock Units *</label>
                        <input
                          type="number"
                          required
                          value={newMed.stock}
                          onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })}
                          placeholder="e.g. 100"
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-550">Supplier Name</label>
                        <input
                          type="text"
                          value={newMed.supplierName}
                          onChange={(e) => setNewMed({ ...newMed, supplierName: e.target.value })}
                          placeholder="Pfizer Labs"
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="font-bold text-zinc-550">Clinical Description</label>
                        <textarea
                          value={newMed.description}
                          onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
                          placeholder="Mechanism of action or packaging detail..."
                          className="w-full p-2 border border-zinc-200 rounded-xl bg-white h-16"
                        />
                      </div>
                      <div className="sm:col-span-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={isMedAdding}
                          className="px-6 py-2 bg-zinc-950 text-white rounded-xl font-bold cursor-pointer hover:bg-zinc-900"
                        >
                          {isMedAdding ? 'Saving...' : 'Add Medicine'}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

                {/* Right Column: Billing Orders Timeline */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Pharmacy billing orders list */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <Truck className="w-4.5 h-4.5 text-primary" /> Fulfillment Queue
                    </h3>

                    <div className="space-y-4 max-h-[420px] overflow-y-auto no-scrollbar">
                      {pharmacyOrders.map((order) => (
                        <div key={order._id} className="p-3 border border-zinc-100 rounded-xl space-y-2 text-xs bg-zinc-50/50">
                          <div className="flex justify-between items-start border-b pb-1.5">
                            <div>
                              <p className="font-bold text-zinc-805">{order.patientName}</p>
                              <p className="text-[10px] text-zinc-400">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <span className="font-extrabold text-primary">₹{order.totalAmount}</span>
                          </div>

                          <div className="space-y-0.5 text-zinc-500 text-[11px]">
                            {order.items.map((i, idx) => (
                              <p key={idx}>{i.name} (x{i.quantity})</p>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-1.5 border-t">
                            <span className={`text-[10px] font-bold ${
                              order.orderStatus === 'Delivered' ? 'text-emerald-500' : 'text-amber-505'
                            }`}>{order.orderStatus}</span>

                            <div className="flex gap-1">
                              {order.orderStatus === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order._id, 'Dispatched')}
                                  className="px-2 py-0.5 bg-blue-500 text-white font-bold rounded text-[9px] cursor-pointer"
                                >
                                  Dispatch
                                </button>
                              )}
                              {order.orderStatus === 'Dispatched' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                                  className="px-2 py-0.5 bg-emerald-500 text-white font-bold rounded text-[9px] cursor-pointer"
                                >
                                  Deliver
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplier directory list */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3 text-xs">
                    <h3 className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Manufacturer Suppliers</h3>
                    <div className="divide-y">
                      <div className="py-2">
                        <p className="font-bold text-zinc-805">AstraZeneca Pharma</p>
                        <p className="text-[10px] text-zinc-400">orders@astra.com | +91-9988776655</p>
                      </div>
                      <div className="py-2">
                        <p className="font-bold text-zinc-850">Pfizer Labs</p>
                        <p className="text-[10px] text-zinc-400">billing@pfizer.com | +91-9988776644</p>
                      </div>
                      <div className="py-2">
                        <p className="font-bold text-zinc-850">GSK Pharmaceuticals</p>
                        <p className="text-[10px] text-zinc-400">dist@gsk.com | +91-9988776633</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: BLOOD BANK MANAGER */}
          {dashboardTab === 'blood' && (
            <div className="space-y-6">
              
              {/* Blood bank status grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Registered Donors</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {bloodDonorsAdmin.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <Heart className="w-5 h-5 fill-red-500/20" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Emergency Requests Pending</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {bloodRequestsAdmin.filter(r => r.status === 'Pending').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-505">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Units Successfully Fulfilled</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {bloodRequestsAdmin.filter(r => r.status === 'Fulfilled').reduce((sum, r) => sum + r.units, 0)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Splits layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                
                {/* Left Columns: Requests table */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <AlertOctagon className="w-4.5 h-4.5 text-red-500" /> Triage Approvals Board
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-zinc-200/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 text-zinc-455 font-bold">
                          <th className="p-3">Patient</th>
                          <th className="p-3">Group</th>
                          <th className="p-3">Units Needed</th>
                          <th className="p-3">Hospital</th>
                          <th className="p-3">Urgency</th>
                          <th className="p-3">Fulfillment status</th>
                          <th className="p-3 text-right">Fulfill Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                        {bloodRequestsAdmin.map((req) => (
                          <tr key={req._id} className="hover:bg-zinc-50/50">
                            <td className="p-3 font-bold">{req.patientName}</td>
                            <td className="p-3 text-red-500 font-extrabold">{req.bloodGroup}</td>
                            <td className="p-3 font-semibold">{req.units} units</td>
                            <td className="p-3">{req.hospital}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                req.urgency === 'Critical' ? 'bg-red-100 text-red-650' : 'bg-amber-100 text-amber-650'
                              }`}>{req.urgency}</span>
                            </td>
                            <td className="p-3 font-semibold">{req.status}</td>
                            <td className="p-3 text-right">
                              {req.status === 'Pending' && (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req._id, 'Approved')}
                                    className="px-2 py-1 bg-primary text-white font-bold rounded text-[9px] cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req._id, 'Rejected')}
                                    className="px-2 py-1 bg-red-500 text-white font-bold rounded text-[9px] cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                              {req.status === 'Approved' && (
                                <button
                                  onClick={() => handleUpdateRequestStatus(req._id, 'Fulfilled')}
                                  className="px-2 py-1 bg-emerald-500 text-white font-bold rounded text-[9px] cursor-pointer"
                                >
                                  Mark Fulfilled
                                </button>
                              )}
                              {req.status === 'Fulfilled' && (
                                <span className="text-[10px] text-emerald-500 font-bold">Closed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Donors Directory Summary */}
                <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5 text-primary" /> Active Donors
                  </h3>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar">
                    {bloodDonorsAdmin.map((d) => {
                      const daysSince = d.lastDonationDate 
                        ? Math.round((Date.now() - d.lastDonationDate) / (1000 * 60 * 60 * 24)) 
                        : 999
                      const eligible = daysSince >= 90
                      return (
                        <div key={d._id} className="p-3 bg-zinc-50 rounded-xl border flex justify-between items-center">
                          <div>
                            <p className="font-bold text-zinc-805">{d.name}</p>
                            <p className="text-[9px] text-zinc-400 flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5" /> {d.address}</p>
                            <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                              eligible ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-655'
                            }`}>
                              {eligible ? 'Eligible' : 'Ineligible'}
                            </span>
                          </div>
                          
                          <span className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-black">
                            {d.bloodGroup}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: EMERGENCY SOS RESPONSE */}
          {dashboardTab === 'emergency' && (
            <div className="space-y-6">
              {/* Stat widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Beacons Triggered</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {emergencySOSAdmin.filter(s => s.status === 'Triggered').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Dispatch Responders</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {emergencySOSAdmin.filter(s => s.status === 'Responding').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Rescued Patients</span>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {emergencySOSAdmin.filter(s => s.status === 'Responding' || s.status === 'Completed').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Active Beacons Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  <Compass className="w-4.5 h-4.5 text-red-500 animate-spin" /> Live Triage SOS Alerts
                </h3>

                <div className="overflow-x-auto rounded-xl border border-zinc-200/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 text-zinc-455 font-bold">
                        <th className="p-3">Patient</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">GPS Location Coords</th>
                        <th className="p-3">Address</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Ambulance Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {emergencySOSAdmin.map((sos) => (
                        <tr key={sos._id} className="hover:bg-zinc-50/50">
                          <td className="p-3 font-bold text-red-500">{sos.patientName}</td>
                          <td className="p-3">{sos.phone}</td>
                          <td className="p-3 font-mono text-[10px] text-zinc-450">
                            {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                          </td>
                          <td className="p-3">{sos.address}</td>
                          <td className="p-3 font-semibold">{sos.status}</td>
                          <td className="p-3 text-right">
                            {sos.status === 'Triggered' ? (
                              <div className="flex gap-2 justify-end items-center">
                                <select
                                  value={assignAmbId[sos._id] || 'AMB-09'}
                                  onChange={(e) => setAssignAmbId({ ...assignAmbId, [sos._id]: e.target.value })}
                                  className="p-1 border rounded text-[10px]"
                                >
                                  <option value="AMB-09">AMB-09 (Koramangala)</option>
                                  <option value="AMB-12">AMB-12 (Indiranagar)</option>
                                  <option value="AMB-15">AMB-15 (Whitefield)</option>
                                </select>
                                <button
                                  onClick={() => handleDispatchAmbulance(sos._id)}
                                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-655 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                >
                                  Dispatch Ambulance
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-405 font-semibold">
                                Responder {sos.ambulanceId} assigned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: ENTERPRISE OPERATIONS CONSOLE */}
          {dashboardTab === 'enterprise' && (
            <div className="space-y-6">
              
              {/* Reports exporting options */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-955 dark:text-zinc-50">Enterprise Resource Planning (ERP)</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Export operational datasets directly or trigger printed PDF files.</p>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Database className="w-4 h-4 text-emerald-500" /> Export Excel/CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4 text-primary" /> Print PDF Report
                  </button>
                </div>
              </div>

              {/* Roles, System Logs, & AI Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                
                {/* Left Column: Roles & Permission manager */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <Shield className="w-4.5 h-4.5 text-primary animate-pulse" /> Security Access Permissions
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-zinc-200/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 text-zinc-455 font-bold">
                          <th className="p-3">Staff Role</th>
                          <th className="p-3 text-center">Write Prescriptions</th>
                          <th className="p-3 text-center">Manage Stock</th>
                          <th className="p-3 text-center">Approve Slots</th>
                          <th className="p-3 text-right">Dispatch SOS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                        {rolePermissions.map((rp, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50">
                            <td className="p-3 font-bold text-zinc-805">{rp.role}</td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={() => handleTogglePermission(idx, 'writeRx')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  rp.writeRx ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-655'
                                }`}
                              >
                                {rp.writeRx ? 'Allowed' : 'Revoked'}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={() => handleTogglePermission(idx, 'manageStock')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  rp.manageStock ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-655'
                                }`}
                              >
                                {rp.manageStock ? 'Allowed' : 'Revoked'}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={() => handleTogglePermission(idx, 'approveSlots')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  rp.approveSlots ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-655'
                                }`}
                              >
                                {rp.approveSlots ? 'Allowed' : 'Revoked'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleTogglePermission(idx, 'dispatchSOS')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  rp.dispatchSOS ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-655'
                                }`}
                              >
                                {rp.dispatchSOS ? 'Allowed' : 'Revoked'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: AI Usage & Live System Logs */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* AI usage telemetry */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
                    <h4 className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">AI Copilot Telemetry</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-1.5 border-b">
                        <span>Symptom Checker runs</span>
                        <span className="font-bold text-zinc-850">14 hits</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b">
                        <span>Doctor visit summaries</span>
                        <span className="font-bold text-zinc-850">8 hits</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span>Diet planners calls</span>
                        <span className="font-bold text-zinc-850">9 hits</span>
                      </div>
                    </div>
                  </div>

                  {/* System Transaction Logs */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
                    <h4 className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Triage Transaction Logs</h4>
                    
                    <div className="space-y-3 max-h-[160px] overflow-y-auto no-scrollbar">
                      {systemLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-[10px]">
                          <span className="font-mono text-zinc-400 leading-none mt-0.5">{log.time}</span>
                          <div>
                            <span className={`inline-block font-extrabold text-[8px] mr-1.5 ${
                              log.type === 'ALERT' ? 'text-red-500' : log.type === 'SUCCESS' ? 'text-emerald-500' : 'text-primary'
                            }`}>{log.type}</span>
                            <span className="text-zinc-600 leading-tight">{log.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      ) : null}
    </div>
  )
}

export default Dashboard