import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const StoreDetails = ({ store: propStore }) => {
  const { backendUrl, axios } = useAppContext();
  const [fetchedStore, setFetchedStore] = useState(null);

  const store = propStore || fetchedStore;

  const fetchStoreInfo = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/store/info');
      if (data.success) {
        setFetchedStore(data.store);
      } else {
        setFetchedStore({});
      }
    } catch (error) {
      console.log(error);
      setFetchedStore({});
    }
  };

  useEffect(() => {
    if (!propStore) {
      fetchStoreInfo();
    }
  }, [propStore]);

  if (!store) {
     return (
        <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 animate-pulse h-full shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-6">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mt-1"></div>
                </div>
                <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="font-bold text-2xl text-gray-900 mb-6">Store Information</h3>
        
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Address</p>
                <p className="text-gray-700 leading-relaxed">
                    {store.address || "Address not available"}
                </p>
                {store.address && (
                    <a 
                        href={`//www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:underline group"
                    >
                        View on Map
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                        </svg>
                    </a>
                )}
            </div>
            
            <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Contact</p>
                <div className="space-y-3">
                    <a 
                        href={store.phone ? `tel:${store.phone}` : undefined} 
                        className={`text-gray-700 block ${store.phone ? 'hover:text-primary cursor-pointer' : ''}`}
                    >
                        Phone: {store.phone || "N/A"}
                    </a>
                    <a 
                        href={store.email ? `mailto:${store.email}` : undefined} 
                        className={`text-gray-700 block ${store.email ? 'hover:text-primary cursor-pointer' : ''}`}
                    >
                        Email: {store.email || "N/A"}
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StoreDetails;