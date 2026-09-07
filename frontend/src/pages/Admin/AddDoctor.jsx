import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Lock, 
  PlusCircle, 
  Award, 
  Compass, 
  DollarSign, 
  MapPin, 
  FileText, 
  Upload, 
  X, 
  Sparkles, 
  Check,
  Stethoscope
} from 'lucide-react'

// Zod validation schema
const doctorValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  degree: z.string().min(2, 'Degree description is required'),
  fees: z.string().or(z.number()),
  about: z.string().min(10, 'About details must be at least 10 characters'),
  address1: z.string().min(2, 'Address line 1 is required'),
  address2: z.string().optional(),
})

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { backendUrl, aToken } = useContext(AdminContext)

  const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ]

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    if (!docImg) {
      setIsLoading(false)
      return toast.error('Please upload a profile picture')
    }

    // Run Zod validation
    try {
      doctorValidationSchema.parse({
        name,
        email,
        password,
        degree,
        fees,
        about,
        address1,
        address2,
      })
    } catch (err) {
      setIsLoading(false)
      if (err instanceof z.ZodError) {
        const formattedErrors = {}
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message
        })
        setErrors(formattedErrors)
        toast.error(err.errors[0].message)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

      const response = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: { aToken },
      })
      const data = response.data

      if (data.success) {
        toast.success('🎉 Doctor registered successfully!')
        setDocImg(false)
        setName('')
        setPassword('')
        setEmail('')
        setAddress1('')
        setAddress2('')
        setDegree('')
        setAbout('')
        setFees('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Onboard New Doctor
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Add clinical credentials, specialization, fee schedules, and create portal access
        </p>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-8 shadow-sm space-y-8"
      >
        {/* Photo Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Profile Portrait Photo
          </label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-dashed border-zinc-300 dark:border-zinc-700">
            <label
              htmlFor="doc-img"
              className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 shrink-0"
            >
              {docImg ? (
                <img
                  src={URL.createObjectURL(docImg)}
                  alt="Doctor avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Upload</span>
                </div>
              )}
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <PlusCircle className="w-6 h-6" />
              </div>
            </label>
            <input
              type="file"
              id="doc-img"
              accept="image/*"
              hidden
              onChange={(e) => setDocImg(e.target.files[0])}
            />

            <div className="flex-1 text-center sm:text-left space-y-1">
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                {docImg ? docImg.name : 'Select high-resolution photo'}
              </p>
              <p className="text-[11px] text-zinc-400">
                Supports PNG, JPG or WebP up to 5MB. A crisp doctor headshot is recommended.
              </p>
              {docImg && (
                <button
                  type="button"
                  onClick={() => setDocImg(false)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline pt-1"
                >
                  <X className="w-3 h-3" /> Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-xs">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Doctor Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Dr. Richard James"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.name ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Doctor Portal Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                placeholder="richard.james@healthverse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Initial Portal Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.password ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Clinical Speciality
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {specialities.map((spec) => (
                  <option key={spec} value={spec} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Degree & Qualifications */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Degree & Credentials <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="MBBS, MD - Cardiology"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.degree ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.degree && <p className="text-[10px] text-red-500">{errors.degree}</p>}
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Clinical Experience
            </label>
            <div className="relative">
              <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {['1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '8 Years', '10+ Years'].map((yr) => (
                  <option key={yr} value={yr} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Consultation Fee (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="number"
                placeholder="500"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.fees ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.fees && <p className="text-[10px] text-red-500">{errors.fees}</p>}
          </div>

          {/* Address Line 1 */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Clinic Address Line 1 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Suite 402, Medical Enclave"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.address1 ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.address1 && <p className="text-[10px] text-red-500">{errors.address1}</p>}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Clinic Address Line 2 (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Indiranagar, Bangalore, Karnataka"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* About Doctor */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Doctor Professional Biography <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Dr. Richard James has over 10+ years of clinical experience in preventative internal medicine..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                required
                className={`w-full p-3 bg-zinc-50/70 dark:bg-zinc-950/70 border rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.about ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.about && <p className="text-[10px] text-red-500">{errors.about}</p>}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md shadow-primary/25 hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Register & Activate Doctor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDoctor