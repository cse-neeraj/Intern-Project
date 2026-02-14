import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import InteractiveMap from './InteractiveMap';

const AddAddressModal = ({ isOpen, onClose, onAddressAdded }) => {
  const { backendUrl, axios, user, setShowUserLogin } = useAppContext();
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        if (onAddressAdded) onAddressAdded();
        onClose();
        setFormData({
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
        setMapPosition(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-[1.1fr_1.3fr] border border-gray-100 relative animate-in zoom-in-95 duration-300 max-h-[90vh] lg:h-[85vh]">
        
        {/* Close Button Mobile */}
        <button onClick={onClose} className="absolute top-4 right-4 z-[60] lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-500 shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Left Side: Form */}
        <div className="flex flex-col h-full bg-white relative z-10 lg:border-r border-gray-100/50 overflow-hidden order-2 lg:order-1">
            <div className="px-8 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex-shrink-0 flex items-center justify-between sticky top-0 z-20">
                <div>
                   <h2 className="text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">Add New Address</h2>
                   <p className="text-sm text-gray-500 font-medium mt-0.5">Enter your delivery details below</p>
                </div>
                {/* Close Button Desktop */}
                <button onClick={onClose} className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all hover:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 custom-scrollbar">
                <button 
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="group w-full mb-6 flex items-center justify-center gap-3 py-3 bg-emerald-50/50 text-emerald-700 font-bold rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md active:scale-[0.99] text-sm"
                >
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full group-hover:bg-emerald-200 transition-colors shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span>Use Current Location</span>
                </button>

                <form id="addressFormModal" onSubmit={onSubmitHandler} className="flex flex-col gap-4 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                            <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className="w-full px-4 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="text" placeholder="John" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                            <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className="w-full px-4 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="text" placeholder="Doe" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                            <input required onChange={onChangeHandler} name="email" value={formData.email} className="w-full px-4 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="email" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone</label>
                            <input required onChange={onChangeHandler} name="phone" value={formData.phone} className="w-full px-4 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="number" placeholder="Contact number" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Street Address</label>
                        <textarea required onChange={onChangeHandler} name="street" value={formData.street} className="w-full px-4 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm resize-none" rows={2} placeholder="House no, Street area"></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">City</label>
                            <input required onChange={onChangeHandler} name="city" value={formData.city} className="w-full px-3 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="text" placeholder="City" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">State</label>
                            <input required onChange={onChangeHandler} name="state" value={formData.state} className="w-full px-3 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="text" placeholder="State" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Zip</label>
                            <input required onChange={onChangeHandler} name="zipCode" value={formData.zipCode} className="w-full px-3 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="number" placeholder="Zip" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Country</label>
                         <input required onChange={onChangeHandler} name="country" value={formData.country} className="w-full px-4 py-2.5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-semibold text-gray-700 text-sm" type="text" placeholder="Country" />
                    </div>
                </form>
            </div>
            
            <div className="px-8 py-4 border-t border-gray-100 bg-white flex-shrink-0 flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] sticky bottom-0 z-20">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-800 transition-all text-sm active:scale-[0.98]">Cancel</button>
                <button type="submit" form="addressFormModal" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary-dull hover:shadow-xl hover:-translate-y-0.5 transition-all transform active:scale-[0.98] text-sm flex items-center justify-center gap-2">
                    Save Address
                </button>
            </div>
        </div>

        {/* Right Side: Interactive Map */}
        <div className="relative h-[250px] lg:h-full w-full bg-gray-50 flex-shrink-0 order-1 lg:order-2">
             <InteractiveMap position={mapPosition} setPosition={setMapPosition} setAddress={updateAddressFromMap} />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg shadow-black/5 text-[10px] font-bold text-gray-600 z-[400] border border-white/50 flex items-center gap-2 pointer-events-none select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                Drag map to fix
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;