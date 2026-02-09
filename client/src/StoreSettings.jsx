import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const StoreSettings = () => {
  const { backendUrl, token, axios } = useAppContext();
  const [data, setData] = useState({
    address: '',
    phone: '',
    email: ''
  });

  const fetchData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/store/info');
      if (data.success) {
        setData({
            address: data.store.address || '',
            phone: data.store.phone || '',
            email: data.store.email || ''
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data: responseData } = await axios.post(backendUrl + '/api/store/update', data, { headers: { token } });
      if (responseData.success) {
        toast.success(responseData.message);
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Store Settings</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                    <textarea 
                        name="address" 
                        value={data.address} 
                        onChange={onChangeHandler} 
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                        placeholder="Enter store address"
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                        type="text" 
                        name="phone" 
                        value={data.phone} 
                        onChange={onChangeHandler} 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                        placeholder="Enter phone number"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={data.email} 
                        onChange={onChangeHandler} 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                        placeholder="Enter email address"
                    />
                </div>
                <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm font-medium mt-2">
                    Save Settings
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
