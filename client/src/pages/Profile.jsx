import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';

const Profile = () => {
  const { user, setUser, backendUrl, axios } = useAppContext();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const uploadImage = async (file) => {
      try {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('userId', user._id);

          const { data } = await axios.post(backendUrl + '/api/user/upload-profile-picture', formData, {headers: {token: await localStorage.getItem('token')}, withCredentials: true});
          
          if (data.success) {
              toast.success(data.message);
              setUser(prev => ({ ...prev, profilePicture: data.profilePicture }));
              setImage(false); 
          } else {
              toast.error(data.message);
          }
      } catch (error) {
          console.log(error);
          toast.error(error.message);
      }
  }

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
    }
  }, [user]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/user/update-profile', { name, mobile }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setUser(prev => ({ ...prev, name: data.user.name, mobile: data.user.mobile }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center pt-20 pb-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">My Profile</h2>
        <div className="flex justify-center mb-6 relative">
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
            />
          ) : (
            <img
              src={user?.profilePicture || assets.profile_icon}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
            />
          )}
          <label htmlFor="image" className="absolute bottom-0 right-[35%] cursor-pointer bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </label>
          <input
            type="file"
            id="image"
            hidden
            onChange={(e) => {
               setImage(e.target.files[0]);
               uploadImage(e.target.files[0]); 
            }}
          />
        </div>
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Enter mobile number"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
             <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dull transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : null}
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Profile Image Modal */}
      {isImageModalOpen && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsImageModalOpen(false)}
        >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
                <button 
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img 
                    src={image ? URL.createObjectURL(image) : (user?.profilePicture || assets.profile_icon)} 
                    alt="Profile Full View" 
                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
      )}
      </div>
  );
};

export default Profile;