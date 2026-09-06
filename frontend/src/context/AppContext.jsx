import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const [userData, setUserData] = useState(false)

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', {
                headers: { token }
            })

            if (data.success) {
                const safeUserData = {
                    ...data.userData,
                    address: data.userData.address || { line1: '', line2: '' },
                    gender: data.userData.gender || '',
                    dob: data.userData.dob || ''
                }
                setUserData(safeUserData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const currency = '₹'
    const months = [" ","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        if (!slotDate) return ''
        const dateArray = slotDate.split('_')
        if (dateArray.length < 3) return slotDate
        return dateArray[0] + " " + (months[Number(dateArray[1])] || dateArray[1]) + " " + dateArray[2]
    }

    // Function to calculate age
    const calculateAge = (dob) => {
        if (!dob) return 'N/A'
        let birthDate;
        if (typeof dob === 'string' && dob.includes('_')) {
            const parts = dob.split('_')
            if (parts[0].length === 4) {
                birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            } else {
                birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
            }
        } else {
            birthDate = new Date(dob)
        }
        if (isNaN(birthDate.getTime())) return 'N/A'
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const value = {
        doctors, getDoctorsData,
        currencySymbol, currency,
        calculateAge, slotDateFormat,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
