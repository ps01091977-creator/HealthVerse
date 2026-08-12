import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { ArrowRight, UserCheck, Star } from 'lucide-react'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)

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

  // Skeleton Loader Component
  const DoctorSkeleton = () => (
    <div className='border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm animate-pulse space-y-3 p-3'>
      <div className='bg-zinc-200 dark:bg-zinc-800 w-full h-48 rounded-xl'></div>
      <div className='space-y-2 px-1 pb-2'>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-3.5 w-1/3 rounded-md'></div>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-4.5 w-3/4 rounded-md'></div>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-3.5 w-1/2 rounded-md'></div>
      </div>
    </div>
  )

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-zinc-800 dark:text-zinc-200 md:mx-4'>
      <h2 className='text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50'>Top Doctors to Book</h2>
      <p className='sm:w-1/2 text-center text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md'>
        Connect with our highly rated medical specialists for immediate or scheduled consultation.
      </p>

      {error ? (
        <div className='w-full p-6 text-center border border-red-200/50 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/10 rounded-2xl text-red-500 text-xs'>
          Failed to load doctor database: {error.message}. Please try again later.
        </div>
      ) : (
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-8 px-2'>
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <DoctorSkeleton key={i} />)
          ) : doctors && doctors.length > 0 ? (
            doctors.slice(0, 10).map((item, index) => (
              <div 
                onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
                className='group border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-850 hover:translate-y-[-4px] transition-all duration-300 relative flex flex-col justify-between' 
                key={index}
              >
                <div className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 h-56">
                  <img 
                    className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105' 
                    src={item.image} 
                    alt={item.name} 
                  />
                  {/* Availability Badge Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${
                      item.available 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <div className='p-4 flex-grow flex flex-col justify-between space-y-2 border-t border-zinc-100 dark:border-zinc-850'>
                  <div>
                    <span className='text-[10px] text-primary dark:text-primary font-bold uppercase tracking-wider'>{item.speciality}</span>
                    <h3 className='text-zinc-900 dark:text-zinc-50 text-sm font-semibold truncate w-full mt-1'>{item.name}</h3>
                  </div>
                  <div className='flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1'>
                    <span>Fee: ₹{item.fees}</span>
                    <span className='flex items-center gap-0.5 text-amber-500 font-semibold'>
                      <Star className='w-3 h-3 fill-current' /> {item.experience || '3+ yrs'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-full flex flex-col items-center justify-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400'>
              <UserCheck className="w-8 h-8 mb-2 text-zinc-300" />
              <p className='text-xs'>No active doctors available on the system.</p>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} 
        className='border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-10 py-2.5 rounded-xl mt-12 text-xs font-semibold tracking-wide flex items-center gap-1 transition-all active:scale-[0.98] cursor-pointer'
      >
        View All Doctors <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default TopDoctors
