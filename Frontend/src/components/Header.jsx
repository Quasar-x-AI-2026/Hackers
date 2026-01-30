import React from 'react'
import group_profiles from '../assets/group_profiles.png'
import arrow_icon from '../assets/arrow_icon.svg'
import header_img from '../assets/header_img.png'

const Header = () => {
  return (
    <div className='flex flex-col md:flex-row bg-[#5f6FFF] rounded-lg px-6 md:px-10 lg:px-20 overflow-hidden'>
      {/* Left side - Content */}
      <div className='md:w-1/2 flex flex-col justify-center gap-4 py-10 md:py-0'>
        <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight'>
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
          <img src={group_profiles} alt="profiles" />
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br className='hidden sm:block' />
            schedule your appointment hassle-free.
          </p>
        </div>
        <a 
          className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm hover:scale-105 transition-all duration-300 mt-4 w-fit'
          href="#speciality"
        >
          Book appointment <img className='w-3' src={arrow_icon} alt="arrow" />
        </a>
      </div>

      {/* Right side - Image - PROPERLY CONTAINED */}
      <div className='md:w-1/2 flex items-center justify-center md:justify-end pt-6 md:pt-0'>
        <img 
          className='w-full max-w-xs md:max-w-sm lg:max-w-md min-h-auto rounded-lg'
          src={header_img} 
          alt="doctor" 
        />
      </div>
    </div>
  )
}

export default Header