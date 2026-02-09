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
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Newsletter Manager</h2>
            <p className="text-gray-500">Manage subscribers and send promotional offers.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Send Offer Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 h-fit">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Send Exclusive Offer</h3>
                <form onSubmit={onSendOffer} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Email Subject</label>
                        <input 
                            type="text" 
                            name="subject"
                            value={offerData.subject}
                            onChange={onOfferChange}
                            placeholder="e.g. 50% OFF Weekend Sale!" 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Message Content</label>
                        <textarea 
                            name="message"
                            value={offerData.message}
                            onChange={onOfferChange}
                            rows="6" 
                            placeholder="Write your offer details here..." 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={sending}
                        className="bg-primary text-white py-3.5 px-6 rounded-lg hover:bg-primary-dull transition-all shadow-lg shadow-primary/30 font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                                Send to {subscribers.length} Subscribers
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Subscribers List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-fit">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">Subscribers List</h3>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                        {subscribers.length} Users
                    </span>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 border-b border-gray-200">Email Address</th>
                                <th className="px-6 py-4 border-b border-gray-200 text-right">Date Subscribed</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                            {subscribers.map((sub, index) => (
                                <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                            {sub.email[0].toUpperCase()}
                                        </div>
                                        {sub.email}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">
                                        {new Date(sub.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-20">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                            </svg>
                                            <p>No subscribers found yet.</p>
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
  );
};

export default NewsletterSubscribers;