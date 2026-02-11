import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { assets } from "../../assets/assets";
import { generateInvoice } from "../../utils/generateInvoice";


const Orders = () => {
  const { axios, currency, backendUrl, products } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [storeInfo, setStoreInfo] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const fetchAllOrders = async (page = 1, searchTerm = search, start = startDate, end = endDate) => {
    try {
      const { data } = await axios.get(backendUrl + `/api/order/seller?page=${page}&search=${searchTerm}&startDate=${start}&endDate=${end}`, { withCredentials: true });
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const originalStatus = orders.find(o => o._id === orderId)?.status;

    if (newStatus === "Cancelled") {
      if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        event.target.value = originalStatus; // Revert selection in UI
        return;
      }
    }

    setUpdatingOrderId(orderId);

    // Optimistic Update: Update UI immediately
    setOrders(prevOrders => prevOrders.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      const { data } = await axios.post(backendUrl + "/api/order/status", {
        orderId,
        status: newStatus,
      }, { withCredentials: true });
      if (data.success) {
        toast.success("Order status updated.");
      } else {
        toast.error(data.message);
        // Revert on failure
        setOrders(prevOrders => prevOrders.map(order => 
          order._id === orderId ? { ...order, status: originalStatus } : order
        ));
      }
    } catch (error) {
      toast.error(error.message);
      // Revert on error
      setOrders(prevOrders => prevOrders.map(order => 
        order._id === orderId ? { ...order, status: originalStatus } : order
      ));
    } finally {
      setUpdatingOrderId(null);
    }
  };
  const fetchStoreInfo = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/store/info');
      if (data.success) {
        setStoreInfo(data.store);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // If search changes, we always go to page 1
      setCurrentPage(1);
      fetchAllOrders(1, search, startDate, endDate);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, startDate, endDate]);

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchAllOrders(newPage, search, startDate, endDate);
  };


  return (
    <div className="flex-1 min-h-screen bg-gray-50 pt-8 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Orders Overview</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
            <div className="relative flex-1 sm:w-80">
              <input 
                type="text" 
                placeholder="Search Order ID or Customer..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              />
              <img src={assets.search_icon} alt="" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
            </div>
            <div className="flex gap-2">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-600"
                />
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-600"
                />
            </div>
            <div className="flex bg-white p-1 rounded-lg border border-gray-300 shadow-sm h-fit">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="List View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Grid View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                </button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
          {orders.map((order, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-medium text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                      <span className="text-sm text-gray-400">|</span>
                      <span className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.isPaid ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                          {order.paymentMethod === "COD" ? "Cash on Delivery" : (order.isPaid ? "Paid Online" : "Payment Pending")}
                      </span>
                      <span className="font-bold text-lg text-gray-900">{currency}{!isNaN(order.amount) ? order.amount : order.items.reduce((acc, item) => {
                          const p = products.find(prod => prod._id === (item.product?._id || item.product || item.productId));
                          return acc + ((item.price || p?.offerPrice || p?.price || 0) * item.quantity);
                      }, 0)}</span>
                  </div>
              </div>

              <div className={`p-6 grid grid-cols-1 ${viewMode === 'list' ? 'lg:grid-cols-[1.5fr_1fr_1fr]' : ''} gap-8`}>
                {/* Items */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items ({order.items.length})</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {order.items.map((item, idx) => {
                            const productData = products.find(p => p._id === (item.product?._id || item.product || item.productId));
                            const imgSrc = (item.image && (Array.isArray(item.image) ? item.image[0] : item.image)) || productData?.image?.[0] || assets.parcel_icon;
                            
                            return (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 p-1">
                                        <img src={imgSrc} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Qty: {item.quantity} <span className="mx-1">•</span> {item.category || productData?.category}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Customer Details */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                            {order.address ? `${order.address.firstName} ${order.address.lastName}` : "Unknown Customer"}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">{order.address?.email}</p>
                        {order.address ? (
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state}</p>
                                <p>{order.address.country} - {order.address.zipCode || order.address.zipcode}</p>
                                <p className="pt-1 font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                    {order.address.phone}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No address provided</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between h-full">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Status</h4>
                        <div className="relative">
                            <select
                            onChange={(event) => statusHandler(event, order._id)}
                            value={order.status}
                            disabled={updatingOrderId === order._id}
                            className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer transition-all ${updatingOrderId === order._id ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
                            >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for delivery">Out for delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                {updatingOrderId === order._id ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                        onClick={async () => await generateInvoice(order, "₹", "print", storeInfo)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.055 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                        </svg>
                        Print
                        </button>
                        <button
                        onClick={async () => {
                            await generateInvoice(order, "₹", "download", storeInfo);
                            toast.success("Invoice Downloaded");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dull transition-all text-sm font-medium shadow-md shadow-primary/30"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download
                        </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-10">
                <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50 hover:text-primary hover:border-primary/30 text-gray-700 shadow-sm'}`}
                >
                Previous
                </button>
                <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                Page {currentPage} of {totalPages}
                </span>
                <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50 hover:text-primary hover:border-primary/30 text-gray-700 shadow-sm'}`}
                >
                Next
                </button>
            </div>
        )}
        
        {orders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img src={assets.parcel_icon} alt="" className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-gray-500 font-medium">No orders found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Orders;