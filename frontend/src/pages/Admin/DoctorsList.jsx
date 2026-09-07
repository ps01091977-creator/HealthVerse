import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  GraduationCap, 
  Stethoscope, 
  AlertTriangle,
  X,
  ShieldCheck
} from 'lucide-react'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, removeDoctor } = useContext(AdminContext)
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState('All')
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  const specialities = [
    'All',
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ]

  const totalDoctors = doctors?.length || 0
  const availableDoctors = doctors?.filter(d => d.available)?.length || 0

  const filteredDoctors = (doctors || []).filter((doc) => {
    const matchesName = doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpec = selectedSpeciality === 'All' || doc.speciality?.toLowerCase() === selectedSpeciality.toLowerCase()
    return matchesName && matchesSpec
  })

  const confirmDelete = async () => {
    if (deleteConfirmDoc) {
      await removeDoctor(deleteConfirmDoc._id)
      setDeleteConfirmDoc(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Medical Staff Roster
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage provider profiles, consultation rates, and active schedule status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Active: <span className="text-emerald-500 font-black">{availableDoctors}</span> / {totalDoctors}
          </div>

          <button
            onClick={() => navigate('/add-doctor')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Doctor</span>
          </button>
        </div>
      </div>

      {/* Search and Specialty Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {specialities.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpeciality(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSpeciality === spec
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">No doctors matched</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try clearing the search filter or change the selected speciality.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredDoctors.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              {/* Image & Status Badge Header */}
              <div className="relative bg-zinc-100 dark:bg-zinc-950 h-52 sm:h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />

                {/* Availability status tag */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md ${
                      item.available
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-zinc-800/90 text-zinc-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.available ? 'bg-white animate-pulse' : 'bg-zinc-400'
                      }`}
                    />
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Experience Chip */}
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">
                  {item.experience || '1 Year'}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-zinc-950 dark:text-white truncate">
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span className="truncate">{item.speciality}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {item.degree || 'MBBS'}
                  </p>
                </div>

                {/* Fee & Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() => changeAvailability(item._id)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                    />
                    <span>Accepting</span>
                  </label>

                  <button
                    onClick={() => setDeleteConfirmDoc(item)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                    title="Remove doctor from roster"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                Remove Doctor?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Are you sure you want to remove <span className="font-bold text-zinc-900 dark:text-white">{deleteConfirmDoc.name}</span>? This will revoke their portal access.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorsList