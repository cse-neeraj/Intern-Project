import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ProductCard = ({ product, hideCategory }) => {
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
        className={`flex flex-col gap-2 border border-gray-200 rounded-xl bg-white w-full p-3 hover:border-primary/50 transition-all duration-300 ${isSoldOut ? 'opacity-70' : ''}`}
      >
        <div
          onClick={() => navigate(`/product/${product._id}`)}
          className="group cursor-pointer flex items-center justify-center relative aspect-square w-full overflow-hidden rounded-lg"
        >
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px] rounded-lg">
               <span className="bg-gray-800 text-white px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">Sold Out</span>
            </div>
          )}
          {!isSoldOut && (
            <div className="absolute top-2 right-2 z-10">
               <span className="text-[10px] font-bold text-gray-500 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
                  10 MINS
               </span>
            </div>
          )}
          {!isSoldOut && isNew && (
            <div className="absolute top-2 left-2 z-10">
               <span className="bg-green-500 text-white px-2 py-1 text-[10px] font-bold rounded shadow-sm uppercase tracking-wide">New</span>
            </div>
          )}
          <img
            className={`group-hover:scale-105 transition-transform duration-500 h-full w-full object-contain ${isSoldOut ? 'grayscale' : ''}`}
            src={product.image[0]}
            alt={product.name}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
            <p
                onClick={() => navigate(`/product/${product._id}`)}
                className="text-gray-900 font-bold text-sm leading-tight line-clamp-2 cursor-pointer h-10"
            >
                {product.name}
            </p>
            <p className="text-gray-500 text-xs font-medium">{product.weight || "1 unit"}</p>
            
            <div className="flex items-center justify-between mt-auto pt-2">
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-900">
                        {currency}{product.offerPrice}
                    </p>
                    {product.price > product.offerPrice && (
                        <p className="text-xs text-gray-400 line-through">
                            {currency}{product.price}
                        </p>
                    )}
                </div>
                
                <div className="relative">
              {isSoldOut ? (
                  <button 
                     className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-gray-900 transition-colors shadow-sm"
                     onClick={handleNotifyMe}
                  >
                     Notify
                  </button>
              ) : (
                <>
                {!cartItems[product._id] ? (
                <button
                  className="px-6 py-1.5 bg-green-50 border border-green-600 text-green-600 text-xs font-bold rounded-lg uppercase hover:bg-green-600 hover:text-white transition-all shadow-sm"
                  onClick={addInitialItems}
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center bg-green-600 text-white rounded-lg h-8 shadow-sm overflow-hidden">
                  <button
                    onClick={removeItems}
                    className="px-2.5 h-full hover:bg-green-700 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="px-1 text-xs font-bold min-w-[20px] text-center">
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
                    className="px-2.5 h-full hover:bg-green-700 flex items-center justify-center transition-colors"
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
