import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const Product = () => {
  const { id } = useParams();
  const { products, currency, addToCart, user, axios, backendUrl, setShowUserLogin, navigate } = useAppContext();
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === id) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [id, products])

  useEffect(() => {
    if (products.length > 0 && productData) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter((item) => productData.category === item.category && item._id !== productData._id);
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [productData, products])

  const handleNotifyMe = async () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    try {
      const { data } = await axios.post(backendUrl + '/api/notify/subscribe', { productId: productData._id, email: user.email });
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">

        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full scrollbar-hide">
            {
              productData.image.map((item, index) => (
                <img 
                  onClick={() => setImage(item)} 
                  src={item} 
                  key={index} 
                  className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer object-cover aspect-square border rounded-md hover:border-primary transition-all ${item === image ? 'border-primary' : 'border-gray-200'}`} 
                  alt="" 
                />
              ))
            }
          </div>
          <div className="w-full sm:w-[80%]">
            <div className="w-full h-auto overflow-hidden rounded-lg aspect-square">
              <img className='w-full h-full object-cover hover:scale-110 transition-transform duration-500 ease-in-out cursor-pointer' src={image} alt="" />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_dull_icon} alt="" className="w-3.5" />
            <p className='pl-2 text-gray-500'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.offerPrice || productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          
          <div className='flex flex-col gap-4 my-8'>
            <div className='flex items-center gap-3'>
              <p className='font-medium'>Quantity</p>
              <div className='flex items-center gap-1 border border-gray-300 rounded-sm'>
                <button onClick={() => setQuantity(prev => prev > (productData.minOrderQuantity || 1) ? prev - 1 : prev)} className='px-3 py-1 cursor-pointer hover:bg-gray-100 transition-colors'>-</button>
                <span className='px-3 py-1 w-10 text-center'>{quantity}</span>
                <button onClick={() => setQuantity(prev => prev < (productData.maxOrderQuantity || productData.quantity) ? prev + 1 : prev)} className='px-3 py-1 cursor-pointer hover:bg-gray-100 transition-colors'>+</button>
              </div>
            </div>
            {
              (productData.quantity <= 0 || !productData.inStock)
              ? <button onClick={handleNotifyMe} className='bg-gray-500 text-white px-8 py-3 text-sm active:bg-gray-700 w-full rounded-md hover:bg-gray-600 transition-colors uppercase font-medium tracking-wide'>NOTIFY ME</button>
              : <div className='flex flex-col sm:flex-row gap-4 w-full'>
                  <button onClick={() => addToCart(productData._id, quantity)} className='flex-1 border border-gray-300 text-gray-900 px-8 py-3 text-sm font-medium rounded-md hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-wide'>Add to Cart</button>
                  <button onClick={() => { addToCart(productData._id, quantity); navigate('/cart'); }} className='flex-1 bg-black text-white px-8 py-3 text-sm font-medium rounded-md hover:bg-gray-800 transition-all active:scale-95 uppercase tracking-wide'>Buy Now</button>
                </div>
            }
          </div>

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description and Review Section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border border-gray-300 px-5 py-3 text-sm cursor-pointer'>Description</b>
          <p className='border border-gray-300 border-l-0 px-5 py-3 text-sm text-gray-500 cursor-pointer hover:text-black transition-colors'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border border-gray-300 px-6 py-6 text-sm text-gray-500'>
          <p>{productData.description}</p>
          <p>E-commerce is revolutionizing the way we shop and do business...</p>
        </div>
      </div>

      {/* Related Products */}
      <div className="my-24">
        <div className="text-center text-3xl py-2">
          <div className="inline-flex gap-2 items-center mb-3">
            <p className="text-gray-500">RELATED <span className="text-gray-700 font-medium">PRODUCTS</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {relatedProducts.map((item, index) => (
            <ProductCard key={index} product={item} />
          ))}
        </div>
      </div>

    </div>
  ) : <div className='opacity-0'></div>
}

export default Product;