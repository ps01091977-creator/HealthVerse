import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { ArrowRight, UserCheck, Star, Sparkles, CheckCircle2 } from 'lucide-react'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)
  const [selectedSpeciality, setSelectedSpeciality] = useState('All')

  // Fetch doctors with React Query
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`)
      if (data.success) {
        return data.doctors
      }
      throw new Error(data.message || 'Failed to fetch doctors')
    },
  })

  const specialities = [
    'All',
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ]

  // Filter doctors by selected specialty and limit to top 6 on home page
  const filteredDoctors = doctors
    ? (selectedSpeciality === 'All'
        ? doctors
        : doctors.filter(doc => doc.speciality?.toLowerCase() === selectedSpeciality.toLowerCase())
      ).slice(0, 6)
    : []

  // Skeleton Loader Component
  const DoctorSkeleton = () => (
    <div className='border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm animate-pulse space-y-3 p-3'>
      <div className='bg-zinc-200 dark:bg-zinc-800 w-full aspect-[4/3] rounded-xl'></div>
      <div className='space-y-2 px-1 pb-2'>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-3 w-1/3 rounded-md'></div>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-4 w-3/4 rounded-md'></div>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-3 w-1/2 rounded-md'></div>
      </div>
    </div>
  )

  return (
    <div className='flex flex-col items-center gap-4 my-12 sm:my-16 text-zinc-800 dark:text-zinc-200'>
      <div className="text-center space-y-2 max-w-xl px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-primary text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Featured Specialists
        </div>
        <h2 className='text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50'>
          Top Rated Doctors
        </h2>
        <p className='text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed'>
          Book instant or scheduled appointments with verified healthcare practitioners.
        </p>
      </div>

      {/* Quick Specialty Filter Chips */}
      <div className="w-full flex items-center gap-2 overflow-x-auto py-2 px-2 no-scrollbar justify-start sm:justify-center">
        {specialities.map((spec, i) => (
          <button
            key={i}
            onClick={() => setSelectedSpeciality(spec)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedSpeciality === spec
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {error ? (
        <div className='w-full p-6 text-center border border-red-200/50 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/10 rounded-2xl text-red-500 text-xs'>
          Failed to load doctor database: {error.message}. Please try again later.
        </div>
      ) : (
        /* Responsive 2-column mobile, 3-column tablet/desktop grid */
        <div className='w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5 pt-4 px-1'>
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <DoctorSkeleton key={i} />)
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((item, index) => (
              <div 
                onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }} 
                className='group border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between' 
                key={index}
              >
                {/* Doctor Avatar Container */}
                <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 aspect-[4/3] sm:aspect-square md:h-48">
                  <img 
                    className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105' 
                    src={item.image || assets.doc1} 
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = assets.doc1
                    }}
                  />
                  {/* Availability Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${
                      item.available !== false
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                        : 'bg-zinc-500/15 text-zinc-500 border-zinc-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.available !== false ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></span>
                      {item.available !== false ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className='p-3 sm:p-4 flex-grow flex flex-col justify-between space-y-2 border-t border-zinc-100 dark:border-zinc-800/80'>
                  <div>
                    <span className='text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-wider block truncate'>
                      {item.speciality}
                    </span>
                    <h3 className='text-zinc-900 dark:text-zinc-50 text-xs sm:text-sm font-bold truncate w-full mt-0.5'>
                      {item.name}
                    </h3>
                  </div>

                  <div className='flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/60'>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      ₹{item.fees}
                    </span>
                    <span className='flex items-center gap-0.5 text-amber-500 font-semibold'>
                      <Star className='w-3 h-3 fill-amber-400 text-amber-400' /> {item.experience || '4+ Yrs'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-full flex flex-col items-center justify-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400'>
              <UserCheck className="w-8 h-8 mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className='text-xs'>No doctors found for '{selectedSpeciality}'.</p>
            </div>
          )}
        </div>
      )}

      {/* View All CTA Button */}
      <div className="pt-6">
        <button 
          onClick={() => { navigate('/doctors'); window.scrollTo(0, 0) }} 
          className='border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-7 py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer'
        >
          <span>View All Doctors {doctors?.length ? `(${doctors.length})` : ''}</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </button>
      </div>
    </div>
  )
}

export default TopDoctors

