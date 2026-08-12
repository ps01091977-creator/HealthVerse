import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { assets } from './assets/assets'
import RelatedDoctors from './components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Calendar as CalendarIcon, Clock, ShieldCheck, Star, Award, Heart, MessageSquare } from 'lucide-react'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedTime, setSelectedTime] = useState('')

  const fetchDocInfo = async () => {
    const doc = doctors.find((doc) => doc._id === docId)
    if (doc) {
      setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
    }
  }

  const getAvailableSlots = () => {
    if (!docInfo) return
    setDocSlots([])

    const today = new Date()

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
        const slotTime = formattedTime

        const isSlotAvailable =
          !docInfo?.slots_booked?.[slotDate] ||
          !docInfo.slots_booked[slotDate].includes(slotTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots((prev) => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book appointment')
      return navigate('/login')
    }

    if (!selectedTime) {
      return toast.warning('Please select a time slot')
    }

    const date = docSlots[selectedDayIndex][0].datetime
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = `${day}_${month}_${year}`

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`, 
        { docId, slotDate, slotTime: selectedTime }, 
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message || 'Appointment requested successfully!')
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  return (
    docInfo && (
      <div className="space-y-8 text-left">
        {/* Doctor Summary Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-56 h-56 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 flex-shrink-0">
            <img className="w-full h-full object-cover object-top" src={docInfo.image} alt={docInfo.name} />
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{docInfo.name}</h2>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Verified Practitioner
                </span>
              </div>
              <p className="text-xs text-zinc-450 dark:text-zinc-400 mt-1 font-semibold">{docInfo.degree} — {docInfo.speciality}</p>
            </div>

            {/* Ratings & Reviews Breakdown */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{docInfo.averageRating || '5.0'}</span>
                <span className="text-zinc-400">({docInfo.ratingCount || 0} reviews)</span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-350">
                <Award className="w-4 h-4 text-primary" />
                <span>{docInfo.experience} Clinical Practice</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500" /> Professional Bio</h3>
              <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-relaxed max-w-2xl">{docInfo.about}</p>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-xs">
              <span className="text-zinc-550 dark:text-zinc-400">Consultation Fee:</span>
              <strong className="text-sm text-zinc-900 dark:text-zinc-50">{currencySymbol} {docInfo.fees}</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Booking & Slots Grid */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Select Appointment Schedule</h3>
              <p className="text-[10px] text-zinc-400">Choose date and available time slot to request a session.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {/* Days Column Headers */}
            {docSlots.map((item, index) => {
              const dateObj = item[0]?.datetime
              if (!dateObj) return null
              const isSelected = selectedDayIndex === index
              return (
                <button
                  key={index}
                  onClick={() => { setSelectedDayIndex(index); setSelectedTime(''); }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary border-primary text-white shadow-sm' 
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100/50'
                  }`}
                >
                  <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {daysOfWeek[dateObj.getDay()]}
                  </span>
                  <span className="text-sm font-extrabold">{dateObj.getDate()}</span>
                  <span className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                    {item.length} Slots
                  </span>
                </button>
              )
            })}
          </div>

          {/* Time Slots Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Available Hours for Selected Date
            </h4>
            
            {docSlots[selectedDayIndex]?.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                {docSlots[selectedDayIndex].map((item, index) => {
                  const isTimeSelected = selectedTime === item.time
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedTime(item.time)}
                      className={`py-2 px-3 rounded-lg text-center text-xs font-medium border transition-all cursor-pointer ${
                        isTimeSelected
                          ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {item.time}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                No slots available on this date.
              </div>
            )}
          </div>

          {/* Booking Request trigger */}
          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={bookAppointment}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-8 py-3 rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              Book Selected Consultation
            </button>
          </div>
        </div>

        {/* Doctor Reviews Logs (Optional visual addition) */}
        {docInfo.ratings && docInfo.ratings.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-505" /> Patient Review Log
            </h3>
            
            <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {docInfo.ratings.map((review, i) => (
                <div key={i} className="py-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-250">Verified Patient</span>
                    <span className="text-[10px] text-zinc-400">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {Array(5).fill(0).map((_, starIdx) => (
                      <Star key={starIdx} className={`w-3 h-3 ${starIdx < review.rating ? 'text-amber-500 fill-current' : 'text-zinc-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 italic">"{review.review}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Doctors */}
        <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
      </div>
    )
  )
}

export default Appointment
