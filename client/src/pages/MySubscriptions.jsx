import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";

const MySubscriptions = () => {
  const { backendUrl, axios, user, navigate, currency } = useAppContext();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    if (!user) return;
    try {
      const { data } = await axios.post(backendUrl + "/api/notify/list", {
        email: user.email,
      });
      if (data.success) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (id) => {
    if (!window.confirm("Are you sure you want to remove this alert?")) return;
    try {
      const { data } = await axios.post(backendUrl + "/api/notify/remove", {
        id,
      });
      if (data.success) {
        toast.success(data.message);
        fetchSubscriptions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-xl font-medium text-gray-600 mb-4">
          Please login to view your subscriptions
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto mb-12 text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          My Subscriptions
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          Manage your back-in-stock notifications and alerts.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No active subscriptions
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              You haven't subscribed to any out-of-stock products yet. We'll
              notify you here when you do.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dull transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/25 active:scale-95"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {subscriptions.map((sub) => {
              if (!sub.productId) return null;
              const isAvailable =
                sub.productId.quantity > 0 && sub.productId.inStock;
              return (
                <div
                  key={sub._id}
                  className="group bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
                >
                  {/* Status Indicator Line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${isAvailable ? "bg-green-500" : "bg-gray-200"}`}
                  ></div>

                  <div
                    className="w-28 h-28 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 cursor-pointer group-hover:border-primary/20 transition-colors"
                    onClick={() =>
                      navigate(
                        `/product/${sub.productId.category}/${sub.productId._id}`,
                      )
                    }
                  >
                    <img
                      src={sub.productId.image[0]}
                      alt={sub.productId.name}
                      className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                          onClick={() =>
                            navigate(
                              `/product/${sub.productId.category}/${sub.productId._id}`,
                            )
                          }
                        >
                          {sub.productId.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {sub.productId.category}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {currency}
                        {sub.productId.offerPrice}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isAvailable ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                          ></span>
                          {isAvailable ? "Back in Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {isAvailable && (
                          <button
                            onClick={() =>
                              navigate(
                                `/product/${sub.productId.category}/${sub.productId._id}`,
                              )
                            }
                            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dull transition-colors shadow-sm shadow-primary/20"
                          >
                            Buy Now
                          </button>
                        )}
                        <button
                          onClick={() => handleUnsubscribe(sub._id)}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-200 hover:border-red-100 flex items-center justify-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;
