import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { products, navigate, currency, addToCart, removeFromCart, cartItems, user, axios, backendUrl, setShowUserLogin } =
    useAppContext();
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);

  const product = products.find((item) => item._id === id);
  const isSoldOut = product ? (product.quantity <= 0 || !product.inStock) : false;
  const isNew = product ? (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) <= 7 : false;

  useEffect(() => {
    if (product) {
      let productCopy = products.slice();
      productCopy = productCopy.filter(
        (item) => product.category === item.category,
      );
      setRelatedProducts(productCopy.slice(0, 5));
    }
  }, [product, products]);
  useEffect(() => {
    if (product) {
      setThumbnail(product.image[0] ? product.image[0] : null);
    }
  }, [product]);

  const handleAddToCart = () => {
    const minQty = product.minOrderQuantity || 1;
    const maxQty = product.maxOrderQuantity && product.maxOrderQuantity > 0 ? product.maxOrderQuantity : Infinity;
    const currentQty = cartItems[product._id] || 0;

    if (currentQty >= maxQty) {
      return toast.error(`You can select only up to ${maxQty} quantity`);
    }

    if (currentQty === 0) {
      for (let i = 0; i < minQty; i++) {
        addToCart(product._id);
      }
      if (minQty > 1) toast.success(`Minimum quantity of ${minQty} added`);
      else toast.success("Added to cart");
    } else {
      addToCart(product._id);
      toast.success("Added to cart");
    }
  };

  const increaseQuantity = () => {
    const maxQty = product.maxOrderQuantity && product.maxOrderQuantity > 0 ? product.maxOrderQuantity : Infinity;
    const currentQty = cartItems[product._id] || 0;
    
    if (currentQty >= maxQty) {
      return toast.error(`You can select only up to ${maxQty} quantity`);
    }
    addToCart(product._id);
  };

  const decreaseQuantity = () => {
    const minQty = product.minOrderQuantity || 1;
    const currentQty = cartItems[product._id] || 0;

    if (currentQty <= minQty) {
      for (let i = 0; i < currentQty; i++) {
        removeFromCart(product._id);
      }
      if (minQty > 1) toast.error(`Minimum order quantity is ${minQty}`);
    } else {
      removeFromCart(product._id);
    }
  };

  const handleNotifyMe = async () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    const email = user.email;

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
      <div className="mt-4 md:mt-8 px-4 md:px-10 bg-white min-h-screen pb-24 md:pb-0">
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-1">
          <Link to={"/"} className="hover:text-primary transition-colors">Home</Link> 
          <span>/</span>
          <Link to={"/products"} className="hover:text-primary transition-colors">Products</Link> 
          <span>/</span>
          <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Left Column: Images */}
          <div className="w-full md:w-1/2 lg:w-[45%]">
             <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
                {/* Thumbnails */}
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:h-[500px] scrollbar-none py-1">
                  {product.image.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setThumbnail(image)}
                      className={`border rounded-xl overflow-hidden cursor-pointer flex-shrink-0 w-16 h-16 md:w-20 md:h-20 p-1 transition-all duration-200 ${thumbnail === image ? 'border-primary ring-1 ring-primary/30' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 border border-gray-100 rounded-2xl overflow-hidden relative bg-white flex items-center justify-center h-[350px] md:h-[500px] shadow-sm">
                  {isSoldOut && (
                     <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-gray-800 text-white px-6 py-2 text-lg font-bold rounded-lg uppercase tracking-wider shadow-lg">Sold Out</span>
                     </div>
                  )}
                  <img
                    src={thumbnail}
                    alt={product.name}
                    className={`max-w-full max-h-full object-contain p-6 transition-transform duration-500 hover:scale-105 ${isSoldOut ? 'grayscale opacity-80' : ''}`}
                  />
                </div>
             </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col">
            {/* Header Section */}
            <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                        </svg>
                        10 MINS
                    </span>
                    {isNew && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded uppercase">New</span>
                    )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
                
                {/* Unit/Weight */}
                {product.weight && (
                    <p className="text-gray-500 font-medium text-sm bg-gray-50 inline-block px-2 py-1 rounded-md">{product.weight}</p>
                )}
            </div>

            {/* Price & Add Button */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {currency}{product.offerPrice}
                        </p>
                        {product.price > product.offerPrice && (
                            <div className="flex flex-col">
                                <p className="text-gray-400 line-through text-xs">
                                    MRP {currency}{product.price}
                                </p>
                                <p className="text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded">
                                    {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">(Inclusive of all taxes)</p>
                </div>

                <div className="w-32">
                     {isSoldOut ? (
                        <button 
                          onClick={handleNotifyMe}
                          className="w-full py-2 font-bold border border-gray-300 text-gray-500 rounded-lg text-sm uppercase hover:bg-gray-50 transition-colors"
                        >
                          Notify
                        </button>
                     ) : (
                        !cartItems[product._id] ? (
                            <button
                            onClick={handleAddToCart}
                            className="w-full py-2 bg-green-50 border border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all uppercase text-sm shadow-sm"
                            >
                            Add to Cart
                            </button>
                        ) : (
                            <div className="flex items-center justify-between bg-green-600 text-white rounded-lg h-9 shadow-sm overflow-hidden w-full select-none">
                                <button onClick={decreaseQuantity} className="px-3 h-full hover:bg-green-700 flex items-center justify-center transition-colors text-lg w-10">-</button>
                                <span className="font-bold text-sm flex-1 text-center">{cartItems[product._id]}</span>
                                <button onClick={increaseQuantity} className="px-3 h-full hover:bg-green-700 flex items-center justify-center transition-colors text-lg w-10">+</button>
                            </div>
                        )
                     )}
                </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Product Details</h3>
                
                {/* Description */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                    <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                        {product.description.map((desc, index) => (
                            <p key={index}>{desc}</p>
                        ))}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Unit</h4>
                        <p className="text-sm text-gray-700 font-medium">{product.weight || "N/A"}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shelf Life</h4>
                        <p className="text-sm text-gray-700 font-medium">Refer to pack</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Manufacturer</h4>
                        <p className="text-sm text-gray-700 font-medium">FreshBuy Pvt Ltd</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Country of Origin</h4>
                        <p className="text-sm text-gray-700 font-medium">India</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* related products section */}

        <div className="mt-16 md:mt-24">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {relatedProducts
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
          {relatedProducts.length > 0 && (
             <div className="flex justify-center mt-10">
                <button
                    onClick={() => {
                    navigate("/products");
                    window.scrollTo(0, 0);
                    }}
                    className="px-8 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm"
                >
                    See All Products
                </button>
             </div>
          )}
        </div>

        {/* Sticky Footer for Mobile */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col">
                    {product.offerPrice < product.price && (
                        <span className="text-xs text-gray-400 line-through">MRP {currency}{product.price}</span>
                    )}
                    <span className="text-xl font-bold text-gray-900">{currency}{product.offerPrice}</span>
                </div>
                <div className="w-32">
                     {isSoldOut ? (
                        <button 
                          onClick={handleNotifyMe}
                          className="w-full py-2.5 font-bold border border-gray-300 text-gray-500 rounded-lg text-sm uppercase hover:bg-gray-50 transition-colors"
                        >
                          Notify
                        </button>
                     ) : (
                        !cartItems[product._id] ? (
                            <button
                            onClick={handleAddToCart}
                            className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all uppercase text-sm shadow-md"
                            >
                            Add to Cart
                            </button>
                        ) : (
                            <div className="flex items-center justify-between bg-green-600 text-white rounded-lg h-10 shadow-md overflow-hidden w-full select-none">
                                <button onClick={decreaseQuantity} className="px-3 h-full hover:bg-green-700 flex items-center justify-center transition-colors text-lg w-10">-</button>
                                <span className="font-bold text-sm flex-1 text-center">{cartItems[product._id]}</span>
                                <button onClick={increaseQuantity} className="px-3 h-full hover:bg-green-700 flex items-center justify-center transition-colors text-lg w-10">+</button>
                            </div>
                        )
                     )}
                </div>
            </div>
        </div>
      </div>
    )
  );
};

export default ProductDetails;
