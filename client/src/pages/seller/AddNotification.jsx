import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddNotification = () => {
  const { backendUrl, axios } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState({
    email: '',
    title: '',
    message: '',
    type: 'general'
  });

  const fetchHistory = async (page = 1, searchTerm = search) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/notification/all?page=${page}&search=${searchTerm}`, { withCredentials: true });
      if (data.success) {
        setHistory(data.notifications);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory(1, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Clear selection when history changes (e.g. pagination/search)
  useEffect(() => {
    setSelectedNotifications([]);
  }, [history]);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = sendToAll ? '/api/notification/send-all' : '/api/notification/send';
      const payload = sendToAll ? { title: data.title, message: data.message, type: data.type } : data;

      const { data: responseData } = await axios.post(backendUrl + endpoint, payload, { withCredentials: true });
      if (responseData.success) {
        toast.success(responseData.message);
        setData({ email: '', title: '', message: '', type: 'general' });
        setSendToAll(false);
        fetchHistory(1);
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchHistory(newPage);
    }
  };

  const deleteNotification = async (id) => {
    if(!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      const { data } = await axios.post(backendUrl + '/api/notification/delete', { id }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        fetchHistory(currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === history.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(history.map(item => item._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(prev => prev.filter(item => item !== id));
    } else {
      setSelectedNotifications(prev => [...prev, id]);
    }
  };

  const deleteSelected = async () => {
    if(!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) return;
    try {
      const { data } = await axios.post(backendUrl + '/api/notification/delete-many', { ids: selectedNotifications }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setSelectedNotifications([]);
        fetchHistory(currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll overflow-x-hidden bg-gray-50">
      <div className="p-6 lg:p-10 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h2>
            <p className="text-gray-500 text-lg">Manage and send notifications to your users.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          <div className="w-full xl:w-[400px] flex-shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Send New</h3>
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                <div className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${sendToAll ? 'bg-primary/5 border-primary/30' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                    <input 
                        type="checkbox" 
                        id="sendToAll"
                        checked={sendToAll}
                        onChange={(e) => setSendToAll(e.target.checked)}
                        className="w-5 h-5 accent-primary cursor-pointer rounded focus:ring-2 focus:ring-primary/20"
                    />
                    <label htmlFor="sendToAll" className={`text-sm font-semibold cursor-pointer select-none flex-1 ${sendToAll ? 'text-primary' : 'text-gray-700'}`}>
                        Send to all users
                    </label>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">User Email</label>
                    <input 
                        type="email" 
                        name="email"
                        value={data.email}
                        onChange={onChangeHandler}
                        placeholder="Enter User Email" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-400"
                        required={!sendToAll}
                        disabled={sendToAll}
                    />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Title</label>
                    <input 
                        type="text" 
                        name="title"
                        value={data.title}
                        onChange={onChangeHandler}
                        placeholder="Notification Title" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white placeholder:text-gray-400"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Type</label>
                    <select 
                        name="type"
                        value={data.type}
                        onChange={onChangeHandler}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white cursor-pointer"
                    >
                        <option value="general">General</option>
                        <option value="offer">Offer</option>
                        <option value="order">Order</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Message</label>
                    <textarea 
                        name="message"
                        value={data.message}
                        onChange={onChangeHandler}
                        rows="4" 
                        placeholder="Write your message here..." 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none bg-white placeholder:text-gray-400"
                        required
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-white py-3.5 px-6 rounded-xl hover:bg-primary-dull transition-all shadow-lg shadow-primary/25 font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                        </>
                    ) : 'Send Notification'}
                </button>
            </form>
          </div>

          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800">History</h3>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-72">
            <input 
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-white shadow-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </div>
          </div>
                  
          {selectedNotifications.length > 0 && (
            <button 
                onClick={deleteSelected}
                className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold flex items-center gap-2 border border-red-100 shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete ({selectedNotifications.length})
            </button>
          )}
              </div>
            </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-hidden">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-3 py-3 w-12">
                                <input type="checkbox" onChange={toggleSelectAll} checked={history.length > 0 && selectedNotifications.length === history.length} className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4" />
                            </th>
                            <th className="px-3 py-3 w-28">Date</th>
                            <th className="px-3 py-3 w-32">Title</th>
                            <th className="px-3 py-3">Message</th>
                            <th className="px-3 py-3 w-24">Type</th>
                            <th className="px-3 py-3 w-48">User Email</th>
                            <th className="px-3 py-3 w-20 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {history.map((item, index) => (
                            <tr key={index} className={`hover:bg-gray-50 transition-colors ${selectedNotifications.includes(item._id) ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-3 py-3">
                                    <input type="checkbox" onChange={() => toggleSelect(item._id)} checked={selectedNotifications.includes(item._id)} className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4" />
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-gray-500">
                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-3 py-3 font-semibold text-gray-900 truncate" title={item.title}>{item.title}</td>
                                <td className="px-3 py-3 truncate text-gray-600" title={item.message}>{item.message}</td>
                                <td className="px-3 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                                            item.type === 'offer' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                            item.type === 'order' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                            'bg-gray-50 text-gray-700 border-gray-100'
                                        }`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-3 py-3 font-mono text-xs text-gray-500 truncate" title={item.userId?.email || (typeof item.userId === 'string' ? item.userId : "User not found")}>
                                    {item.userId?.email || (typeof item.userId === 'string' ? item.userId : "User not found")}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    <button 
                                        onClick={() => deleteNotification(item._id)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                          </svg>
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">No notifications sent yet</p>
                                          <p className="text-sm text-gray-400 mt-1">Start by sending a new notification from the panel.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-primary shadow-sm'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-primary shadow-sm'}`}
                    >
                        Next
                    </button>
                    </div>
                </div>
            )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNotification;