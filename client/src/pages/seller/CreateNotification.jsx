import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'

const CreateNotification = () => {
  const { backendUrl, axios } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('general')
  const [target, setTarget] = useState('all')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingNotificationId, setEditingNotificationId] = useState(null)

  useEffect(() => {
    if (location.state?.notification) {
      const { notification } = location.state
      setTitle(notification.title)
      setMessage(notification.message)
      setType(notification.type)
      if (notification.userId) {
        setTarget('single')
        setEmail(notification.userId.email || '')
      } else {
        setTarget('all')
        setEmail('')
      }
      setEditingNotificationId(notification._id)
    }
  }, [location.state])

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
            navigate('/seller/notification-history');
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
          setTarget('all')
          setType('general')
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

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
                {editingNotificationId ? 'Edit Notification' : 'Compose Notification'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
                {editingNotificationId ? 'Update your existing notification.' : 'Send alerts, offers, and updates to your users.'}
            </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            rows="6"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
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
      </div>
    </div>
  )
}

export default CreateNotification
