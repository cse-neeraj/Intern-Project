import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const NewsLetter = () => {
  const { backendUrl, axios } = useAppContext();
  const [email, setEmail] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/newsletter/subscribe', { email });
      if (data.success) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="text-center mt-20">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Be the first to know about new arrivals, sales & promos!
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3 rounded-full overflow-hidden shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-300"
      >
        <input
          className="w-full sm:flex-1 outline-none p-3 text-gray-700 placeholder-gray-400"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="bg-primary text-white text-xs px-8 py-4 font-semibold hover:opacity-90 transition-opacity duration-300 uppercase tracking-wide"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
