import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { 
  Calendar, 
  Search, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  DollarSign, 
  AlertCircle,
  Video
} from 'lucide-react'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'completed', 'cancelled'

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  const totalCount = appointments?.length || 0
  const pendingCount = appointments?.filter(a => !a.cancelled && !a.isCompleted)?.length || 0
  const completedCount = appointments?.filter(a => a.isCompleted)?.length || 0
  const cancelledCount = appointments?.filter(a => a.cancelled)?.length || 0

  const filteredAppointments = (appointments || []).filter((item) => {
    const patientName = item.userData?.name?.toLowerCase() || ''
    const matchesSearch = patientName.includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'pending') {
      return !item.cancelled && !item.isCompleted
    }
    if (statusFilter === 'completed') {
      return item.isCompleted
    }
    if (statusFilter === 'cancelled') {
      return item.cancelled
    }
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      
      {/* Header & Metric Counter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Doctor Consultation Schedule
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your patient appointments, consultation completions, and cancellations
          </p>
        </div>

        {/* Counter Summary Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Total: <span className="text-primary font-black">{totalCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-400">
            Pending: <span className="font-black">{pendingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Completed: <span className="font-black">{completedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs font-bold text-red-700 dark:text-red-400">
            Cancelled: <span className="font-black">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search patient by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Desktop Table & Mobile Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">No appointments found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query or switching the status filter.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: Clean Table (hidden on mobile) */}
          <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <th className="py-3.5 px-5">#</th>
                    <th className="py-3.5 px-5">Patient Name</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Age</th>
                    <th className="py-3.5 px-5">Consultation Slot</th>
                    <th className="py-3.5 px-4">Fee</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300">
                  {filteredAppointments.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-zinc-400">{index + 1}</td>
                      
                      {/* Patient */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.userData?.image || '/fallback-user.png'}
                            alt={item.userData?.name}
                            className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100"
                          />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white leading-tight">
                              {item.userData?.name || 'Guest Patient'}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                              {item.userData?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.payment 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.payment ? 'Online' : 'CASH'}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-4 font-semibold text-zinc-500 dark:text-zinc-400">
                        {calculateAge(item.userData?.dob) || '24'} yrs
                      </td>

                      {/* Date & Slot */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{slotDateFormat(item.slotDate)}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium">
                            {item.slotTime}
                          </div>
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 font-black text-zinc-900 dark:text-zinc-100">
                        {currency}{item.amount}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {item.cancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        ) : item.isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => completeAppointment(item._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-emerald-500/20 cursor-pointer"
                              title="Mark appointment completed"
                            >
                              <Check className="w-3.5 h-3.5" /> Complete
                            </button>
                            <button
                              onClick={() => cancelAppointment(item._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                              title="Cancel appointment"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE VIEW: Responsive Cards (visible only on mobile) */}
          <div className="md:hidden space-y-3">
            {filteredAppointments.map((item, index) => (
              <div
                key={item._id || index}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm space-y-3"
              >
                {/* Top Card Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.userData?.image || '/fallback-user.png'}
                      alt={item.userData?.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950 dark:text-white">
                        {item.userData?.name || 'Guest Patient'}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Age: {calculateAge(item.userData?.dob) || '24'} yrs
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black text-xs">
                    {currency}{item.amount}
                  </span>
                </div>

                {/* Schedule & Payment Details */}
                <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/60 rounded-xl space-y-2 border border-zinc-150 dark:border-zinc-850">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Schedule:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {slotDateFormat(item.slotDate)} at {item.slotTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Payment Mode:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.payment ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {item.payment ? 'Online Verified' : 'Cash at Clinic'}
                    </span>
                  </div>
                </div>

                {/* Status or Action Buttons */}
                <div className="pt-1 flex items-center justify-between">
                  <div>
                    {item.cancelled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                        <Clock className="w-3.5 h-3.5" /> Scheduled
                      </span>
                    )}
                  </div>

                  {!item.cancelled && !item.isCompleted && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => completeAppointment(item._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Done
                      </button>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default DoctorAppointments