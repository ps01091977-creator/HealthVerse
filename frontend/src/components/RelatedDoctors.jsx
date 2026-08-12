import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const [relDoc, setRelDoc] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      )
      setRelDoc(doctorsData)
    }
  }, [doctors, speciality, docId])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-[#262626]'>
      <h1 className='text-3xl font-medium'>Related Doctors</h1>
      <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
      <div className='w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {relDoc && relDoc.length > 0 ? (
          relDoc.map((item, index) => (
            <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} className='border border-gray-100 shadow-sm hover:shadow-xl bg-white rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] active:scale-95 sm:active:scale-100 transition-all duration-300' key={index}>
              <img className='bg-gray-50/50 w-full h-36 sm:h-64 object-cover object-top border-b border-gray-50' src={item.image} alt="" />
              <div className='p-2 sm:p-4 flex flex-col items-center sm:items-start'>
                <div className={`flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-medium ${item.available ? 'text-emerald-500' : "text-gray-500"}`}>
                  <p className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : "bg-gray-500"}`}></p><p>{item.available ? 'Available' : "Not Available"}</p>
                </div>
                <p className='text-[#262626] text-sm sm:text-lg font-medium truncate w-full text-center sm:text-left mt-0.5 sm:mt-1'>{item.name}</p>
                <p className='text-[#5C5C5C] text-[12px] sm:text-sm truncate w-full text-center sm:text-left'>{item.speciality}</p>
              </div>
            </div>
          ))
        ) : (
          <div className='col-span-full flex flex-col items-center justify-center py-10 text-gray-400'>
             <p className='text-sm'>Fetching doctors...</p>
          </div>
        )}
      </div>
      {/* <button className='bg-[#EAEFFF] text-gray-600 px-12 py-3 rounded-full mt-10'>more</button> */}
    </div>
  )
}

export default RelatedDoctors
