import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import MapComponent from "./MapComponent";

const InputField = ({ label, type, placeholder, name, handleChange, value, required = true }) => (
  <div className="flex flex-col gap-1.5 w-full group">
    <label className="text-sm font-medium text-gray-700 transition-colors group-focus-within:text-primary">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none text-gray-700 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder:text-gray-400"
      type={type}
      placeholder={placeholder}
      name={name}
      onChange={handleChange}
      value={value}
      required={required}
    />
  </div>
);

const AddAddress = () => {

  const { axios, user, navigate, setShowUserLogin, backendUrl } = useAppContext();
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.address) {
            setAddress(prev => ({
              ...prev,
              street: `${data.address.road || ''}${data.address.house_number ? ', ' + data.address.house_number : ''}`,
              city: '',
              state: data.address.state || data.address.province || data.address.region || '',
              zipCode: data.address.postcode || '',
              country: data.address.country || '',
            }));
            toast.success("Address fields populated!");
          } else {
            toast.error("Could not determine address from location.");
          }
        } catch (error) {
          toast.error("Failed to fetch address details.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      }
    );
  };

  const validate = () => {
    const { firstName, lastName, email, street, city, state, country, zipCode, phone } = address;

    if (!firstName.trim()) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Last Name is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid phone number (at least 10 digits)");
      return false;
    }
    if (!street.trim()) {
      toast.error("Street Address is required");
      return false;
    }
    if (!city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!state.trim()) {
      toast.error("State is required");
      return false;
    }
    if (!zipCode.trim() || zipCode.length < 4) {
      toast.error("Please enter a valid Zip Code");
      return false;
    }
    if (!country.trim()) {
      toast.error("Country is required");
      return false;
    }
    return true;
  };

  const handleClearForm = () => {
    if (!window.confirm("Are you sure you want to clear all fields?")) return;
    setAddress({
      firstName: "",
      lastName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      phone: "",
    });
    toast.success("Form cleared");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const { data } = await axios.post(backendUrl + "/api/address/add", address, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    
  };

  useEffect(() => { 
    if (!user) {
      setShowUserLogin(true);
      navigate('/cart')  
    }
  }, [user])


  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gray-50/50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          {/* Map Section */}
          <div className={`w-full md:w-[45%] bg-gray-50 relative transition-all duration-300 ${isMapExpanded ? 'h-[50vh]' : 'h-56'} md:h-auto border-b md:border-b-0 md:border-r border-gray-100`}>
            <MapComponent 
              address={[address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(", ")} 
            />
            <button 
                type="button"
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="absolute bottom-3 right-3 z-[1000] bg-white text-gray-600 p-2 rounded-full shadow-md hover:text-primary transition-colors md:hidden"
                title={isMapExpanded ? "Minimize Map" : "Expand Map"}
            >
                {isMapExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                )}
            </button>
          </div>
          
          {/* Form Section */}
          <div className="w-full md:w-[55%] p-8 md:p-10 lg:p-12">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Add New Address</h2>
                    <p className="text-sm text-gray-500 mt-2">Complete the form below to add a shipping location.</p>
                </div>
                <button 
                    onClick={() => navigate('/cart')}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="mb-8">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                )}
                <span className="group-hover:underline decoration-primary/30 underline-offset-4">{isLocating ? 'Fetching Location...' : 'Use Current Location'}</span>
              </button>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  type="text"
                  placeholder="John"
                  name="firstName"
                  handleChange={handleChange}
                  value={address.firstName}
                />
                <InputField
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  name="lastName"
                  handleChange={handleChange}
                  value={address.lastName}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  name="email"
                  handleChange={handleChange}
                  value={address.email}
                />
                <InputField
                  label="Phone Number"
                  type="number"
                  placeholder="+1 (555) 000-0000"
                  name="phone"
                  handleChange={handleChange}
                  value={address.phone}
                />
              </div>

              <InputField
                label="Street Address"
                type="text"
                placeholder="123 Main St, Apt 4B"
                name="street"
                handleChange={handleChange}
                value={address.street}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="City"
                  type="text"
                  placeholder="New York"
                  name="city"
                  handleChange={handleChange}
                  value={address.city}
                />
                <InputField
                  label="State / Province"
                  type="text"
                  placeholder="NY"
                  name="state"
                  handleChange={handleChange}
                  value={address.state}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Zip / Postal Code"
                  type="number"
                  placeholder="10001"
                  name="zipCode"
                  handleChange={handleChange}
                  value={address.zipCode}
                />
                <InputField
                  label="Country"
                  type="text"
                  placeholder="United States"
                  name="country"
                  handleChange={handleChange}
                  value={address.country}
                />
              </div>

              <div className="pt-6 flex gap-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 text-sm hover:border-gray-300"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dull transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                >
                  Save Address
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default AddAddress;
