import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const SpecialityMenu = () => {
    return (
        <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-zinc-800 dark:text-zinc-200'>
            <h2 className='text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50'>Find by Speciality</h2>
            <p className='sm:w-1/2 text-center text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md'>
                Simply browse through our extensive list of verified doctors grouped by specialization.
            </p>
            
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-8 w-full px-2'>
                {specialityData.map((item, index) => (
                    <Link 
                        to={`/doctors/${item.speciality}`} 
                        onClick={() => scrollTo(0, 0)} 
                        className='flex flex-col items-center p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:shadow-lg hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 group' 
                        key={index}
                    >
                        <div className='w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-all bg-white dark:bg-zinc-950 border border-zinc-200/20 p-2'>
                            <img className='w-full h-full object-contain' src={item.image} alt={item.speciality} />
                        </div>
                        <p className='font-semibold text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors text-center mt-3 flex items-center gap-1'>
                            {item.speciality} <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu