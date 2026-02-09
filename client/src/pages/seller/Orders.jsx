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
    <div className="flex-1 pt-5 px-5 sm:pt-12 sm:px-12">
      <h1 className="text-2xl font-medium mb-4">Order Page</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative max-w-md">
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 pl-10 outline-none focus:border-primary"
          />
          <img src={assets.search_icon} alt="" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
        </div>
        <div className="flex gap-2">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="border border-gray-300 rounded p-2 outline-none focus:border-primary text-sm text-gray-500"
            />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="border border-gray-300 rounded p-2 outline-none focus:border-primary text-sm text-gray-500"
            />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] md:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
          >
            <img
              className="w-12 h-12 object-contain"
              src={(() => {
                const item = order.items[0];
                if (!item) return assets.parcel_icon;
                const productData = products.find(p => p._id === (item.product?._id || item.product || item.productId));
                return (item.image && (Array.isArray(item.image) ? item.image[0] : item.image)) || productData?.image?.[0] || assets.parcel_icon;
              })()}
              alt=""
            />
            <div>
              <div>
                {order.items.map((item, index) => {
                  const productData = products.find(p => p._id === (item.product?._id || item.product || item.productId));
                  if (index === order.items.length - 1) {
                    return (
                      <p className="py-0.5" key={index}>
                        {" "}
                        {item.name} x {item.quantity} <span className="text-gray-500 text-xs ml-1">{item.category || productData?.category}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5" key={index}>
                        {" "}
                        {item.name} x {item.quantity} <span className="text-gray-500 text-xs ml-1">{item.category || productData?.category}</span>,
                      </p>
                    );
                  }
                })}
              </div>
              <h5 className="font-medium text-sm mt-3">Delivery To:</h5>
              <p className="mt-1 mb-2 font-medium">
                {order.address ? `${order.address.firstName} ${order.address.lastName}` : "Unknown Customer"}
              </p>
              <p className="text-gray-500 mb-1 text-xs">{order.address?.email}</p>
              {order.address ? (
                <address className="not-italic text-gray-600">
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipCode || order.address.zipcode}</p>
                </address>
              ) : (
                <p className="text-gray-600">No Address</p>
              )}
              <p>{order.address?.phone || "No Phone"}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Items : {order.items.length}
              </p>
              <p className="mt-3">
                Method : {order.paymentMethod || order.paymentType}
              </p>
              <p>Payment : {order.isPaid ? "Done" : "Pending"}</p>
              <p>Date : {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-[15px]">
              {currency}
              {!isNaN(order.amount) ? order.amount : order.items.reduce((acc, item) => {
                  const p = products.find(prod => prod._id === (item.product?._id || item.product || item.productId));
                  return acc + ((item.price || p?.offerPrice || p?.price || 0) * item.quantity);
              }, 0)}
            </p>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  disabled={updatingOrderId === order._id}
                  className={`p-2 font-semibold border border-gray-200 bg-gray-50 outline-none w-full ${updatingOrderId === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancel Order</option>
                </select>
                {updatingOrderId === order._id && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => await generateInvoice(order, "₹", "print", storeInfo)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-all text-xs font-medium"
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
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-all text-xs font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center gap-4 mt-8 mb-8">
        <button
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50 hover:text-primary'}`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50 hover:text-primary'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;