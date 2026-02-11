import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const AddNotification = () => {
  const { backendUrl, axios } = useAppContext()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('general')
  const [target, setTarget] = useState('all')
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFetching, setIsFetching] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [editingNotificationId, setEditingNotificationId] = useState(null);

  const fetchNotifications = async () => {
    setIsFetching(true)
    try {
      const { data } = await axios.get(backendUrl + `/api/notification/all?page=${page}`, { withCredentials: true })
      if (data.success) {
        setNotifications(data.notifications || [])
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingNotificationId) {
        const payload = { id: editingNotificationId, title, message, type };
        if (target === 'single') {
          payload.email = email;
        }
        const { data } = await axios.post(backendUrl + '/api/notification/update', payload, { withCredentials: true });
        if (data.success) {
          toast.success(data.message);
          cancelEdit();
          fetchNotifications();
        } else {
          toast.error(data.message);
        }
      } else {
        let endpoint = '/api/notification/send-all'
        let payload = { title, message, type }
        
        if (target === 'single') {
          endpoint = '/api/notification/send'
          payload.email = email
        }
  
        const { data } = await axios.post(backendUrl + endpoint, payload, { withCredentials: true })
        
        if (data.success) {
          toast.success(data.message)
          setTitle('')
          setMessage('')
          setEmail('')
          if (page === 1) {
            fetchNotifications()
          } else {
            setPage(1) // will trigger fetchNotifications
          }
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (notification) => {
    setTitle(notification.title);
    setMessage(notification.message);
    setType(notification.type);
    if (notification.userId) {
      setTarget('single');
      setEmail(notification.userId.email || '');
    } else {
      setTarget('all');
      setEmail('');
    }
    setEditingNotificationId(notification._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setTitle('');
    setMessage('');
    setType('general');
    setTarget('all');
    setEmail('');
    setEditingNotificationId(null);
  };

  const handleDelete = (id) => {
    const notification = notifications.find(n => n._id === id);
    if (notification) {
      setNotificationToDelete(notification);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    try {
      const { data } = await axios.post(backendUrl + '/api/notification/delete', { id: notificationToDelete._id }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        if (notifications.length === 1 && page > 1) {
          setPage(p => p - 1);
        } else {
          fetchNotifications();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setNotificationToDelete(null);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Notification Manager</h2>
            <p className="mt-1 text-sm text-gray-500">Send alerts, offers, and updates to your users.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {editingNotificationId ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Edit Notification
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            Compose Notification
                        </>
                    )}
                </h3>
            </div>
            <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Target Audience</label>
                            <div className="relative">
                                <select 
                                    value={target} 
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="all">All Users</option>
                                    <option value="single">Specific User</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Notification Type</label>
                            <div className="relative">
                                <select 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="general">General</option>
                                    <option value="offer">Offer</option>
                                    <option value="alert">Alert</option>
                                    <option value="order">Order Update</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {target === 'single' && (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-medium text-gray-700">User Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter user email address"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                required
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Big Summer Sale!"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows="4"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        {editingNotificationId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {editingNotificationId ? 'Updating...' : 'Sending...'}
                                </>
                            ) : (
                                <>
                                    {editingNotificationId ? 'Update Notification' : 'Send Notification'}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800">Sent History</h3>
                    <button 
                        onClick={fetchNotifications} 
                        className={`p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-all ${isFetching ? 'animate-spin text-primary' : ''}`}
                        title="Refresh History"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">Total: {notifications.length}</span>
            </div>
            
            <div className="divide-y divide-gray-100">
                {isFetching ? (
                    <div className="flex justify-center items-center p-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No notifications sent yet</p>
                        <p className="text-sm text-gray-400 mt-1">Your sent notifications will appear here.</p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide
                                            ${item.type === 'alert' ? 'bg-red-50 text-red-700 border border-red-100' : 
                                            item.type === 'offer' ? 'bg-green-50 text-green-700 border border-green-100' : 
                                            item.type === 'order' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                                            'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                                            </svg>
                                            {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.message}</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
                                                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                                            </svg>
                                            To: <span className="font-medium text-gray-700">{item.userId ? (item.userId.email || 'Specific User') : 'All Users'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                        title="Edit Notification"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Notification"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-200 bg-gray-50/50">
                    <button 
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">Page {page} of {totalPages}</span>
                    <button 
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-out duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Notification</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete the notification titled "<span className="font-semibold text-gray-900">{notificationToDelete?.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddNotification