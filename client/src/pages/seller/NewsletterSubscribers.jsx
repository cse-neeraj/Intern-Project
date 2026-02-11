import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const NewsletterSubscribers = () => {
  const { backendUrl, axios } = useAppContext();
  const [subscribers, setSubscribers] = useState([]);
  const [offerData, setOfferData] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/newsletter/list', { withCredentials: true });
      if (data.success) {
        setSubscribers(data.subscribers || []);
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

  const onOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };

  const onSendOffer = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/newsletter/send-offer', offerData, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setOfferData({ subject: '', message: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Newsletter Manager</h2>
            <p className="mt-1 text-sm text-gray-500">Manage subscribers and send promotional offers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Send Offer Section */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800">Send Exclusive Offer</h3>
                    </div>
                    <div className="p-6">
                        <form onSubmit={onSendOffer} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={offerData.subject}
                                    onChange={onOfferChange}
                                    placeholder="e.g. 50% OFF Weekend Sale!" 
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                                <textarea 
                                    name="message"
                                    value={offerData.message}
                                    onChange={onOfferChange}
                                    rows="6" 
                                    placeholder="Write your offer details here..." 
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors resize-none"
                                    required
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={sending || subscribers.length === 0}
                                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dull focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                        Send to {subscribers.length} Subscribers
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Subscribers List Section */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800">Subscribers List</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {subscribers.length} Users
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {subscribers.map((sub, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold uppercase">
                                                {sub.email[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{sub.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                        {new Date(sub.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                            </svg>
                                            <p className="text-base font-medium text-gray-900">No subscribers yet</p>
                                            <p className="mt-1 text-sm text-gray-500">When users subscribe to your newsletter, they will appear here.</p>
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
          </div>

    </div>
  );
};


export default NewsletterSubscribers;