import React from 'react'

const Contact = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] my-10'>
      
      <div className='text-center text-2xl pt-10 border-t border-gray-300'>
          <div className='inline-flex gap-2 items-center mb-3'>
              <p className='text-gray-500'>CONTACT <span className='text-gray-700 font-medium'>US</span></p>
              <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700'></p>
          </div>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px] rounded-lg shadow-md object-cover' src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1000&auto=format&fit=crop" alt="Contact Us" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className='text-gray-500'>54709 Willms Station <br /> Suite 350, Washington, USA</p>
          <p className='text-gray-500'>Tel: (415) 555-0132 <br /> Email: admin@buyfresh.com</p>
          <p className='font-semibold text-xl text-gray-600'>Careers at BuyFresh</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
        </div>
      </div>

      <div className='text-center text-2xl pt-10 border-t border-gray-300'>
          <div className='inline-flex gap-2 items-center mb-3'>
              <p className='text-gray-500'>SEND <span className='text-gray-700 font-medium'>A MESSAGE</span></p>
              <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700'></p>
          </div>
      </div>

      <form className='flex flex-col gap-4 w-full sm:max-w-96 mx-auto mt-10'>
          <input type="text" className='border border-gray-300 rounded py-2.5 px-3.5 w-full' placeholder='Name' />
          <input type="email" className='border border-gray-300 rounded py-2.5 px-3.5 w-full' placeholder='Email' />
          <textarea className='border border-gray-300 rounded py-2.5 px-3.5 w-full' rows="4" placeholder='Message'></textarea>
          <button className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 hover:bg-gray-800 transition-colors'>SUBMIT</button>
      </form>

    </div>
  )
}

export default Contact