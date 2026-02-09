import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const ContactRequests = () => {
  const { backendUrl, token, axios } = useAppContext();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/contact/list', { headers: { token } });
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Requests</h2>
        <div className="grid grid-cols-1 gap-6">
            {requests.map((req, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{req.firstName} {req.lastName}</h3>
                            <p className="text-sm text-gray-500">{req.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{req.message}</p>
                </div>
            ))}
            {requests.length === 0 && (
                <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">No contact requests found.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactRequests;
