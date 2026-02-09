import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const MainBanner = () => {
  const { banners } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const homeBanners = banners.filter(b => b.showPages.includes('home') && b.showBanner);

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % homeBanners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + homeBanners.length) % homeBanners.length);
  };

  useEffect(() => {
    if (homeBanners.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % homeBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [homeBanners.length]);

  // If banner data exists and is explicitly disabled or not enabled for home, do not render
  if (homeBanners.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden group rounded-2xl shadow-2xl h-[300px] md:h-[400px] w-full bg-gray-100 mt-4">
      <div 
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {homeBanners.map((banner, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img
              src={banner?.image || assets.main_banner_bg}
              alt="banner"
              className="w-full h-full hidden md:block object-cover"
            />
            <img
              src={banner?.image || assets.main_banner_bg_sm}
              alt="banner"
              className="w-full h-full md:hidden object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col items-center md:items-start justify-center px-6 md:pl-20 lg:pl-32">
              <div className="max-w-3xl space-y-6 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                  {banner?.title || "Pure Quality You can Trust, Prices You will Love!"}
                </h1>
                {banner?.description && (
                  <p className="text-lg md:text-2xl text-gray-100 font-medium drop-shadow-md leading-relaxed max-w-2xl mx-auto md:mx-0">
                    {banner.description}
                  </p>
                )}

                <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                  <Link
                    to={banner?.buttonLink || "/products"}
                    className="group flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dull text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-primary/50 transform hover:-translate-y-1"
                  >
                    {banner?.buttonText || "Shop Now"}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {homeBanners.length > 1 && (
        <>
          <button onClick={prevBanner} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button onClick={nextBanner} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {homeBanners.map((_, idx) => (
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
  );
};

export default MainBanner;
