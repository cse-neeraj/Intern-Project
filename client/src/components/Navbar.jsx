import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import io from "socket.io-client";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    cartItems,
    getCartCount,
    axios,
    backendUrl,
    setToken
  } = useAppContext();

  const logout = async () => {
    try{
      const {data} = await axios.post(backendUrl + '/api/user/logout', {}, { withCredentials: true })
      if(data.success){
        toast.success(data.message)
        setToken(null)
        navigate("/");
        setUser(null);
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/notification/user', {}, { withCredentials: true });
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, axios]);

  useEffect(() => {
    if (!user) return;

    const socket = io(backendUrl.replace(/\/$/, ""));

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('new_notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      toast.success(newNotification.title, {
        icon: '🔔',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, backendUrl]);

  const markAllAsRead = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/notification/read', {}, { withCredentials: true });
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/notification/clear-all', {}, { withCredentials: true });
      if (data.success) {
        setNotifications([]);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'order':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          ),
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600'
        };
      case 'offer':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
          ),
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-600'
        };
      default:
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          ),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600'
        };
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all">
      <div className="flex items-center justify-between px-4 sm:px-8 md:px-14 lg:px-20 py-3 md:py-4 transition-all max-w-[1440px] mx-auto w-full">
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img className="h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform duration-300" src={assets.logo} alt="logo" />
        </NavLink>

        <div className="hidden sm:flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-primary font-bold text-sm uppercase tracking-wide" : "text-gray-600 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "text-primary font-bold text-sm uppercase tracking-wide" : "text-gray-600 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide"
            }
          >
            All Products
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "text-primary font-bold text-sm uppercase tracking-wide" : "text-gray-600 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide"
            }
          >
            Contact
          </NavLink>

          <div className="hidden lg:flex items-center w-64 xl:w-80 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 group shadow-sm hover:shadow-md">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
              type="text"
              placeholder="Search for products..."
            />
            <img src={assets.search_icon} alt="search" className="w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-all duration-300 group-focus-within:scale-110" />
          </div>

          {user && (
            <div ref={notificationRef} className="relative cursor-pointer group">
              <div onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 opacity-80 group-hover:opacity-100 transition-opacity">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-2 text-[10px] font-bold text-white bg-red-500 w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </div>
              
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
                            <button 
                                onClick={fetchNotifications} 
                                disabled={loadingNotifications}
                                className={`text-gray-400 hover:text-primary hover:bg-primary/5 transition-all p-1.5 rounded-full active:scale-95 ${loadingNotifications ? 'animate-spin text-primary cursor-not-allowed' : ''}`} 
                                title="Refresh"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        </div>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                          <span className="text-[10px] bg-primary text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm shadow-primary/30">{notifications.filter(n => !n.isRead).length} New</span>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {notifications.length > 0 ? (
                          notifications.map((notification, index) => {
                            const style = getNotificationStyle(notification.type);
                            return (
                            <div key={index} className={`group px-5 py-4 hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0 cursor-pointer relative ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
                                {!notification.isRead && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                                )}
                                <div className="flex gap-4 items-start">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${style.bgColor} ${style.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={`text-sm text-gray-900 leading-tight ${!notification.isRead ? 'font-bold' : 'font-semibold'}`}>{notification.title}</p>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{new Date(notification.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{notification.message}</p>
                                    </div>
                                </div>
                            </div>
                          );
                          })
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium text-sm">No notifications yet</p>
                            <p className="text-gray-400 text-xs mt-1">We'll let you know when something arrives.</p>
                          </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                          <button onClick={markAllAsRead} className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white">Mark all as read</button>
                          <button onClick={clearAllNotifications} className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-white">
                              Clear All
                          </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          <div
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer group"
          >
            <img
              src={assets.nav_cart_icon}
              alt="cart"
              className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-primary w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {getCartCount()}
            </span>
          </div>

          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="cursor-pointer px-8 py-2.5 bg-primary hover:bg-primary-dull text-white rounded-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="cursor-pointer w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:border-primary transition-colors overflow-hidden">
                  <img src={user.profilePicture || assets.profile_icon} className="w-full h-full object-cover opacity-80" alt="Profile" />
              </div>
              
              <div className="hidden group-hover:block absolute top-full right-0 pt-2 z-40">
                  <ul className="bg-white shadow-xl border border-gray-100 py-2 w-48 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <li
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary cursor-pointer transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  My Profile
                </li>
                <li
                  onClick={() => navigate("/my-orders")}
                  className="px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary cursor-pointer transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  My Orders
                </li>
                <li
                  onClick={() => navigate("/my-subscriptions")}
                  className="px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary cursor-pointer transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                  My Subscriptions
                </li>
                <li
                  onClick={logout}
                  className="px-4 py-2.5 hover:bg-red-50 text-gray-700 hover:text-red-600 cursor-pointer transition-colors flex items-center gap-2 border-t border-gray-50 mt-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                  </svg>
                  Logout
                </li>
              </ul>
              </div>
            </div>

            </div>
          )}
        </div>
        <div className="flex items-center gap-6 sm:hidden">
          {user && (
            <div className="relative cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 opacity-80">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
            </div>
          )}

          <div
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer"
          >
            <img
              src={assets.nav_cart_icon}
              alt="cart"
              className="w-6 h-6 object-contain opacity-80"
            />
            <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-primary w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {getCartCount()}
            </span>
          </div>
          <button
            onClick={() => (open ? setOpen(false) : setOpen(true))}
            aria-label="Menu"
            className=""
          >
            {/* Menu Icon SVG */}
            <img src={assets.menu_icon} alt="menu" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className={`${
            open ? "flex" : "hidden"
          } w-full bg-white border-t border-gray-200 py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}
        >
          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? "block text-primary font-bold bg-primary/5 px-4 py-2 rounded-lg w-full" : "block text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full transition-colors")}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? "block text-primary font-bold bg-primary/5 px-4 py-2 rounded-lg w-full" : "block text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full transition-colors")}
          >
            All Products
          </NavLink>
          {user && (
            <NavLink to="/my-orders" onClick={() => setOpen(false)} className="block text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full transition-colors">
              My Orders
            </NavLink>
          )}
          {user && (
            <NavLink to="/my-subscriptions" onClick={() => setOpen(false)} className="block text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full transition-colors">
              My Subscriptions
            </NavLink>
          )}

          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? "block text-primary font-bold bg-primary/5 px-4 py-2 rounded-lg w-full" : "block text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg w-full transition-colors")}
          >
            Contact
          </NavLink>

          {!user ? (
            <button
              onClick={() => {
                setShowUserLogin(true);
                setOpen(false);
              }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
