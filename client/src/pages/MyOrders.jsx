import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { generateInvoice } from "../utils/generateInvoice";


const MyOrders = () => {
  const { currency, axios, user, products, addToCart, navigate, backendUrl } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [buyAgainLoading, setBuyAgainLoading] = useState({});
  const [filter, setFilter] = useState("All");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const steps = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/order/user", { withCredentials: true });
      if (data.success) {
        setMyOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/store/info");
      if (data.success) {
        setStoreInfo(data.store);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(user){
      fetchMyOrders();
      fetchStoreInfo();
    }
  }, [user]);

  useEffect(() => {
    if (myOrders.length > 0) {
      const timer = setTimeout(() => {
        setLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [myOrders]);

  const cancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/order/cancel", { orderId: orderToCancel }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        fetchMyOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowCancelConfirm(false);
      setOrderToCancel(null);
    }
  };

  const filteredOrders = myOrders.filter(order => {
    if (filter === "All") return true;
    if (filter === "Delivered") return order.status === "Delivered";
    if (filter === "Cancelled") return order.status === "Cancelled";
    return true;
  });

  return (
    <div className="min-h-screen pt-4 md:pt-10 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My Orders</h1>
        <p className="text-gray-500 mt-2 text-lg">Track your orders, download invoices, and buy again.</p>
        
        <div className="flex flex-wrap gap-3 mt-6">
            {["All", "Delivered", "Cancelled"].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                        filter === status 
                        ? "bg-primary text-white shadow-lg shadow-primary/30 transform -translate-y-0.5" 
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {myOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <img src={assets.box_icon} alt="No orders" className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">Looks like you haven't placed any orders yet. Start shopping to fill your cart!</p>
                <button onClick={() => navigate('/products')} className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dull transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30 active:scale-95">
                    Start Shopping
                </button>
            </div>
        ) : filteredOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No {filter.toLowerCase()} orders found</h3>
                <p className="text-gray-500 text-sm">Try changing the filter to view other orders.</p>
            </div>
        ) : (
        filteredOrders.map((order, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/60"
          >
            <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-6">
               <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-sm text-gray-600">
                  <div className="flex flex-col">
                      <span className="font-medium text-gray-500 uppercase text-xs tracking-wider">Order Placed</span>
                      <span className="font-semibold text-gray-900 mt-1">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="font-medium text-gray-500 uppercase text-xs tracking-wider">Total</span>
                      <span className="font-semibold text-gray-900 mt-1">{currency}{order.amount}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="font-medium text-gray-500 uppercase text-xs tracking-wider">Ship To</span>
                      <div className="group relative mt-1 cursor-pointer w-fit">
                        <span className="font-bold text-gray-800 hover:text-primary transition-colors flex items-center gap-1 border-b border-dashed border-gray-300 hover:border-primary pb-0.5">
                            {order.address?.firstName} {order.address?.lastName}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-xl p-4 text-xs text-gray-600 z-10 hidden group-hover:block animate-in fade-in zoom-in duration-200">
                            <p className="font-bold text-gray-900 mb-1">Delivery Address</p>
                            <p>{order.address?.street}</p>
                            <p>{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
                            <p className="mt-2 text-gray-500">Phone: <span className="text-gray-700">{order.address?.phone}</span></p>
                        </div>
                      </div>
                  </div>
               </div>
               
               <div className="flex flex-col sm:items-end">
                   <span className="font-medium text-gray-500 uppercase text-xs tracking-wider">Order # {order._id}</span>
                   <div className="flex gap-4 mt-2">
                       <button onClick={async () => await generateInvoice(order, "₹", "print", storeInfo)} className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg> Print</button>
                       <button onClick={async () => {
                          await generateInvoice(order, "₹", "download", storeInfo);
                          toast.success("Invoice downloaded");
                       }} className="text-sm font-medium text-primary hover:text-primary-dull transition-colors flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg> Invoice</button>

                   </div>
               </div>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item, itemIndex) => {
                let productId = item.product?._id || item.product || item.productId;
                
                // Fallback: Try to find product by name if ID is missing
                if (!productId && products) {
                  const foundProduct = products.find(p => p.name === item.name);
                  if (foundProduct) productId = foundProduct._id;
                }

                const productData = products?.find((p) => p._id === productId);
                const imageSrc = (item.image && (Array.isArray(item.image) ? item.image[0] : item.image)) || productData?.image?.[0] || assets.box_icon;

                return (
                <div
                  key={itemIndex}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-gray-50/30 transition-colors"
                >
                  <div 
                    className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative group cursor-pointer"
                    onClick={() => productId && navigate(`/product/${item.category}/${productId}`)}
                  >
                    <img src={imageSrc} alt={item.name || productData?.name} className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg font-bold text-gray-800 truncate pr-4 mb-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => productId && navigate(`/product/${item.category}/${productId}`)}
                      >
                        {item.name || productData?.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2 max-w-2xl">{productData?.description || "Product description not available."}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="bg-gray-100 px-2.5 py-0.5 rounded text-xs font-medium text-gray-600 border border-gray-200 uppercase tracking-wide">{item.category || productData?.category}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600">Qty: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                      </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0 min-w-[140px]">
                    <p className="text-lg font-bold text-gray-900">
                      {currency}{(item.price || productData?.offerPrice || 0) * item.quantity}
                    </p>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!productId) {
                          toast.error("Product unavailable");
                          return;
                        }
                        setBuyAgainLoading(prev => ({ ...prev, [productId]: true }));
                        try {
                          await addToCart(productId);
                          await new Promise(resolve => setTimeout(resolve, 100));
                          navigate('/cart');
                        } catch (error) {
                          toast.error("Failed to add to cart");
                          setBuyAgainLoading(prev => ({ ...prev, [productId]: false }));
                        }
                      }}
                      disabled={buyAgainLoading[productId]}
                      className={`w-full px-5 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 active:scale-95 ${buyAgainLoading[productId] ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {buyAgainLoading[productId] ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          Buy Again
                        </>
                      )}
                    </button>
                    {order.status === 'Order Placed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelOrder(order._id);
                        }}
                        className="mt-2 w-full px-5 py-2.5 text-sm font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 border border-red-100"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                         </svg>
                        Cancel Order
                      </button>
                    )}

                  </div>
                </div>
                );
              })}
            </div>
            
            <div className="px-6 py-6 bg-white border-t border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 w-full">
                  {steps.includes(order.status) ? (
                    <div className="relative mt-2 mb-6">
                      {/* Background Line */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200" />
                      
                      {/* Animated Progress Line */}
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 transition-all duration-[1500ms] ease-in-out"
                        style={{ 
                          width: loaded ? `${Math.max(0, (steps.indexOf(order.status) / (steps.length - 1)) * 100)}%` : '0%',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
                          boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
                        }} 
                      >
                        {/* Animated Moving Dot on Progress Line */}
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 rounded-full shadow-lg animate-pulse">
                          <div className="absolute inset-0 bg-green-600 rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                  
                      <div className="flex justify-between w-full">
                        {steps.map((step, stepIndex) => {
                          const statusIndex = steps.indexOf(order.status);
                          const isCompleted = stepIndex <= statusIndex;
                          const isActive = stepIndex === statusIndex;
                          
                          return (
                            <div key={step} className="flex flex-col items-center relative group">
                              {/* Step Circle */}
                              <div 
                                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-4 transition-all duration-700 z-10 bg-white ${
                                  isCompleted 
                                    ? 'border-green-600 shadow-lg shadow-green-200' 
                                    : 'border-gray-300'
                                } ${isActive ? 'scale-110 animate-pulse' : ''}`}
                                style={{
                                  transitionDelay: `${stepIndex * 150}ms`
                                }}
                              >
                                {isCompleted && (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    className={`w-4 h-4 sm:w-5 sm:h-5 text-green-600 transition-all duration-500 ${
                                      isActive ? 'animate-bounce' : ''
                                    }`}
                                    style={{
                                      transitionDelay: `${stepIndex * 150 + 200}ms`
                                    }}
                                  >
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              
                              {/* Step Label */}
                              <p 
                                className={`absolute top-9 sm:top-11 text-[10px] sm:text-xs font-semibold w-24 text-center transition-all duration-500 ${
                                  isCompleted ? 'text-gray-900' : 'text-gray-400'
                                }`}
                                style={{
                                  transitionDelay: `${stepIndex * 150}ms`
                                }}
                              >
                                {step}
                              </p>
                              
                              {/* Tooltip on Hover */}
                              {isCompleted && (
                                <div className="absolute bottom-full mb-3 hidden group-hover:block z-20 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in duration-200">
                                    <div className="bg-gray-900 text-white text-[10px] py-2 px-3 rounded-lg shadow-2xl whitespace-nowrap relative">
                                        <div className="font-semibold mb-0.5">{step}</div>
                                        <div className="text-gray-300">
                                          {step === 'Order Placed' 
                                            ? new Date(order.createdAt).toLocaleDateString() 
                                            : (step === order.status ? new Date(order.updatedAt || order.createdAt).toLocaleDateString() : 'Completed')}
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                        <span className="text-gray-500 font-medium text-sm">Order Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {order.status}
                        </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-gray-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Cancel Order?</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to cancel this order? This action cannot be undone and you will lose your items.
              </p>
              <div className="flex gap-3">
                 <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 active:scale-95"
                >
                  No, Keep It
                </button>
                <button 
                  onClick={confirmCancelOrder}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;