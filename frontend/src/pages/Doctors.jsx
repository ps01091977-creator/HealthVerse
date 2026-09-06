import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { Search, Filter, Sparkles, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)

  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

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

  // Filter list by specialty & search term
  const getFilteredDoctors = () => {
    if (!doctors) return []
    return doctors.filter((doc) => {
      const matchesSpecialty = !speciality || doc.speciality.toLowerCase() === speciality.toLowerCase()
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSpecialty && matchesSearch
    })
  }

  const filteredDoctors = getFilteredDoctors()

  // Pagination calculation
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [speciality, searchTerm])

  const specialties = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ]

  // Skeleton Loader Component
  const DoctorCardSkeleton = () => (
    <div className='border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden p-3 space-y-3 animate-pulse'>
      <div className='bg-zinc-200 dark:bg-zinc-800 w-full h-44 rounded-xl'></div>
      <div className='space-y-2 px-1'>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-3.5 w-1/3 rounded'></div>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-4.5 w-3/4 rounded'></div>
        <div className='bg-zinc-200 dark:bg-zinc-800 h-3.5 w-1/2 rounded'></div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Healthcare Professionals</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Search through our vetted medical specialists and book schedules instantly.</p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="doctors-search-input"
            name="searchDoctors"
            type="text"
            placeholder="Search by name, credentials, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100"
          />
        </div>

        {/* Current Specialty Indicator */}
        {speciality && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary dark:text-primary-foreground text-xs font-semibold rounded-lg self-start">
            <Sparkles className="w-3.5 h-3.5" /> Filtering: {speciality}
          </div>
        )}
      </div>

      <div className='flex flex-col md:flex-row items-start gap-6'>
        {/* Sidebar Filters */}
        <aside className='w-full md:w-56 flex flex-row md:flex-col gap-2.5 overflow-x-auto pb-3 md:pb-0 no-scrollbar flex-shrink-0'>
          <button
            onClick={() => navigate('/doctors')}
            className={`whitespace-nowrap px-4 py-2 text-left text-xs font-semibold rounded-xl border transition-all ${
              !speciality
                ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            All Specialties
          </button>
          
          {specialties.map((spec) => {
            const isActive = speciality?.toLowerCase() === spec.toLowerCase()
            return (
              <button
                key={spec}
                onClick={() => isActive ? navigate('/doctors') : navigate(`/doctors/${spec}`)}
                className={`whitespace-nowrap px-4 py-2 text-left text-xs font-semibold rounded-xl border transition-all ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
              >
                {spec}
              </button>
            )
          })}
        </aside>

        {/* Doctor Grid Listings */}
        <div className="flex-1 w-full space-y-6">
          {error ? (
            <div className="p-6 text-center border border-red-200/50 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/10 rounded-2xl text-red-500 text-xs">
              Failed to load doctor listings. Please try again.
            </div>
          ) : isLoading ? (
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
              {Array(4).fill(0).map((_, i) => <DoctorCardSkeleton key={i} />)}
            </div>
          ) : paginatedDoctors.length > 0 ? (
            <>
              <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
                {paginatedDoctors.map((item) => (
                  <div
                    onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }}
                    className='group border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between'
                    key={item._id}
                  >
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
                      <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${
                          item.available !== false
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${item.available !== false ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                          {item.available !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className='p-3 sm:p-3.5 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5'>
                      <div>
                        <span className='text-[9px] text-primary dark:text-primary font-bold uppercase tracking-wider block truncate'>{item.speciality}</span>
                        <h3 className='text-zinc-900 dark:text-zinc-50 text-xs font-bold truncate w-full mt-0.5'>{item.name}</h3>
                      </div>
                      <div className='flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/60'>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{item.fees}</span>
                        <span>{item.experience || '3+ Yrs'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs">
                  <span className="text-zinc-500">
                    Showing Page <strong className="text-zinc-800 dark:text-zinc-200">{currentPage}</strong> of <strong className="text-zinc-800 dark:text-zinc-200">{totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
              <UserPlus className="w-8 h-8 mb-2 text-zinc-300" />
              <p className="text-xs">No doctors found matching "{searchTerm}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors
