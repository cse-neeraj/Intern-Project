import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ContactRequests = () => {
  const { backendUrl, axios } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

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

  const filteredRequests = requests.filter(req => 
    req.firstName.toLowerCase().includes(search.toLowerCase()) ||
    req.lastName.toLowerCase().includes(search.toLowerCase()) ||
    req.email.toLowerCase().includes(search.toLowerCase()) ||
    req.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Customer Messages</h2>
                <p className="mt-1 text-sm text-gray-500">View and manage inquiries from your customers.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((req, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                                {req.firstName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">{req.firstName} {req.lastName}</h3>
                                <a href={`mailto:${req.email}`} className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                                    {req.email}
                                </a>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-5 flex-1">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{req.message}</p>
                    </div>

                    <div className="flex justify-end mt-auto">
                        <a 
                            href={`mailto:${req.email}?subject=Re: Inquiry from ${req.firstName}&body=Hi ${req.firstName},%0D%0A%0D%0AThank you for contacting us regarding: "${req.message.substring(0, 50)}..."`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            Reply via Email
                        </a>
                    </div>
                </div>
            ))}
            {filteredRequests.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search or check back later.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactRequests;
