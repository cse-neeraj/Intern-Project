import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ProductSubscribers = () => {
  const { backendUrl, axios, token, currency } = useAppContext();
  const [subscribers, setSubscribers] = useState([]);

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

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Stock Alerts</h2>
            <p className="text-gray-500">Customers waiting for out-of-stock products.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Customer Email</th>
                            <th className="px-6 py-4">Current Stock</th>
                            <th className="px-6 py-4 text-right">Date Requested</th>
                            <th className="px-6 py-4 text-right">Last Notified</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {subscribers.map((sub, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={sub.productId?.image[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <span className="font-medium text-gray-900 truncate max-w-xs" title={sub.productId?.name}>{sub.productId?.name || "Unknown Product"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{sub.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sub.productId?.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {sub.productId?.quantity || 0}
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
                        {subscribers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No active stock alerts found.</td>
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