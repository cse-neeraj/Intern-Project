import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const AddAddress = () => {
  const { backendUrl, axios, navigate, token } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/address/add', formData, { headers: { token }, withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        navigate('/cart');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="pt-10 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pb-20 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Add New Address</h2>
                <button onClick={() => navigate('/cart')} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">First Name</label>
                        <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="text" placeholder="Enter first name" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Last Name</label>
                        <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="text" placeholder="Enter last name" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-600">Email Address</label>
                    <input required onChange={onChangeHandler} name="email" value={formData.email} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="email" placeholder="Enter email address" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-600">Street Address</label>
                    <input required onChange={onChangeHandler} name="street" value={formData.street} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="text" placeholder="Street, apartment, suite, etc." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">City</label>
                        <input required onChange={onChangeHandler} name="city" value={formData.city} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="text" placeholder="Enter city" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">State</label>
                        <input required onChange={onChangeHandler} name="state" value={formData.state} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="text" placeholder="Enter state" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Zip Code</label>
                        <input required onChange={onChangeHandler} name="zipCode" value={formData.zipCode} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="number" placeholder="Enter zip code" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Country</label>
                        <input required onChange={onChangeHandler} name="country" value={formData.country} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="text" placeholder="Enter country" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-600">Phone Number</label>
                    <input required onChange={onChangeHandler} name="phone" value={formData.phone} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-gray-50 focus:bg-white" type="number" placeholder="Enter phone number" />
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => navigate('/cart')} className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95">Save Address</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;