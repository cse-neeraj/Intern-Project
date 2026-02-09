import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import MapComponent from './MapComponent';

const StoreDetails = () => {
  const { backendUrl, axios } = useAppContext();
  const [store, setStore] = useState(null);

  const fetchStoreInfo = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/store/info');
      if (data.success) {
        setStore(data.store);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  if (!store) {
     return (
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
     );
  }

  return (
    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
        <h3 className="font-bold text-xl text-gray-900 mb-3">Our Store</h3>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {store.address || "Address not available"}
        </p>
        <div className="mt-4 space-y-2 text-sm">
            <p className="text-gray-600"><span className="font-semibold text-gray-900">Tel:</span> {store.phone || "N/A"}</p>
            <p className="text-gray-600"><span className="font-semibold text-gray-900">Email:</span> {store.email || "N/A"}</p>
        </div>
        <div className="mt-4 h-48 w-full">
            <MapComponent address={store.address} />
        </div>
    </div>
  );
};

export default StoreDetails;
