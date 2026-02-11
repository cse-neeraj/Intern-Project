import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const StoreSettings = () => {
  const { backendUrl, axios } = useAppContext();
  const [data, setData] = useState({
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const { data: responseData } = await axios.post(backendUrl + '/api/store/update', data, { withCredentials: true });
      if (responseData.success) {
        toast.success(responseData.message);
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
    <div className="flex-1 min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Update your store's contact information and address details.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
                <form onSubmit={onSubmitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                            </div>
                            <textarea 
                                name="address" 
                                value={data.address} 
                                onChange={onChangeHandler} 
                                rows="4"
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors resize-none"
                                placeholder="Enter complete store address"
                            ></textarea>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">This address will be displayed on your contact page.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.35 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    name="phone" 
                                    value={data.phone} 
                                    onChange={onChangeHandler} 
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={data.email} 
                                    onChange={onChangeHandler} 
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                                    placeholder="contact@store.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => fetchData()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dull focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;