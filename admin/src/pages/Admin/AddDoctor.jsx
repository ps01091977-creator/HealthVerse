import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { z } from 'zod'
import { User, Mail, Lock, PlusCircle, Award, Compass, ShieldAlert, DollarSign } from 'lucide-react'

// Zod validation schema
const doctorValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  degree: z.string().min(2, 'Degree description is required'),
  fees: z.string().or(z.number()),
  about: z.string().min(10, 'About details must be at least 10 characters'),
  address1: z.string().min(2, 'Address 1 is required'),
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

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrors({})
    setIsLoading(true)

    if (!docImg) {
      setIsLoading(false)
      return toast.error('Please upload a profile picture');
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
      const formData = new FormData();
      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

      const response = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: { aToken }
      })
      const data = response.data;
      
      if (data.success) {
        toast.success(data.message)
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
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='p-6 w-full space-y-6 text-left'>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Register New Doctor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Register new clinical credentials and doctor profiles on the roster.</p>
      </div>

      <form 
        onSubmit={onSubmitHandler} 
        className='bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm max-w-4xl space-y-6'
      >
        {/* Upload picture */}
        <div className='flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400'>
          <label htmlFor="doc-img" className="relative group cursor-pointer block">
            <img 
              className='w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-850 bg-zinc-50' 
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} 
              alt="Avatar Upload" 
            />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <PlusCircle className="w-4 h-4 text-white" />
            </div>
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <div>
            <p className="font-bold text-zinc-700 dark:text-zinc-300">Upload Doctor Picture</p>
            <p className="text-[10px] text-zinc-450 mt-0.5">JPEG or PNG, max size 2MB</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-xs'>
          
          {/* Left Column */}
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Doctor Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  onChange={e => setName(e.target.value)} 
                  value={name} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.name ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
                  }`} 
                  type="text" 
                  placeholder='Dr. John Smith' 
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.name}</p>}
            </div>

            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Doctor Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  onChange={e => setEmail(e.target.value)} 
                  value={email} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.email ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
                  }`} 
                  type="email" 
                  placeholder='example@healthverse.ai' 
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.email}</p>}
            </div>

            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Set Profile Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  onChange={e => setPassword(e.target.value)} 
                  value={password} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.password ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
                  }`} 
                  type="password" 
                  placeholder='••••••••' 
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.password}</p>}
            </div>

            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Years of Experience</label>
              <select 
                onChange={e => setExperience(e.target.value)} 
                value={experience} 
                className='w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-zinc-800 dark:text-zinc-200'
              >
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="5 Years">5 Years</option>
                <option value="8 Years">8 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Clinical Specialty</label>
              <select 
                onChange={e => setSpeciality(e.target.value)} 
                value={speciality} 
                className='w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-zinc-800 dark:text-zinc-200'
              >
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Consultation Fee (INR)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  onChange={e => setFees(e.target.value)} 
                  value={fees} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.fees ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
                  }`} 
                  type="number" 
                  placeholder='500' 
                />
              </div>
              {errors.fees && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.fees}</p>}
            </div>

            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Doctor Degree / Certification</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  onChange={e => setDegree(e.target.value)} 
                  value={degree} 
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.degree ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
                  }`} 
                  type="text" 
                  placeholder='MBBS, MD Cardiology' 
                />
              </div>
              {errors.degree && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.degree}</p>}
            </div>

            <div className='space-y-1.5'>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">Doctor Clinic Address</label>
              <div className="space-y-2">
                <input 
                  onChange={e => setAddress1(e.target.value)} 
                  value={address1} 
                  className={`w-full px-3 py-2 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
                    errors.address1 ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
                  }`} 
                  type="text" 
                  placeholder='Line 1: Clinic No, Street' 
                />
                <input 
                  onChange={e => setAddress2(e.target.value)} 
                  value={address2} 
                  className='w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100' 
                  type="text" 
                  placeholder='Line 2: Area, City' 
                />
              </div>
              {errors.address1 && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.address1}</p>}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-zinc-600 dark:text-zinc-400">About Doctor / Professional Bio</label>
          <textarea 
            onChange={e => setAbout(e.target.value)} 
            value={about} 
            className={`w-full p-3 border rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 ${
              errors.about ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
            }`} 
            rows={4} 
            placeholder='Write detailed description of the doctor experience, specializations, etc.'
          />
          {errors.about && <p className="text-[10px] text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.about}</p>}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button 
            type='submit' 
            disabled={isLoading}
            className='inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-8 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer'
          >
            {isLoading ? 'Registering...' : 'Register Doctor Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDoctor