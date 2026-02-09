import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ContactRequests = () => {
  const { backendUrl, axios } = useAppContext();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/contact/list', { withCredentials: true });
      if (data.success) {
        setRequests(data.requests);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Customer Messages</h2>
            <p className="text-gray-500">View and manage inquiries from your customers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((req, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-inner">
                                {req.firstName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 leading-tight">{req.firstName} {req.lastName}</h3>
                                <a href={`mailto:${req.email}`} className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                                    {req.email}
                                </a>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4 min-h-[80px]">
                        <p className="text-gray-700 leading-relaxed text-sm">{req.message}</p>
                    </div>

                    <div className="flex justify-end">
                        <a 
                            href={`mailto:${req.email}?subject=Re: Inquiry from ${req.firstName}&body=Hi ${req.firstName},%0D%0A%0D%0AThank you for contacting us regarding: "${req.message.substring(0, 50)}..."`}
                            className="text-sm font-medium text-primary hover:text-white border border-primary hover:bg-primary px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            Reply
                        </a>
                    </div>
                </div>
            ))}
            {requests.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600">No messages yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Messages from the contact form will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactRequests;
