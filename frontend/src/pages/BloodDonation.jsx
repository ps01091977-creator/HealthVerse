import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  Heart, 
  MapPin, 
  AlertOctagon, 
  Clock, 
  Plus, 
  Phone, 
  Shield, 
  Activity, 
  CheckCircle2,
  ChevronRight,
  Filter
} from 'lucide-react'

const BloodDonation = () => {
  const { backendUrl, token, slotDateFormat } = useContext(AppContext)

  // Navigation tabs: 'requests', 'register', 'request-blood', 'donors-map'
  const [activeTab, setActiveTab] = useState('requests')

  // Donors State
  const [donors, setDonors] = useState([])
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('all')
  const [isDonorsLoading, setIsDonorsLoading] = useState(false)

  // Active Requests State
  const [bloodRequests, setBloodRequests] = useState([])
  const [isRequestsLoading, setIsRequestsLoading] = useState(false)

  // Register Donor Form
  const [donorForm, setDonorForm] = useState({
    name: '', bloodGroup: 'O+', phone: '', email: '', address: '', lastDonationDate: ''
  })
  const [isRegLoading, setIsRegLoading] = useState(false)

  // Request Blood Form
  const [requestForm, setRequestForm] = useState({
    patientName: '', bloodGroup: 'O+', units: '', hospital: '', phone: '', urgency: 'Urgent', address: ''
  })
  const [isReqLoading, setIsReqLoading] = useState(false)

  // Selected map pin donor details
  const [hoveredDonor, setHoveredDonor] = useState(null)

  // Load registered donors
  const fetchDonors = async () => {
    setIsDonorsLoading(true)
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/blood/list-donors?bloodGroup=${selectedBloodGroup}`
      )
      if (data.success) {
        setDonors(data.donors)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDonorsLoading(false)
    }
  }

  // Load blood requests
  const fetchRequests = async () => {
    setIsRequestsLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/blood/list-requests`)
      if (data.success) {
        setBloodRequests(data.requests)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsRequestsLoading(false)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [selectedBloodGroup])

  useEffect(() => {
    fetchRequests()
  }, [])

  // Donor Onboarding Submit
  const handleRegisterDonorSubmit = async (e) => {
    e.preventDefault()
    if (!donorForm.name || !donorForm.phone || !donorForm.email || !donorForm.address) {
      return toast.warning('Please enter required details')
    }

    setIsRegLoading(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/blood/register`,
        {
          userId: "patient_local", // sandbox ID placeholder
          name: donorForm.name,
          bloodGroup: donorForm.bloodGroup,
          phone: donorForm.phone,
          email: donorForm.email,
          address: donorForm.address,
          lastDonationDate: donorForm.lastDonationDate || ''
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        setDonorForm({ name: '', bloodGroup: 'O+', phone: '', email: '', address: '', lastDonationDate: '' })
        fetchDonors()
        setActiveTab('donors-map')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsRegLoading(false)
    }
  }

  // Request Blood Submit
  const handleRequestBloodSubmit = async (e) => {
    e.preventDefault()
    if (!requestForm.patientName || !requestForm.units || !requestForm.hospital || !requestForm.phone || !requestForm.address) {
      return toast.warning('Please fill in required fields')
    }

    setIsReqLoading(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/blood/request`,
        requestForm,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        setRequestForm({
          patientName: '', bloodGroup: 'O+', units: '', hospital: '', phone: '', urgency: 'Urgent', address: ''
        })
        fetchRequests()
        setActiveTab('requests')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsReqLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto py-4">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Heart className="w-6.5 h-6.5 text-red-500 fill-red-500/20" /> Blood Donation & Registry
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-normal">Fulfill emergency triage blood requests and connect with active donors.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeTab === 'requests' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary font-bold' : 'text-zinc-500'
            }`}
          >
            Emergency Requests
          </button>
          <button 
            onClick={() => setActiveTab('donors-map')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeTab === 'donors-map' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary font-bold' : 'text-zinc-500'
            }`}
          >
            Nearby Donors Map
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeTab === 'register' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary font-bold' : 'text-zinc-500'
            }`}
          >
            Register as Donor
          </button>
          <button 
            onClick={() => setActiveTab('request-blood')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
              activeTab === 'request-blood' ? 'bg-white dark:bg-zinc-850 shadow-sm text-primary font-bold' : 'text-zinc-500'
            }`}
          >
            Request Blood
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO COLUMNS: DYNAMIC TABS WORKSPACE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: EMERGENCY REQUESTS BOARD */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                <AlertOctagon className="w-4.5 h-4.5 text-red-500" /> Active Emergency Requests
              </h3>

              {isRequestsLoading ? (
                <div className="py-10 text-center text-xs text-zinc-400">Loading requests...</div>
              ) : bloodRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400 border border-dashed rounded-2xl">
                  No active blood requests logged.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bloodRequests.map((req) => (
                    <div 
                      key={req._id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-4.5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            req.urgency === 'Critical' 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-amber-500/10 text-amber-505 border border-amber-500/20'
                          }`}>
                            {req.urgency}
                          </span>
                          
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            req.status === 'Approved' ? 'bg-primary/10 text-primary' : 
                            req.status === 'Fulfilled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                            <span className="w-5.5 h-5.5 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-black">
                              {req.bloodGroup}
                            </span>
                            {req.units} Units Required
                          </h4>
                          <p className="text-zinc-500 mt-1 font-semibold text-[11px]">{req.patientName}</p>
                        </div>

                        <div className="space-y-1 text-zinc-500 text-[11px]">
                          <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {req.hospital}</p>
                          <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-zinc-400" /> {req.phone}</p>
                        </div>
                      </div>

                      {req.status === 'Approved' && (
                        <a 
                          href={`tel:${req.phone}`}
                          className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors mt-3"
                        >
                          <Phone className="w-3.5 h-3.5" /> Contact Hospital
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEARBY DONORS MAP */}
          {activeTab === 'donors-map' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-primary" /> Geospatial Location Map
                </h3>
                
                {/* Filter blood group */}
                <div className="flex items-center gap-1 bg-zinc-50 border p-1 rounded-xl text-xs">
                  <Filter className="w-3.5 h-3.5 text-zinc-400" />
                  <select 
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value)}
                    className="bg-transparent font-semibold focus:outline-none text-[10px]"
                  >
                    <option value="all">All Blood Groups</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="O-">O-</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>

              {/* MOCK GOOGLE MAP COMPONENT */}
              <div className="relative w-full h-80 rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden flex flex-col justify-between p-4 shadow-sm select-none">
                {/* Grid Visual Canvas */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"></div>
                
                {/* Central Target Landmark */}
                <div className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-[9px] font-bold text-primary mt-1 shadow bg-white px-1.5 py-0.5 rounded border">HealthVerse Central</span>
                </div>

                {/* Render mock donor coordinates coordinates mapping */}
                {donors.map((donor, idx) => {
                  // Generate visual positions based on latitude offsets
                  const topOffset = 50 + ((donor.latitude - 12.9716) * 1200)
                  const leftOffset = 50 + ((donor.longitude - 77.5946) * 1200)
                  return (
                    <div 
                      key={donor._id}
                      className="absolute z-10 cursor-pointer"
                      style={{ top: `${Math.max(10, Math.min(90, topOffset))}%`, left: `${Math.max(10, Math.min(90, leftOffset))}%` }}
                      onMouseEnter={() => setHoveredDonor(donor)}
                      onMouseLeave={() => setHoveredDonor(null)}
                    >
                      <div className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-650 flex items-center justify-center text-white text-[9px] font-black shadow-md border-2 border-white animate-bounce">
                        {donor.bloodGroup}
                      </div>
                    </div>
                  )
                })}

                {/* Hover overlay panel */}
                {hoveredDonor && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-zinc-950 p-3 rounded-xl border shadow-xl z-20 flex justify-between items-center animate-in fade-in duration-150">
                    <div className="text-xs">
                      <p className="font-extrabold text-zinc-900">{hoveredDonor.name}</p>
                      <p className="text-[10px] text-zinc-400">{hoveredDonor.address}</p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-black">
                      {hoveredDonor.bloodGroup}
                    </span>
                  </div>
                )}

                <div className="z-10 text-[9px] text-zinc-400 bg-white/85 px-2 py-1 rounded border max-w-[150px]">
                  💡 Hover pins to view coordinates donor cards.
                </div>
              </div>

              {/* Donors List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {donors.map((donor) => (
                  <div key={donor._id} className="p-3 border border-zinc-200/60 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-850 dark:text-zinc-100">{donor.name}</p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5" /> {donor.address}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-black">
                        {donor.bloodGroup}
                      </span>
                      <a href={`tel:${donor.phone}`} className="p-1.5 bg-zinc-50 border rounded-lg hover:bg-zinc-100 text-zinc-650 cursor-pointer">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DONOR REGISTRATION FORM */}
          {activeTab === 'register' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4 max-w-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <Shield className="w-4.5 h-4.5 text-primary" /> Donor Eligibility Registry
              </h3>

              <form onSubmit={handleRegisterDonorSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="donor-full-name" className="font-bold text-zinc-550">Full Name *</label>
                    <input
                      id="donor-full-name"
                      name="donorName"
                      autoComplete="name"
                      type="text"
                      required
                      value={donorForm.name}
                      onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="donor-blood-group" className="font-bold text-zinc-550">Blood Group *</label>
                    <select
                      id="donor-blood-group"
                      name="donorBloodGroup"
                      value={donorForm.bloodGroup}
                      onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="donor-phone-num" className="font-bold text-zinc-550">Phone Number *</label>
                    <input
                      id="donor-phone-num"
                      name="donorPhone"
                      autoComplete="tel"
                      type="tel"
                      required
                      value={donorForm.phone}
                      onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="donor-email-id" className="font-bold text-zinc-550">Email ID *</label>
                    <input
                      id="donor-email-id"
                      name="donorEmail"
                      autoComplete="email"
                      type="email"
                      required
                      value={donorForm.email}
                      onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                      placeholder="vikram@gmail.com"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="donor-address-line" className="font-bold text-zinc-550">Current Residential Address *</label>
                    <input
                      id="donor-address-line"
                      name="donorAddress"
                      autoComplete="street-address"
                      type="text"
                      required
                      value={donorForm.address}
                      onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
                      placeholder="e.g. Indiranagar, Bangalore"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="donor-last-date" className="font-bold text-zinc-550 font-sans">Last Blood Donation Date (Leave empty if first time)</label>
                    <input
                      id="donor-last-date"
                      name="donorLastDonationDate"
                      type="date"
                      value={donorForm.lastDonationDate}
                      onChange={(e) => setDonorForm({ ...donorForm, lastDonationDate: e.target.value })}
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-zinc-50 border p-3.5 rounded-xl space-y-2 text-[10px] text-zinc-500">
                  <p className="font-bold text-zinc-700">📋 Eligibility Terms Checklist:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Minimum weight of 50 kilograms.</li>
                    <li>Age between 18 and 65 years.</li>
                    <li>Must be at least 90 days since your previous donation.</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isRegLoading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-sm transition-transform active:scale-98 cursor-pointer"
                >
                  {isRegLoading ? 'Registering...' : 'Submit Donor Application'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: REQUEST BLOOD FORM */}
          {activeTab === 'request-blood' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4 max-w-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <Plus className="w-4.5 h-4.5 text-primary" /> Request Blood Bank
              </h3>

              <form onSubmit={handleRequestBloodSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="req-patient-name" className="font-bold text-zinc-550">Patient Name *</label>
                    <input
                      id="req-patient-name"
                      name="patientName"
                      autoComplete="name"
                      type="text"
                      required
                      value={requestForm.patientName}
                      onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                      placeholder="e.g. Jordan Wilkes"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="req-blood-group" className="font-bold text-zinc-550">Required Blood Group *</label>
                    <select
                      id="req-blood-group"
                      name="bloodGroup"
                      value={requestForm.bloodGroup}
                      onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="req-units" className="font-bold text-zinc-550">Units Required *</label>
                    <input
                      id="req-units"
                      name="units"
                      type="number"
                      required
                      value={requestForm.units}
                      onChange={(e) => setRequestForm({ ...requestForm, units: e.target.value })}
                      placeholder="e.g. 3"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="req-urgency" className="font-bold text-zinc-550">Urgency Level *</label>
                    <select
                      id="req-urgency"
                      name="urgency"
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="Critical">Critical (Immediate)</option>
                      <option value="Urgent">Urgent (Within 24 Hrs)</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="req-hospital" className="font-bold text-zinc-550">Hospital Name & Address *</label>
                    <input
                      id="req-hospital"
                      name="hospital"
                      type="text"
                      required
                      value={requestForm.hospital}
                      onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })}
                      placeholder="e.g. Apollo Hospital, Bannerghatta Road"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="req-phone" className="font-bold text-zinc-550">Contact Number *</label>
                    <input
                      id="req-phone"
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      required
                      value={requestForm.phone}
                      onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="req-address" className="font-bold text-zinc-550">City location address *</label>
                    <input
                      id="req-address"
                      name="address"
                      autoComplete="address-level2"
                      type="text"
                      required
                      value={requestForm.address}
                      onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
                      placeholder="e.g. Bangalore"
                      className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isReqLoading}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isReqLoading ? 'Submitting...' : 'Submit Blood Request'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ELIGIBILITY & INFO CARD */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Donation Criteria
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border space-y-1 text-zinc-650">
                <p className="font-bold text-zinc-800">Who can donate blood?</p>
                <p className="text-[11px] leading-relaxed">Most people can donate blood if they are in good health. There are some basic requirements:</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">1</div>
                  <div className="flex-1">
                    <p className="font-semibold">Age Check</p>
                    <p className="text-[10px] text-zinc-400">Must be between 18 and 65 years old.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">2</div>
                  <div className="flex-1">
                    <p className="font-semibold">Weight Range</p>
                    <p className="text-[10px] text-zinc-400">Must weigh at least 50 kg.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">3</div>
                  <div className="flex-1">
                    <p className="font-semibold">Interval Period</p>
                    <p className="text-[10px] text-zinc-400">At least 90 days interval between donation schedules.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default BloodDonation
