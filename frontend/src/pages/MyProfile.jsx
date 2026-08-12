import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { User, Phone, MapPin, Calendar, Heart, Shield, Edit2, Check, Camera } from 'lucide-react'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    const updateUserProfileData = async () => {
        setIsUpdating(true)
        try {
            const formData = new FormData()
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            image && formData.append('image', image)

            const { data } = await axios.post(
                `${backendUrl}/api/user/update-profile`, 
                formData, 
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setIsUpdating(false)
        }
    }

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-[40vh] text-xs text-zinc-500">
                Loading profile credentials...
            </div>
        )
    }

    return (
        <div className='max-w-2xl mx-auto py-4 space-y-6'>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Profile Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-normal">Manage details, address variables, and patient attributes.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Photo & Name Section */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-150 dark:border-zinc-800">
                    <div className="relative">
                        <img 
                            className='w-24 h-24 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-50' 
                            src={image ? URL.createObjectURL(image) : userData.image || '/fallback-user.png'} 
                            alt="avatar" 
                        />
                        {isEdit && (
                            <label htmlFor='image' className="absolute -bottom-1 -right-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all">
                                <Camera className="w-3.5 h-3.5" />
                                <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                            </label>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
                        {isEdit ? (
                            <input 
                                className='w-full max-w-sm px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-base font-semibold rounded-xl focus:outline-none focus:ring-1 focus:ring-primary' 
                                type="text"
                                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                                value={userData.name}
                            />
                        ) : (
                            <h2 className='text-xl font-bold text-zinc-900 dark:text-zinc-50'>{userData.name}</h2>
                        )}
                        <p className="text-xs text-zinc-400 font-normal">Patient Account Profile</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Contact Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-6 gap-y-4 text-xs">
                        <div className="font-semibold text-zinc-500 flex items-center gap-1">
                            Email address
                        </div>
                        <div className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 px-3 py-2 rounded-xl max-w-sm truncate select-all">
                            {userData.email}
                        </div>

                        <div className="font-semibold text-zinc-500 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" /> Phone number
                        </div>
                        <div>
                            {isEdit ? (
                                <input 
                                    className='w-full max-w-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary' 
                                    type="text"
                                    onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                                    value={userData.phone}
                                />
                            ) : (
                                <div className="text-zinc-800 dark:text-zinc-200 px-1 py-1.5">{userData.phone || 'No phone added'}</div>
                            )}
                        </div>

                        <div className="font-semibold text-zinc-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Address Location
                        </div>
                        <div className="space-y-2">
                            {isEdit ? (
                                <div className="space-y-2 max-w-sm">
                                    <input 
                                        className='w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary' 
                                        type="text"
                                        placeholder="Street Address Line 1"
                                        onChange={(e) => setUserData(prev => ({
                                            ...prev,
                                            address: { ...(prev.address || {}), line1: e.target.value }
                                        }))}
                                        value={userData.address?.line1 || ''}
                                    />
                                    <input 
                                        className='w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary' 
                                        type="text"
                                        placeholder="City, State, Zip Line 2"
                                        onChange={(e) => setUserData(prev => ({
                                            ...prev,
                                            address: { ...(prev.address || {}), line2: e.target.value }
                                        }))}
                                        value={userData.address?.line2 || ''}
                                    />
                                </div>
                            ) : (
                                <div className="text-zinc-850 dark:text-zinc-250 px-1 py-1.5 leading-relaxed">
                                    {userData.address?.line1 || 'No street added'} <br />
                                    {userData.address?.line2 || 'No city added'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> Vital Profile Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-6 gap-y-4 text-xs">
                        <div className="font-semibold text-zinc-500 flex items-center gap-1">
                            Gender Profile
                        </div>
                        <div>
                            {isEdit ? (
                                <select 
                                    className='w-full max-w-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary'
                                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                                    value={userData.gender}
                                >
                                    <option value="Not Selected">Not Selected</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <div className="text-zinc-800 dark:text-zinc-200 px-1 py-1.5">{userData.gender}</div>
                            )}
                        </div>

                        <div className="font-semibold text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Birthday
                        </div>
                        <div>
                            {isEdit ? (
                                <input 
                                    className='w-full max-w-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-zinc-850 dark:text-zinc-250' 
                                    type='date'
                                    onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                                    value={userData.dob || ''}
                                />
                            ) : (
                                <div className="text-zinc-800 dark:text-zinc-200 px-1 py-1.5">{userData.dob || 'Not selected'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit & Save Action footer */}
                <div className='flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800'>
                    {isEdit ? (
                        <button 
                            onClick={updateUserProfileData} 
                            disabled={isUpdating}
                            className='inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50'
                        >
                            <Check className="w-4 h-4" /> {isUpdating ? 'Saving...' : 'Save Profile'}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className='inline-flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer'
                        >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}


export default MyProfile


