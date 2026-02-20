import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SmallBanner = () => {
  const navigate = useNavigate();
  const { banners } = useAppContext();

  // Find banners configured for 'small-banner' page
  const smallBanners = banners.filter(b => b.showPages?.includes('small-banner') && b.showBanner);

  if (smallBanners.length === 0) return null;

  return (
    <div className="mt-6 md:mt-10 w-full">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
      {smallBanners.map((banner) => (
        <div 
          key={banner._id} 
          onClick={() => { navigate(banner.buttonLink); window.scrollTo(0,0); }}
          className={`flex-shrink-0 w-[90%] sm:w-[50%] md:w-[35%] lg:w-[28%] rounded-lg overflow-hidden relative shadow-sm h-48 md:h-60 cursor-pointer snap-start transition-all hover:shadow-md ${!banner.image ? 'bg-gradient-to-r from-primary to-primary/80' : ''}`}
        >
          {banner.image && (
            <>
                <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
            </>
          )}

          <div className="p-5 md:p-6 relative z-10 flex flex-col items-start h-full justify-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 drop-shadow-md leading-tight">{banner.title}</h2>
            <p className="text-white/90 text-sm md:text-base mb-4 max-w-[85%] drop-shadow-sm line-clamp-2">{banner.description}</p>
            <button 
                className="bg-white text-black text-sm font-bold px-5 py-2 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
            >
                {banner.buttonText}
            </button>
          </div>
          
          {/* Decorative Elements */}
          {!banner.image && (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
            </>
          )}
        </div>
      ))}
      </div>
    </div>
  );
};

export default SmallBanner;
