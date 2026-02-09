import React from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ProductList = () => {
  const { products, currency, axios, fetchProducts, backendUrl } = useAppContext();

  const toggleStock = async (id, inStock) => {
    try {
      const {data} = await axios.post(backendUrl + '/api/seller/toggle-stock', {productId: id, inStock}, { withCredentials: true });
      if(data.success){
        fetchProducts()
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      
    }
  };

  const updateProductFeatures = async (productId, field, value) => {
    const product = products.find(p => p._id === productId);
    const minQty = field === 'minOrderQuantity' ? Number(value) : (product.minOrderQuantity || 1);
    const maxQty = field === 'maxOrderQuantity' ? (value ? Number(value) : Infinity) : (product.maxOrderQuantity || Infinity);

    if (maxQty !== Infinity && minQty > maxQty) {
      return toast.error("Min Quantity cannot be greater than Max Quantity");
    }
    try {
      const {data} = await axios.post(backendUrl + '/api/seller/update-product-features', {productId, [field]: value}, { withCredentials: true });
      if(data.success){
        toast.success(data.message)
        fetchProducts()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Products</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-medium">
              <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 cursor-help" title="Minimum quantity a customer must purchase">
                      Min Order Qty
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 cursor-help" title="Maximum quantity a customer can purchase per order">
                      Max Order Qty
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Stock</th>
              </tr>
            </thead>
              <tbody className="text-sm text-gray-600 divide-y divide-gray-200">
              {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                      <img
                        src={product.image?.[0]}
                        alt="Product"
                          className="w-full h-full object-cover"
                      />
                    </div>
                      <span className="font-medium text-gray-800 truncate max-w-xs" title={product.name}>
                      {product.name}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    {currency}
                    {product.offerPrice}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="number" 
                        defaultValue={product.minOrderQuantity || 1}
                        min="1"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center outline-none focus:border-primary text-sm"
                        onBlur={(e) => updateProductFeatures(product._id, 'minOrderQuantity', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="number" 
                        defaultValue={product.maxOrderQuantity || ''}
                        placeholder="N/A"
                        min="1"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center outline-none focus:border-primary text-sm"
                        onBlur={(e) => updateProductFeatures(product._id, 'maxOrderQuantity', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={product.inStock}
                          onChange={() => toggleStock(product._id, !product.inStock)} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="p-10 text-center text-gray-500">No products found.</div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ProductList;
