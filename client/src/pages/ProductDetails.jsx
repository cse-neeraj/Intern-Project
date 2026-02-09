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
      <div className="mt-12">
        <p>
          <Link to={"/"}>Home</Link> /<Link to={"/products"}> Products</Link> /
          <Link to={`/products/${product.category.toLowerCase()}`}>
            {" "}
            {product.category}
          </Link>{" "}
          /<span className="text-primary"> {product.name}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-16 mt-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-3">
              {product.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(image)}
                  className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>

            <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden relative">
              {isSoldOut && (
                 <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[1px] rounded">
                    <span className="bg-white text-gray-500 px-6 py-2 text-lg font-bold rounded-full uppercase tracking-widest shadow-lg border-2 border-gray-200">Sold Out</span>
                 </div>
              )}
              <img
                src={thumbnail}
                alt="Selected product"
                className={`w-full h-full object-cover ${isSoldOut ? 'grayscale opacity-80' : ''}`}
              />
            </div>
          </div>

          <div className="text-sm w-full md:w-1/2">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-medium">{product.name}</h1>
              {isNew && (
                <span className="bg-green-500 text-white px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">New Arrival</span>
              )}
            </div>

            <div className="flex items-center gap-0.5 mt-1">
              {Array(5)
                .fill("")
                .map((_, i) => (
                  <img
                    key={i}
                    src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className="md:w-4 w-3.5"
                  />
                ))}
              <p className="text-base ml-2">(4)</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-500/70 line-through">
                MRP: {currency} {product.price}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-medium">
                  MRP: {currency}
                  {product.offerPrice}
                </p>
                {isSoldOut && (
                  <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-sm font-bold border border-gray-200 uppercase tracking-wide">Sold Out</span>
                )}
              </div>
              <span className="text-gray-500/70">(inclusive of all taxes)</span>
              <div className="flex flex-col gap-1 mt-2">
                {(product.minOrderQuantity || 1) > 1 && (
                  <p className="text-sm font-medium text-red-500">
                    Min Order Qty: {product.minOrderQuantity}
                  </p>
                )}
                {product.maxOrderQuantity && product.maxOrderQuantity > 0 && (
                  <p className="text-sm font-medium text-green-600">
                    Max Order Qty: {product.maxOrderQuantity}
                  </p>
                )}
              </div>
            </div>

            <p className="text-base font-medium mt-6">About Product</p>
            <ul className="list-disc ml-4 text-gray-500/70">
              {product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>

            <div className="flex items-center mt-10 gap-4 text-base">
              {isSoldOut ? (
                <button 
                  onClick={handleNotifyMe}
                  className="w-full py-3.5 font-bold bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-all rounded-lg flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-sm hover:shadow-md"
                  title="Get notified when this product is back in stock"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  Notify Me
                </button>
              ) : (
                <>
                {!cartItems[product._id] ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="w-full flex items-center justify-between py-3.5 px-4 bg-gray-100 rounded font-medium text-gray-800/80 select-none">
                  <button onClick={decreaseQuantity} className="text-xl px-4 cursor-pointer hover:text-gray-600">-</button>
                  <span className="text-xl font-semibold">{cartItems[product._id]}</span>
                  <button onClick={increaseQuantity} className="text-xl px-4 cursor-pointer hover:text-gray-600">+</button>
                </div>
              )}
              <button
                onClick={() => {
                  if (!cartItems[product._id]) {
                    addToCart(product._id);
                  }
                  navigate("/cart");
                }}
                className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
              >
                Buy now
              </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* related products section */}

        <div className="flex flex-col items-center mt-20">
          <div className="flex flex-col items-center w-max">
            <p className="text-3xl font-medium">Related Products</p>
            <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
            {relatedProducts
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
          <button
            onClick={() => {
              navigate("/products");
              window.scrollTo(0, 0);
            }}
            className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded bg-primary hover:bg-primary-dull transition text-white"
          >
            View All
          </button>
        </div>
      </div>
    )
  );
};

export default ProductDetails;
