import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import MapComponent from "../components/MapComponent";
import StoreDetails from "../components/StoreDetails";
import toast from 'react-hot-toast';

const Contact = () => {
  const { banners, backendUrl, axios } = useAppContext();
  const contactBanners = banners.filter((b) => b.showPages.includes("contact") && b.showBanner);
  const [storeInfo, setStoreInfo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % contactBanners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + contactBanners.length) % contactBanners.length);
  };

  useEffect(() => {
    if (contactBanners.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contactBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [contactBanners.length]);

  const fetchStoreInfo = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/store/info');
      if (data.success) {
        setStoreInfo(data.store);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/contact/add', formData);
      if (data.success) {
        toast.success(data.message);
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (address) => {
    if (!address) return '#';
    const query = typeof address === 'object' 
      ? `${address.street || ''}, ${address.city || ''}, ${address.state || ''}, ${address.zipCode || ''}`
      : address;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      {contactBanners.length > 0 && (
        <div className="w-full h-[300px] md:h-[450px] relative overflow-hidden group">
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {contactBanners.map((banner, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <img
                  src={banner.image}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-6 md:px-20">
                  <div className="max-w-4xl mx-auto text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      {banner.title}
                    </h1>
                    <p className="text-lg md:text-xl font-medium drop-shadow-md opacity-90">
                      {banner.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {contactBanners.length > 1 && (
            <>
              <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 text-white p-3 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 text-white p-3 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {contactBanners.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {contactBanners.length === 0 && (
        <div className="bg-primary/10 py-16 md:py-24 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We're here to help and answer any question you might have.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & FAQ */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div id="contact-form" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="mb-8">
                <h3 className="font-bold text-2xl text-gray-900">Send us a Message</h3>
                <p className="text-gray-500 mt-2">Fill out the form below and we'll get back to you shortly.</p>
              </div>
              
              <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                    <input 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={onChangeHandler} 
                      type="text" 
                      placeholder="John" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                    <input 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={onChangeHandler} 
                      type="text" 
                      placeholder="Doe" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input 
                      name="email" 
                      value={formData.email} 
                      onChange={onChangeHandler} 
                      type="email" 
                      placeholder="john@example.com" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                      required 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Message</label>
                    <textarea 
                      name="message" 
                      value={formData.message} 
                      onChange={onChangeHandler} 
                      rows="5" 
                      placeholder="How can we help you?" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all" 
                      required
                    ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-primary text-white py-4 px-8 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                    </>
                  ) : (
                    <>
                        Send Message
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="font-bold text-2xl text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                    { q: "What are your delivery hours?", a: "We deliver from 8am to 10pm daily. You can choose your preferred slot during checkout." },
                    { q: "How can I track my order?", a: "You can track your order status in real-time from the 'My Orders' section in your account." },
                    { q: "Do you offer refunds?", a: "Yes, if you are not satisfied with the quality of any product, you can return it at the time of delivery or contact support." }
                ].map((faq, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{faq.q}</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Info & Map */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <StoreDetails store={storeInfo} />
            </div>
            
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-lg relative group">
              <div className="w-full h-[400px] rounded-xl overflow-hidden relative z-10">
                <MapComponent address={storeInfo?.address} />
              </div>
              {storeInfo?.address && (
                <a 
                  href={getGoogleMapsUrl(storeInfo.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-6 right-6 z-20 bg-white text-gray-800 px-4 py-2.5 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 hover:text-primary transition-all transform hover:-translate-y-1 border border-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary">
                    <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 0 1 1.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0 1 21.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 0 1-1.676 0l-4.994-2.497a.375.375 0 0 0-.336 0l-3.868 1.935A1.875 1.875 0 0 1 2.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437ZM9 6a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 9 6Zm6.75 3a.75.75 0 0 1 .75.75v8.25a.75.75 0 0 1-1.5 0V9.75a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                  Get Directions
                </a>
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Business Hours
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-600 font-medium">Monday - Friday</span>
                  <span className="font-bold text-gray-900 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-600 font-medium">Saturday</span>
                  <span className="font-bold text-gray-900 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Sunday</span>
                  <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
