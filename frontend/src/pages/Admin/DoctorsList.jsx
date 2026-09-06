import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors , aToken , getAllDoctors, changeAvailability, removeDoctor} = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
        getAllDoctors()
    }
}, [aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-auto w-full max-w-6xl space-y-6 text-left'>
      <h1 className='text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-6 pt-2 gap-y-6'>
        {doctors.map((item, index) => (
          <div className='border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md bg-white dark:bg-zinc-900 rounded-2xl max-w-[220px] w-full overflow-hidden cursor-pointer group hover:translate-y-[-4px] transition-all duration-300' key={index}>
            <img className='bg-zinc-50/50 dark:bg-zinc-950/50 group-hover:bg-primary transition-all duration-500 w-full h-56 object-cover object-top border-b border-zinc-150 dark:border-zinc-850/80' src={item.image} alt="" />
            <div className='p-4 space-y-1'>
              <p className='text-zinc-900 dark:text-white text-base font-bold group-hover:text-primary transition-colors truncate'>{item.name}</p>
              <p className='text-zinc-500 dark:text-zinc-400 text-xs font-semibold'>{item.speciality}</p>
              <div className='mt-3.5 flex items-center justify-between gap-2 text-xs'>
                <label className='flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 dark:text-zinc-400 font-medium'>
                  <input 
                    onChange={()=>changeAvailability(item._id)} 
                    type="checkbox" 
                    checked={item.available} 
                    className="rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary/20 w-3.5 h-3.5"
                  />
                  <span>Available</span>
                </label>
                <button 
                  onClick={() => removeDoctor(item._id)} 
                  className='text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 hover:bg-red-500 px-2.5 py-1 rounded-lg transition-all text-[10px] font-bold cursor-pointer'
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList