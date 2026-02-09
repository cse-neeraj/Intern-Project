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

  return (
    <div className="mt-10">
      {contactBanners.length > 0 && (
        <div className="w-full h-[300px] md:h-[400px] rounded-2xl mb-12 relative overflow-hidden shadow-2xl mt-4 group bg-gray-100">
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {contactBanners.map((banner, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <img
                  src={banner.image}
                  alt="Banner"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-20">
                  <div className="max-w-3xl space-y-6">
                    <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                      {banner.title}
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-100 font-medium leading-relaxed drop-shadow-md max-w-2xl">
                      {banner.description}
                    </p>
                    <button 
                        onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                        className="inline-block bg-primary text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-dull transition-all duration-300 shadow-lg hover:shadow-primary/50 transform hover:-translate-y-1 cursor-pointer"
                    >
                        Contact Us
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {contactBanners.length > 1 && (
            <>
              <button onClick={prevBanner} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button onClick={nextBanner} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {contactBanners.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-xs">Get in touch</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">Contact Us</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Visit our store, reach out with questions, or check out our career opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-10">
            <div id="contact-form" className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-bold text-2xl text-gray-800 mb-8">Send us a Message</h3>
              <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                      <input 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={onChangeHandler} 
                        type="text" 
                        placeholder="type here" 
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                      <input 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={onChangeHandler} 
                        type="text" 
                        placeholder="Type here" 
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <input 
                        name="email" 
                        value={formData.email} 
                        onChange={onChangeHandler} 
                        type="email" 
                        placeholder="john@example.com" 
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                        required 
                      />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Message</label>
                    <div className="relative">
                      <div className="absolute top-4 left-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                      </div>
                      <textarea 
                      name="message" 
                      value={formData.message} 
                      onChange={onChangeHandler} 
                      rows="5" 
                      placeholder="How can we help you?" 
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all" 
                      required
                    ></textarea>
                    </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-primary text-white py-4 px-8 rounded-lg hover:bg-primary-dull transition-all w-full font-bold shadow-lg shadow-primary/30 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2 active:scale-[0.98]"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-bold text-2xl text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">What are your delivery hours?</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">We deliver from 8am to 10pm daily. You can choose your preferred slot during checkout.</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">How can I track my order?</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">You can track your order status in real-time from the 'My Orders' section in your account.</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Do you offer refunds?</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">Yes, if you are not satisfied with the quality of any product, you can return it at the time of delivery or contact support.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <StoreDetails store={storeInfo} />
            
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-full h-[500px] rounded-xl overflow-hidden relative z-0">
                <MapComponent address={storeInfo?.address} />
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-bold text-2xl text-gray-800 mb-6">Business Hours</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-gray-800">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Saturday</span>
                  <span className="font-medium text-gray-800">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-gray-800">Closed</span>
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
