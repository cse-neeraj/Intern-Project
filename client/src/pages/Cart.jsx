import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

import AddAddressModal from "../components/AddAddressModal";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
    setShowUserLogin,
    backendUrl,
  } = useAppContext();
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState("COD");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const updateCartItem = (id, quantity) => {
    setCartItems((prev) => ({ ...prev, [id]: quantity }));
    toast.success("Cart updated");
  };

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);
      if (product) {
        tempArray.push({ ...product, quantity: cartItems[key] });
      }
    }
    setCartArray(tempArray);
  };

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/address/get", {
        withCredentials: true,
      });
      if (data.success) {
        setAddresses(data.address);
        if (data.address.length > 0) {
          setSelectedAddress(data.address[0]);
        } else {
          setSelectedAddress(null);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEditClick = (address) => {
    setEditAddress(address);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/address/update",
        editAddress,
        { withCredentials: true },
      );
      if (data.success) {
        toast.success(data.message);
        setIsEditModalOpen(false);
        await getUserAddress();
        // Update selected address if it was the one being edited
        if (selectedAddress && selectedAddress._id === editAddress._id) {
          setSelectedAddress({ ...editAddress });
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteAddress = (id) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      const { data } = await axios.post(
        backendUrl + "/api/address/delete",
        { _id: addressToDelete },
        { withCredentials: true },
      );
      if (data.success) {
        toast.success(data.message);
        await getUserAddress();
      } else {
        toast.error(data.message);
      }
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      if (!selectedAddress) {
        setLoading(false);
        return toast.error("Please select an address");
      }

      // Place Order with COD
      if (paymentOptions === "COD") {
        const { data } = await axios.post(
          backendUrl + "/api/order/cod",
          {
            userId: user._id,
            items: cartArray.map((item) => ({
              product: item._id,
              quantity: item.quantity,
              name: item.name,
              image: item.image,
              category: item.category,
              offerPrice: item.offerPrice,
            })),
            amount: getCartAmount() + (getCartAmount() * 2) / 100,
            address: selectedAddress,
          },
          { withCredentials: true },
        );
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      } else {
        // Place order with stripe
        const { data } = await axios.post(
          backendUrl + "/api/order/stripe",
          {
            userId: user._id,
            items: cartArray.map((item) => ({
              product: item._id,
              quantity: item.quantity,
              name: item.name,
              image: item.image,
              category: item.category,
              offerPrice: item.offerPrice,
            })),
            amount: getCartAmount() + (getCartAmount() * 2) / 100,
            address: selectedAddress,
          },
          { withCredentials: true },
        );
        if (data.success) {
          window.location.replace(data.url);
          setCartItems({});
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    setLoading(true);
    setTimeout(() => {
      setShowUserLogin(true);
      setLoading(false);
    }, 500);
  };

  const handleCheckoutClick = () => {
    if (!user) {
      handleLoginClick();
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddress();
    } else {
      setSelectedAddress(null);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 md:pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Shopping Cart
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {getCartCount()} Items
            </span>
          </h1>
          {cartArray.length > 0 && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to remove all items from your cart?",
                  )
                ) {
                  setCartItems({});
                  toast.success("Cart cleared successfully");
                }
              }}
              className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50"
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
              Clear Cart
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1">
            {cartArray.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <img
                    src={assets.cart_icon}
                    className="w-10 h-10 opacity-20"
                    alt=""
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Looks like you haven't added anything to your cart yet. Go
                  ahead and explore our products.
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dull transition-all shadow-lg shadow-primary/30"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_0.5fr] bg-gray-50/50 border-b border-gray-100 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <p>Product Details</p>
                  <p className="text-center">Price</p>
                  <p className="text-center">Subtotal</p>
                  <p className="text-center">Action</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {cartArray.map((product, index) => (
                    <div
                      key={index}
                      className="p-6 flex flex-col md:grid md:grid-cols-[2.5fr_1fr_1fr_0.5fr] items-center gap-6 hover:bg-gray-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div
                          onClick={() => {
                            navigate(
                              `/product/${product.category.toLowerCase()}/${product._id}`,
                            );
                            window.scrollTo(0, 0);
                          }}
                          className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-2 cursor-pointer"
                        >
                          <img
                            className="w-full h-full object-contain mix-blend-multiply"
                            src={product.image[0]}
                            alt={product.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            onClick={() => {
                              navigate(
                                `/product/${product.category.toLowerCase()}/${product._id}`,
                              );
                              window.scrollTo(0, 0);
                            }}
                            className="font-bold text-gray-900 truncate cursor-pointer hover:text-primary transition-colors"
                          >
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5 mb-2">
                            {product.weight || "1 Unit"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">
                              Qty:
                            </span>
                            <div className="relative">
                              <select
                                onChange={(e) =>
                                  updateCartItem(
                                    product._id,
                                    Number(e.target.value),
                                  )
                                }
                                value={cartItems[product._id]}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-16 p-1.5 pl-3 pr-6 cursor-pointer font-medium"
                              >
                                {Array(
                                  cartItems[product._id] > 9
                                    ? cartItems[product._id]
                                    : 9,
                                )
                                  .fill("")
                                  .map((_, i) => (
                                    <option key={i} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-500">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center w-full md:w-auto md:justify-center">
                        <span className="md:hidden text-sm font-medium text-gray-500">
                          Price:
                        </span>
                        <p className="font-bold text-gray-900">
                          {currency}
                          {product.offerPrice}
                        </p>
                      </div>

                      <div className="flex justify-between items-center w-full md:w-auto md:justify-center">
                        <span className="md:hidden text-sm font-medium text-gray-500">
                          Subtotal:
                        </span>
                        <p className="font-bold text-primary">
                          {currency}
                          {(product.offerPrice * product.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex justify-end w-full md:w-auto md:justify-center">
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cartArray.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    navigate("/products");
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-[380px] w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-20 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary">
                    <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.838 1.681l-.902 11.728c-.02.261.187.485.448.513a2.5 2.5 0 001.378.149l2.768-.692 3.1 1.55a2.5 2.5 0 002.24 0l3.1-1.55 2.768.692a2.5 2.5 0 001.6-.263.606.606 0 00.187-.662l-.902-11.728c-.074-.957-.878-1.681-1.838-1.681H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                  </svg>
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Delivery Address Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Delivery To
                    </p>
                    <button
                      onClick={() => setShowAddress(!showAddress)}
                      className="text-primary text-xs font-bold hover:text-primary-dull transition-colors bg-primary/5 px-2 py-1 rounded-md"
                    >
                      {user
                        ? selectedAddress
                          ? "CHANGE"
                          : addresses.length > 0
                            ? "SELECT"
                            : "ADD"
                        : "ADD"}
                    </button>
                  </div>

                  <div className="relative">
                    {selectedAddress ? (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group transition-all hover:border-gray-200">
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(selectedAddress)}
                            className="p-1.5 text-gray-400 hover:text-primary bg-white rounded-md shadow-sm border border-gray-100"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.918 6.92a4 4 0 01-1.342.825L5.433 13.917zM16.096 3.659a.625.625 0 00-.882-.882L14 4l1.768 1.768.328-.328.882.882a.625.625 0 00.882-.882l-.328-.328 1.768-1.768L16.096 3.659zM4.75 16.25c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(selectedAddress._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-white border border-gray-100 rounded-lg text-primary shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">
                                  {selectedAddress.firstName} {selectedAddress.lastName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  Ph: {selectedAddress.phone}
                                </p>
                            </div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Add Delivery Address
                      </button>
                    )}

                    {showAddress && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                        {user && addresses?.length > 0 ? (
                           addresses.map((address, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedAddress(address);
                                setShowAddress(false);
                              }}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex items-center gap-3"
                            >
                                <div className={`w-2 h-2 rounded-full ${selectedAddress?._id === address._id ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                <div>
                                  <span className="font-bold block text-gray-800 text-xs">
                                    {address.firstName} {address.lastName}
                                  </span>
                                  <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                                    {address.street}, {address.city}
                                  </p>
                                </div>
                                <div className="ml-auto pl-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(address._id);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Address"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                            </div>
                          ))
                        ) : (
                            <div className="p-4 text-center text-xs text-gray-400">No saved addresses found.</div>
                        )}
                        <div
                          onClick={() => {
                            if (!user) {
                              setShowUserLogin(true);
                              return;
                            }
                            setIsAddModalOpen(true);
                            setShowAddress(false);
                          }}
                          className="p-3 text-center bg-gray-50 hover:bg-gray-100 text-primary font-bold text-xs cursor-pointer transition-colors sticky bottom-0 border-t border-gray-100"
                        >
                          + Add New Address
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Payment Method */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Payment Method
                  </p>
                  <div className="relative">
                    <select
                      onChange={(e) => setPaymentOptions(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 text-gray-700 font-medium py-3 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer text-sm shadow-sm transition-all hover:border-gray-300"
                    >
                      <option value="COD">Cash On Delivery (COD)</option>
                      <option value="Online">Online Payment (Stripe)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                         <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px border-t border-dashed border-gray-200"></div>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {currency} {getCartAmount().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                        Shipping Fee
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Free</span>
                    </span>
                    <span className="text-green-600 font-bold">0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                        Tax Estimate 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <span className="font-medium text-gray-900">
                      {currency} {((getCartAmount() * 2) / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-xl flex justify-between items-center mt-4 border border-primary/10">
                    <div>
                        <span className="block text-xs text-primary font-bold uppercase tracking-wide">Total Amount</span>
                        <span className="text-xs text-gray-500">Includes all taxes</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {currency} {(getCartAmount() + (getCartAmount() * 2) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

              {cartArray.length === 0 ? (
                <button
                  disabled
                  className="w-full py-4 mt-8 bg-gray-100 text-gray-400 font-bold rounded-full border border-gray-200 cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-inner"
                >
                  Please select items to cart
                </button>
              ) : (
                <button
                  onClick={handleCheckoutClick}
                  disabled={loading}
                  className={`w-full py-4 mt-8 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dull hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : user ? (
                    paymentOptions === "COD" ? (
                      "Place Order"
                    ) : (
                      "Proceed to Payment"
                    )
                  ) : (
                    "Proceed to Login"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddressAdded={getUserAddress} 
      />

      {/* Edit Address Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-out duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Edit Address</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleEditSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editAddress.firstName}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editAddress.lastName}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editAddress.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={editAddress.street}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={editAddress.city}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={editAddress.state}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={editAddress.zipCode}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={editAddress.country}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editAddress.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm"
                  required
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dull font-medium text-sm shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-0 animate-in fade-in zoom-out duration-200">
            <div className="p-6 pt-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Payment
              </h3>
              <p className="text-gray-500 text-sm mb-8">
                Please review your order details before proceeding.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    {currency}
                    {getCartAmount() + (getCartAmount() * 2) / 100}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Payment Method</span>
                  <span className="text-sm font-medium text-gray-800 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">
                    {paymentOptions === "COD"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={loading}
                  className="flex-1 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl hover:bg-primary-dull font-semibold text-sm shadow-lg shadow-primary/30 transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2 transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-0 animate-in fade-in zoom-out duration-200">
            <div className="p-6 pt-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-red-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Address
              </h3>
              <p className="text-gray-500 text-sm mb-8">
                Are you sure you want to permanently delete this address? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAddress}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold text-sm shadow-lg shadow-red-500/30 transition-all duration-200 transform active:scale-[0.98]"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
