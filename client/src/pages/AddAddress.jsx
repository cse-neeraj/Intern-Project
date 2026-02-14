import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import InteractiveMap from '../components/InteractiveMap';

const AddAddress = () => {
  const { backendUrl, axios, navigate, user, setShowUserLogin } = useAppContext();
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

  const [mapPosition, setMapPosition] = useState(null);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const updateAddressFromMap = (addressObj) => {
    setFormData(prev => ({
        ...prev,
        street: addressObj.road || addressObj.suburb || addressObj.neighbourhood || prev.street,
        city: addressObj.city || addressObj.town || addressObj.village || addressObj.municipality || addressObj.state_district || prev.city,
        state: addressObj.state || prev.state,
        zipCode: addressObj.postcode || prev.zipCode,
        country: addressObj.country || prev.country
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const toastId = toast.loading("Fetching location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        
        // Fetch address details
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data.address) {
              updateAddressFromMap(data.address);
              toast.success("Location found!", { id: toastId });
            } else {
              toast.dismiss(toastId);
            }
          })
          .catch(() => {
            toast.error("Failed to fetch address details", { id: toastId });
          });
      },
      (error) => {
        toast.error("Unable to retrieve your location", { id: toastId });
      }
    );
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please login to add address");
      setShowUserLogin(true);
      return;
    }
    try {
      const { data } = await axios.post(backendUrl + '/api/address/add', formData, { withCredentials: true });
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
    <div className="min-h-screen bg-gray-50 flex justify-center items-start px-4 py-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-gray-100">
        
        {/* Left Side: Form */}
        <div className="p-6 flex flex-col lg:border-r border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                   <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Address</h2>
                </div>
                <button onClick={() => navigate('/cart')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all hover:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-1">
                <button 
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="group w-full mb-5 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 hover:border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
                >
                    <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full group-hover:bg-emerald-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span>Use Current Location</span>
                </button>

                <form id="addressForm" onSubmit={onSubmitHandler} className="flex flex-col gap-3.5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                            <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="text" placeholder="John" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                            <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="text" placeholder="Doe" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                            <input required onChange={onChangeHandler} name="email" value={formData.email} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="email" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</label>
                            <input required onChange={onChangeHandler} name="phone" value={formData.phone} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="number" placeholder="Contact number" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Street Address</label>
                        <textarea required onChange={onChangeHandler} name="street" value={formData.street} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm resize-none" rows={2} placeholder="House no, Street area"></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">City</label>
                            <input required onChange={onChangeHandler} name="city" value={formData.city} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="text" placeholder="City" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">State</label>
                            <input required onChange={onChangeHandler} name="state" value={formData.state} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="text" placeholder="State" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Zip</label>
                            <input required onChange={onChangeHandler} name="zipCode" value={formData.zipCode} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="number" placeholder="110001" />
                        </div>
                    </div>

                    <div className="space-y-1">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Country</label>
                         <input required onChange={onChangeHandler} name="country" value={formData.country} className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 text-sm" type="text" placeholder="Country" />
                    </div>
                </form>
            </div>
            
            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => navigate('/cart')} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm">Cancel</button>
                <button type="submit" form="addressForm" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl transition-all transform active:scale-[0.98] text-sm flex items-center justify-center gap-2">
                    Save Address
                </button>
            </div>
        </div>


        {/* Right Side: Interactive Map */}
        <div className="relative w-full min-h-[500px] lg:min-h-[600px] bg-gray-100">
             <InteractiveMap position={mapPosition} setPosition={setMapPosition} setAddress={updateAddressFromMap} />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md text-[10px] font-semibold text-gray-600 z-[400] border border-gray-100 flex items-center gap-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-primary">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Move map to select location
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;