import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ProductSubscribers = () => {
  const { backendUrl, axios, token, currency } = useAppContext();
  const [subscribers, setSubscribers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchSubscribers = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/notify/all-subscribers', { headers: { token }, withCredentials: true });
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(search.toLowerCase()) || 
    (sub.productId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Stock Alerts</h2>
                <p className="mt-1 text-sm text-gray-500">Customers waiting for out-of-stock products.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by product or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Customer Email</th>
                            <th className="px-6 py-4">Current Stock</th>
                            <th className="px-6 py-4 text-right">Date Requested</th>
                            <th className="px-6 py-4 text-right">Last Notified</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {filteredSubscribers.map((sub, index) => (
                            <tr key={index} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 p-0.5">
                                            <img src={sub.productId?.image[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <span className="font-medium text-gray-900 truncate max-w-xs" title={sub.productId?.name}>{sub.productId?.name || "Unknown Product"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{sub.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${sub.productId?.quantity > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {sub.productId?.quantity > 0 ? `${sub.productId.quantity} in stock` : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                    {sub.lastNotifiedAt ? (
                                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-md text-xs font-medium border border-green-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                            </svg>
                                            {new Date(sub.lastNotifiedAt).toLocaleDateString()}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                                            </svg>
                                            Pending
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredSubscribers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                                        </div>
                                        <p className="font-medium">No stock alerts found</p>
                                        <p className="text-xs text-gray-400 mt-1">Customers waiting for products will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSubscribers;