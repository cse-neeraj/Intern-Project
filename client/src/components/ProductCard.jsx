import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate, user, axios, backendUrl } =
    useAppContext();

  const minQty = product?.minOrderQuantity || 1;
  const maxQty = product?.maxOrderQuantity && product?.maxOrderQuantity > 0 ? product.maxOrderQuantity : Infinity;
  const isSoldOut = product.quantity <= 0 || !product.inStock;
  const isNew = (new Date() - new Date(product?.createdAt)) / (1000 * 60 * 60 * 24) <= 7;

  const addInitialItems = (e) => {
    e.stopPropagation();
    if (minQty > maxQty) {
      toast.error(`You can select only up to ${maxQty} quantity`);
      return;
    }
    for (let i = 0; i < minQty; i++) {
      addToCart(product._id);
    }
  };

  const removeItems = (e) => {
    e.stopPropagation();
    const currentQty = cartItems[product._id];
    if (currentQty <= minQty) {
      for (let i = 0; i < currentQty; i++) {
        removeFromCart(product._id);
      }
      if (minQty > 1) {
        toast.error(`Minimum order quantity is ${minQty}`);
      }
    } else {
      removeFromCart(product._id);
    }
  };

  const handleNotifyMe = async (e) => {
    e.stopPropagation();
    let email = user?.email;
    if (!email) {
      email = prompt("Please enter your email to be notified:");
    }
    if (!email) return;

    try {
      const { data } = await axios.post(backendUrl + '/api/notify/subscribe', { productId: product._id, email });
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    product && (
      <div
        onClick={() => {
          navigate(`/product/${product.category.toLowerCase()}/${product._id}`);
          scrollTo(0, 0);
        }}
        className={`border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full ${isSoldOut ? 'opacity-70' : ''}`}
      >
        <div
          onClick={() => navigate(`/product/${product._id}`)}
          className="group cursor-pointer flex items-center justify-center px-2 relative"
        >
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-[1px] rounded-md">
               <span className="bg-white text-gray-500 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm border border-gray-200">Sold Out</span>
            </div>
          )}
          {!isSoldOut && isNew && (
            <div className="absolute top-2 left-2 z-10">
               <span className="bg-green-500 text-white px-2 py-1 text-[10px] font-bold rounded shadow-sm uppercase tracking-wide">New</span>
            </div>
          )}
          <img
            className={`group-hover:scale-105 transition max-w-26 md:max-w-36 ${isSoldOut ? 'grayscale' : ''}`}
            src={product.image[0]}
            alt={product.name}
          />
        </div>
        <div className="text-gray-500/60 text-sm">
          <p>{product.category}</p>
          <p
            onClick={() => navigate(`/product/${product._id}`)}
            className="text-gray-700 font-medium text-lg truncate w-full cursor-pointer"
          >
            {product.name}
          </p>
          <div className="flex items-center gap-0.5">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  key={i}
                  className="md:w-3.5 w-3"
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt=""
                />
              ))}
            <p>(4)</p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="md:text-xl text-base font-medium text-indigo-500">
                {currency}
                {product.offerPrice}
                {""}{" "}
                <span className="text-gray-500/60 md:text-sm text-xs line-through">
                  {currency}
                  {product.price}
                </span>
              </p>
              {isSoldOut && (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">Sold Out</span>
              )}
            </div>
            <div className="text-indigo-500">
              {isSoldOut ? (
                 <button 
                    className="md:w-[80px] w-[64px] h-[34px] text-[10px] md:text-xs font-bold text-gray-500 border border-gray-200 bg-white rounded hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    onClick={handleNotifyMe}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    Notify
                 </button>
              ) : (
                <>
                {!cartItems[product._id] ? (
                <button
                  className="flex items-center justify-center gap-1 bg-indigo-100 border border-indigo-300 md:w-[80px] w-[64px] h-[34px] rounded text-indigo-600 font-medium"
                  onClick={addInitialItems}
                >
                  <img src={assets.cart_icon} alt="cart" />
                  Add
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-indigo-500/25 rounded select-none">
                  <button
                    onClick={removeItems}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    -
                  </button>
                  <span className="w-5 text-center">
                    {cartItems[product._id]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentQty = cartItems[product._id];
                      if (currentQty >= maxQty) {
                        toast.error(`You can select only up to ${maxQty} quantity`);
                        return;
                      }
                      addToCart(product._id);
                    }}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    +
                  </button>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductCard;
