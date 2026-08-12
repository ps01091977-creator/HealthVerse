import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY
    const backendUrl = import.meta.env.VITE_BACKEND_URL
const months = [" ","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }


// Function to calculate the age eg. ( 20_01_2000 => 24 )
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

  const value={
    calculateAge, slotDateFormat, currency

  }
  return (
<AppContext.Provider value= {value}>
    {props.children}
</AppContext.Provider>

  )

}
export default AppContextProvider