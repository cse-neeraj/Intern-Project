import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

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
    backendUrl
  } = useAppContext();
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState("COD");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      const {data} = await axios.get(backendUrl + "/api/address/get", { withCredentials: true })
        if(data.success){
          setAddresses(data.address)
          if(data.address.length > 0){
            setSelectedAddress(data.address[0])
          }else{
            setSelectedAddress(null)
          }
        } else {
          toast.error(data.message)
        }
      
        } catch (error) {
          toast.error(error.response?.data?.message || error.message)
        }
      }
      
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
      const { data } = await axios.post(backendUrl + "/api/address/update", editAddress, { withCredentials: true });
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
      const { data } = await axios.post(backendUrl + "/api/address/delete", { _id: addressToDelete }, { withCredentials: true });
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
        const { data } = await axios.post(backendUrl + "/api/order/cod", {
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
        }, { withCredentials: true });
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      }else{
        // Place order with stripe
         const { data } = await axios.post(backendUrl + "/api/order/stripe", {
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
        }, { withCredentials: true });
        if (data.success) {
          window.location.replace(data.url)
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
    <div className="flex flex-col md:flex-row mt-16">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Price</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2.5fr_1fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(
                    `/product/${product.category.toLowerCase()}/${product._id}`,
                  );
                  window.scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={product.image[0]}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Size: <span>{product.weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      value={cartItems[product._id]}
                      className="outline-none"
                    >
                      {Array(
                        cartItems[product._id] > 9 ? cartItems[product._id] : 9,
                      )
                        .fill("")
                        .map((_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1}{" "}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">
              {currency}
              {product.offerPrice}
            </p>
            <p className="text-center">
              {currency}
              {product.offerPrice * product.quantity}
            </p>
            <button
              onClick={() => removeFromCart(product._id)}
              className="cursor-pointer mx-auto"
            >
              <img
                src={assets.remove_icon}
                alt="remove"
                className="inline-block w-6 h-6"
              />
            </button>
          </div>
        ))}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => {
              navigate("/products");
              window.scrollTo(0, 0);
            }}
            className="group cursor-pointer flex items-center gap-2 text-primary font-medium"
          >
            <img
              className="group-hover: translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow"
            />
            Continue Shopping
          </button>

          {cartArray.length > 0 && (
            <button 
              onClick={() => {
                  if(window.confirm("Are you sure you want to remove all items from your cart?")) {
                      setCartItems({});
                      toast.success("Cart cleared successfully");
                  }
              }}
              className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Clear Cart
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[380px] w-full bg-white p-8 shadow-xl rounded-2xl border border-gray-100 max-md:mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
        
        <div className="space-y-6">
          {/* Delivery Address */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Delivery Address</p>
               <button
                  onClick={() => setShowAddress(!showAddress)}
                  className="text-primary text-sm font-medium hover:text-primary-dull transition-colors"
                >
                 {user ? (selectedAddress ? "Change" : (addresses.length > 0 ? "Select" : "Add")) : "Add"} 
                </button>
            </div>
            
            <div className="relative">
                {selectedAddress ? (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 text-sm text-gray-600 leading-relaxed relative shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-3 right-3 flex gap-2">
                        <button
                            onClick={() => handleEditClick(selectedAddress)}
                            className="text-xs font-medium text-gray-500 hover:text-primary bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm hover:shadow transition-all"
                            title="Edit Delivery Address"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteAddress(selectedAddress._id)}
                            className="text-xs font-medium text-gray-500 hover:text-red-500 bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm hover:shadow transition-all"
                            title="Delete Delivery Address"
                        >
                            Delete
                        </button>
                    </div>
                    <p className="font-bold text-gray-900 mb-1.5 text-base flex items-center gap-2">
                        <span className="bg-primary/10 text-primary p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg></span>
                        {selectedAddress.firstName} {selectedAddress.lastName}
                    </p>
                    <p className="text-gray-500 mb-1">{selectedAddress.street}, {selectedAddress.city}</p>
                    <p className="text-gray-500 mb-3">{selectedAddress.state}, {selectedAddress.zipCode}</p>
                    <p className="mt-2 flex items-center gap-2 text-gray-700 font-medium bg-gray-100/50 w-fit px-2 py-1 rounded border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
                          <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                        </svg>
                        {selectedAddress.phone}
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-500 text-center">
                    No address selected. Please add or select an address.
                  </div>
                )}

                {showAddress && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                    {user && addresses?.map((address, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedAddress(address);
                          setShowAddress(false);
                        }}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <span className="font-bold block text-gray-800 text-sm mb-1">{address.firstName} {address.lastName}</span>
                        <p className="text-xs text-gray-500 truncate">{address.street}, {address.city}, {address.zipCode}</p>
                      </div>
                    ))}
                    <div
                      onClick={() => {
                        if (!user) {
                          setShowUserLogin(true);
                          return;
                        }
                        navigate("/add-address");
                      }}
                      className="p-3 text-center bg-gray-50 hover:bg-gray-100 text-primary font-medium text-sm cursor-pointer transition-colors sticky bottom-0"
                    >
                      + Add New Address
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
             <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Payment Method</p>
             <div className="relative">
                <select
                    onChange={(e) => setPaymentOptions(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                    <option value="COD">Cash On Delivery</option>
                    <option value="Online">Online Payment (Stripe)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Price</span>
            <span>{currency}{getCartAmount()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping Fee</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (2%)</span>
            <span>{currency}{(getCartAmount() * 2) / 100}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-100 mt-4">
            <span>Total</span>
            <span className="text-primary">{currency}{getCartAmount() + (getCartAmount() * 2) / 100}</span>
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
            className={`w-full py-4 mt-8 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dull hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              user
                ? paymentOptions === "COD" ? "Place Order" : "Proceed to Payment"
                : "Proceed to Login"
            )}
          </button>
        )}
      </div>

      {/* Edit Address Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-out duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Edit Address</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">First Name</label>
                  <input type="text" name="firstName" value={editAddress.firstName} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Last Name</label>
                  <input type="text" name="lastName" value={editAddress.lastName} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
                </div>
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <input type="email" name="email" value={editAddress.email} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Street Address</label>
                  <input type="text" name="street" value={editAddress.street} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">City</label>
                  <input type="text" name="city" value={editAddress.city} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">State</label>
                  <input type="text" name="state" value={editAddress.state} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Zip Code</label>
                  <input type="text" name="zipCode" value={editAddress.zipCode} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Country</label>
                  <input type="text" name="country" value={editAddress.country} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
                </div>
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Phone</label>
                  <input type="text" name="phone" value={editAddress.phone} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm" required />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dull font-medium text-sm shadow-sm transition-colors">Save Changes</button>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Payment</h3>
                <p className="text-gray-500 text-sm mb-8">Please review your order details before proceeding.</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <span className="text-gray-600 text-sm">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900">{currency}{getCartAmount() + (getCartAmount() * 2) / 100}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Payment Method</span>
                        <span className="text-sm font-medium text-gray-800 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">
                            {paymentOptions === "COD" ? "Cash on Delivery" : "Online Payment"}
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Address</h3>
                <p className="text-gray-500 text-sm mb-8">Are you sure you want to permanently delete this address? This action cannot be undone.</p>
                
                <div className="flex gap-3">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all duration-200">
                        Cancel
                    </button>
                    <button onClick={confirmDeleteAddress} className="flex-1 py-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold text-sm shadow-lg shadow-red-500/30 transition-all duration-200 transform active:scale-[0.98]">
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
