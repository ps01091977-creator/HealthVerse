import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { 
  User, 
  Stethoscope, 
  Award, 
  MapPin, 
  DollarSign, 
  Edit3, 
  Save, 
  CheckCircle2, 
  Star, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      const updateData = {
        address: profileData.address,
        fees: Number(profileData.fees),
        about: profileData.about,
        available: profileData.available,
      }

      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, updateData, {
        headers: { 
          Authorization: `Bearer ${dToken}`,
          dToken 
        },
      })

      if (data.success) {
        toast.success('🎉 Profile updated successfully!')
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  if (!profileData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Header Title & Edit Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Doctor Profile
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your credentials, clinic address, consultation fees, and bio
          </p>
        </div>

        <div>
          {isEdit ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEdit(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateProfile}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEdit(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Card with Hero Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Cover Graphic Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-primary to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Verified Practitioner</span>
          </div>
        </div>

        {/* Profile Content Container */}
        <div className="px-5 sm:px-8 pb-8">
          
          {/* Avatar & Key Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative">
                <img
                  src={profileData.image}
                  alt={profileData.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-zinc-900 shadow-xl bg-zinc-100"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white">
                    {profileData.name}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  <span>{profileData.degree} — {profileData.speciality}</span>
                </p>
              </div>
            </div>

            {/* Availability Switch */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
              <div>
                <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  {profileData.available ? 'Accepting Patients' : 'Currently Away'}
                </p>
                <p className="text-[10px] text-zinc-400">Available for bookings</p>
              </div>
              <input
                type="checkbox"
                checked={profileData.available}
                onChange={(e) => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                disabled={!isEdit}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:opacity-60"
              />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Experience</span>
              <p className="text-lg font-black text-zinc-900 dark:text-white">{profileData.experience || '5+ Years'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Consultation Fee</span>
              <p className="text-lg font-black text-primary">{currency}{profileData.fees}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Patient Rating</span>
              <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>4.9</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-850 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</span>
              <p className="text-lg font-black text-emerald-500">Active MD</p>
            </div>
          </div>

          {/* Detailed Info / Edit Form */}
          <div className="space-y-6 text-xs">
            
            {/* About Biography */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Professional Background & Biography
              </h3>
              {isEdit ? (
                <textarea
                  rows={5}
                  value={profileData.about}
                  onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                  className="w-full p-3.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <p className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm font-normal">
                  {profileData.about || 'No biography details provided.'}
                </p>
              )}
            </div>

            {/* Fee & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Fee Config */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Appointment Consultation Rate
                </h3>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  {isEdit ? (
                    <input
                      type="number"
                      value={profileData.fees}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <div className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {currency}{profileData.fees} per consultation
                    </div>
                  )}
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Clinic Location & Address
                </h3>
                <div className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    {isEdit ? (
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={profileData.address?.line1 || ''}
                        onChange={(e) => setProfileData(prev => ({ 
                          ...prev, 
                          address: { ...(prev.address || {}), line1: e.target.value } 
                        }))}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {profileData.address?.line1 || 'Address Line 1 Not Set'}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    {isEdit ? (
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={profileData.address?.line2 || ''}
                        onChange={(e) => setProfileData(prev => ({ 
                          ...prev, 
                          address: { ...(prev.address || {}), line2: e.target.value } 
                        }))}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {profileData.address?.line2 || 'Address Line 2 Not Set'}
                      </div>
                    )}
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

export default DoctorProfile