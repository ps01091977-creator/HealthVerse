import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { 
  Calendar, 
  MapPin, 
  X, 
  Check, 
  Clock, 
  ShieldAlert, 
  CreditCard, 
  HelpCircle, 
  Loader2, 
  Video, 
  Star, 
  RefreshCw,
  TrendingUp,
  MessageSquare
} from 'lucide-react'

const MyAppointments = () => {
  const { backendUrl, token, doctors, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Modal States
  const [cancellingId, setCancellingId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [paymentActiveId, setPaymentActiveId] = useState(null)

  // Reschedule States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleAppt, setRescheduleAppt] = useState(null)
  const [rescheduleSlots, setRescheduleSlots] = useState([])
  const [rescheduleDayIndex, setRescheduleDayIndex] = useState(0)
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [isRescheduling, setIsRescheduling] = useState(false)

  // Rating States
  const [isRateOpen, setIsRateOpen] = useState(false)
  const [ratingAppt, setRatingAppt] = useState(null)
  const [userRating, setUserRating] = useState(5)
  const [userReview, setUserReview] = useState('')
  const [isRatingPending, setIsRatingPending] = useState(false)

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month)]} ${year}`
  }

  // TanStack Query for loading appointments
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments', token],
    queryFn: async () => {
      if (!token) return []
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } })
      if (data.success) {
        return data.appointments.reverse()
      }
      throw new Error(data.message || 'Failed to load appointments')
    },
    enabled: !!token,
  })

  // TanStack Mutation for cancelling appointments
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId) => {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      )
      if (!data.success) throw new Error(data.message)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Appointment cancelled successfully')
      queryClient.invalidateQueries(['appointments'])
      getDoctorsData()
      setIsConfirmOpen(false)
      setCancellingId(null)
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel appointment')
      setIsConfirmOpen(false)
      setCancellingId(null)
    }
  })

  // Load available reschedule slots for chosen doctor
  useEffect(() => {
    if (rescheduleAppt && doctors.length > 0) {
      const docInfo = doctors.find(doc => doc._id === rescheduleAppt.docId)
      if (!docInfo) return

      const slots_booked = docInfo.slots_booked || {}
      const today = new Date()
      const generatedSlots = []

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today)
        currentDate.setDate(today.getDate() + i)

        const endTime = new Date(currentDate)
        endTime.setHours(21, 0, 0, 0)

        if (today.getDate() === currentDate.getDate()) {
          currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
          currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
        } else {
          currentDate.setHours(10)
          currentDate.setMinutes(0)
        }

        const timeSlots = []
        while (currentDate < endTime) {
          const formattedTime = currentDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })

          const day = currentDate.getDate()
          const month = currentDate.getMonth() + 1
          const year = currentDate.getFullYear()
          const slotDate = `${day}_${month}_${year}`

          const isSlotAvailable =
            !slots_booked[slotDate] || !slots_booked[slotDate].includes(formattedTime)

          if (isSlotAvailable) {
            timeSlots.push({
              datetime: new Date(currentDate),
              time: formattedTime
            })
          }
          currentDate.setMinutes(currentDate.getMinutes() + 30)
        }
        generatedSlots.push(timeSlots)
      }
      setRescheduleSlots(generatedSlots)
    }
  }, [rescheduleAppt, doctors])

  // Handle Rescheduling
  const executeReschedule = async () => {
    if (!rescheduleTime) {
      return toast.warning('Please select a time slot')
    }
    setIsRescheduling(true)

    const date = rescheduleSlots[rescheduleDayIndex][0].datetime
    const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/reschedule-appointment`,
        { appointmentId: rescheduleAppt._id, newSlotDate: slotDate, newSlotTime: rescheduleTime },
        { headers: { token } }
      )
      if (data.success) {
        toast.success('Appointment rescheduled successfully!')
        queryClient.invalidateQueries(['appointments'])
        getDoctorsData()
        setIsRescheduleOpen(false)
        setRescheduleAppt(null)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsRescheduling(false)
    }
  }

  // Handle Review Submission
  const submitDoctorRating = async () => {
    setIsRatingPending(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/rate-doctor`,
        { appointmentId: ratingAppt._id, rating: userRating, review: userReview },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message || 'Thank you for your rating!')
        queryClient.invalidateQueries(['appointments'])
        getDoctorsData()
        setIsRateOpen(false)
        setRatingAppt(null)
        setUserReview('')
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsRatingPending(false)
    }
  }

  // Razorpay integration
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'HealthVerse AI Payment',
      description: "Secure Consultation Fee",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(`${backendUrl}/api/user/verifyRazorpay`, response, { headers: { token } });
          if (data.success) {
            toast.success('Payment verified successfully')
            queryClient.invalidateQueries(['appointments'])
          } else {
            toast.error(data.message || 'Payment verification failed')
          }
        } catch (error) {
          toast.error(error.message || 'Error verifying payment')
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const handleRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Payment initiation failed')
    }
  }

  const triggerCancelConfirmation = (id) => {
    setCancellingId(id)
    setIsConfirmOpen(true)
  }

  const triggerRescheduleModal = (appt) => {
    setRescheduleAppt(appt)
    setRescheduleTime('')
    setRescheduleDayIndex(0)
    setIsRescheduleOpen(true)
  }

  const triggerRateModal = (appt) => {
    setRatingAppt(appt)
    setUserRating(5)
    setUserReview('')
    setIsRateOpen(true)
  }

  const AppointmentSkeleton = () => (
    <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 animate-pulse">
      <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
      <div className="flex-1 space-y-2.5">
        <div className="bg-zinc-200 dark:bg-zinc-800 h-4 w-1/4 rounded"></div>
        <div className="bg-zinc-200 dark:bg-zinc-800 h-3 w-1/5 rounded"></div>
        <div className="bg-zinc-200 dark:bg-zinc-800 h-3 w-1/3 rounded"></div>
      </div>
      <div className="w-32 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg self-end md:self-center"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">My Appointments</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Review scheduled sessions, complete payments, and join virtual examinations.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array(3).fill(0).map((_, idx) => <AppointmentSkeleton key={idx} />)
        ) : error ? (
          <div className="p-6 text-center border border-red-200/50 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/10 rounded-xl text-red-500 text-xs">
            Failed to fetch appointments: {error.message}
          </div>
        ) : appointments.length > 0 ? (
          appointments.map((item) => (
            <div 
              key={item._id} 
              className="border border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 rounded-2xl flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md transition-all justify-between items-start md:items-center"
            >
              {/* Doctor Details */}
              <div className="flex gap-4 items-start w-full md:w-auto">
                <img 
                  className="w-20 h-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-shrink-0" 
                  src={item.docData?.image || '/fallback-doctor.png'} 
                  alt={item.docData?.name || 'Doctor'} 
                />
                <div className="space-y-1.5 text-xs text-zinc-550 dark:text-zinc-400">
                  <h3 className="text-zinc-900 dark:text-zinc-50 text-sm font-semibold leading-none">{item.docData?.name}</h3>
                  <p className="text-primary dark:text-primary font-bold text-[10px] uppercase tracking-wider">{item.docData?.speciality}</p>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{item.docData?.address?.line1 || 'Street X'}, {item.docData?.address?.line2 || 'City Y'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-350">
                      {slotDateFormat(item.slotDate)} at {item.slotTime}
                    </span>
                  </div>

                  {/* Render Stepper Timeline Tracker */}
                  {item.timeline && item.timeline.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Consultation Timeline</p>
                      <div className="flex items-center gap-2">
                        {item.timeline.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                              <span className="text-[9px] font-semibold text-zinc-700 dark:text-zinc-300">{step.status}</span>
                            </div>
                            {idx < item.timeline.length - 1 && (
                              <span className="h-[1px] w-4 bg-zinc-200 dark:bg-zinc-800"></span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-row md:flex-col gap-3 justify-end items-center md:items-stretch w-full md:w-48 text-xs">
                
                {/* Status Indicator */}
                <div className="w-full text-left md:text-right">
                  {item.cancelled ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wide">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide">
                      Completed
                    </span>
                  ) : item.status === 'Approved' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-505 text-[10px] font-bold uppercase tracking-wide">
                      Pending
                    </span>
                  )}
                </div>

                {/* Operations */}
                <div className="flex flex-col gap-2 w-full">
                  {/* Video link */}
                  {!item.cancelled && !item.isCompleted && item.status === 'Approved' && item.videoLink && (
                    <a 
                      href={item.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Telehealth Room
                    </a>
                  )}

                  {/* Payment Gateways */}
                  {!item.cancelled && item.status === 'Approved' && !item.payment && !item.isCompleted && (
                    paymentActiveId === item._id ? (
                      <button 
                        onClick={() => handleRazorpay(item._id)}
                        className="w-full py-2 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Open Razorpay
                      </button>
                    ) : (
                      <button 
                        onClick={() => setPaymentActiveId(item._id)}
                        className="w-full py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold flex items-center justify-center gap-1 shadow-sm"
                      >
                        Pay Fee (₹{item.amount})
                      </button>
                    )
                  )}

                  {/* Reschedule Button */}
                  {!item.cancelled && !item.isCompleted && (
                    <button 
                      onClick={() => triggerRescheduleModal(item)}
                      className="w-full py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Reschedule Visit
                    </button>
                  )}

                  {/* Rating button */}
                  {item.isCompleted && (item.rating === 0 || !item.rating) && (
                    <button 
                      onClick={() => triggerRateModal(item)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" /> Rate Consultation
                    </button>
                  )}

                  {/* Paid Badge */}
                  {!item.cancelled && item.payment && !item.isCompleted && (
                    <span className="w-full py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-xl font-medium text-center flex items-center justify-center gap-1 cursor-default">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Paid
                    </span>
                  )}

                  {/* Cancel Button */}
                  {!item.cancelled && !item.isCompleted && (
                    <button 
                      onClick={() => triggerCancelConfirmation(item._id)}
                      className="w-full py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/10 hover:text-red-500 text-zinc-500 rounded-xl font-semibold transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
            <Clock className="w-8 h-8 mb-2 text-zinc-300" />
            <p className="text-xs">You have no scheduled appointments.</p>
            <button 
              onClick={() => navigate('/doctors')} 
              className="mt-4 text-xs font-semibold text-primary hover:underline"
            >
              Browse and Book Doctors
            </button>
          </div>
        )}
      </div>

      {/* Cancellation confirmation modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Cancel Appointment</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-tight">This slot will be released back for other patients.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-650 dark:text-zinc-350">Are you sure you want to cancel this appointment? This action is irreversible.</p>
            
            <div className="flex gap-2 justify-end pt-2 text-xs">
              <button 
                onClick={() => { setIsConfirmOpen(false); setCancellingId(null); }}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold"
                disabled={cancelMutation.isPending}
              >
                No, Keep
              </button>
              <button 
                onClick={() => cancelMutation.mutate(cancellingId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center gap-1"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule schedule selection modal */}
      {isRescheduleOpen && rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Reschedule Consultation</h3>
                <p className="text-zinc-550 dark:text-zinc-400 text-[10px]">Select a new available time slot on the calendar grid.</p>
              </div>
              <button 
                onClick={() => { setIsRescheduleOpen(false); setRescheduleAppt(null); }}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Days row selection */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {rescheduleSlots.map((item, index) => {
                const dateObj = item[0]?.datetime
                if (!dateObj) return null
                const isSelected = rescheduleDayIndex === index
                return (
                  <button
                    key={index}
                    onClick={() => { setRescheduleDayIndex(index); setRescheduleTime(''); }}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100/50'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase">{daysOfWeek[dateObj.getDay()]}</span>
                    <span className="text-xs font-bold">{dateObj.getDate()}</span>
                  </button>
                )
              })}
            </div>

            {/* Slots available */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500">Available time slots:</h4>
              {rescheduleSlots[rescheduleDayIndex]?.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto no-scrollbar">
                  {rescheduleSlots[rescheduleDayIndex].map((item, index) => {
                    const isTimeSelected = rescheduleTime === item.time
                    return (
                      <button
                        key={index}
                        onClick={() => setRescheduleTime(item.time)}
                        className={`py-1.5 px-2.5 rounded-lg text-center text-[11px] font-semibold border transition-all cursor-pointer ${
                          isTimeSelected
                            ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50'
                        }`}
                      >
                        {item.time}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No available times on this date.</p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <button 
                onClick={() => { setIsRescheduleOpen(false); setRescheduleAppt(null); }}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold"
                disabled={isRescheduling}
              >
                Cancel
              </button>
              <button 
                onClick={executeReschedule}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                disabled={isRescheduling}
              >
                {isRescheduling ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ratings review submission modal */}
      {isRateOpen && ratingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Rate Consultation</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px]">Provide feedback for {ratingAppt.docData?.name}</p>
              </div>
              <button 
                onClick={() => { setIsRateOpen(false); setRatingAppt(null); }}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-405"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stars selection */}
            <div className="flex items-center gap-1.5 py-2">
              <span className="text-xs text-zinc-500 font-medium">Select Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <Star 
                    key={starVal}
                    onClick={() => setUserRating(starVal)}
                    className={`w-6 h-6 cursor-pointer hover:scale-105 transition-transform ${
                      starVal <= userRating ? 'text-amber-500 fill-current' : 'text-zinc-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review text comment */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-zinc-550">Written Review / Remarks</label>
              <textarea 
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share details of your clinical experience and visit..."
                className="w-full h-24 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs">
              <button 
                onClick={() => { setIsRateOpen(false); setRatingAppt(null); }}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold"
                disabled={isRatingPending}
              >
                Cancel
              </button>
              <button 
                onClick={submitDoctorRating}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                disabled={isRatingPending}
              >
                {isRatingPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments
