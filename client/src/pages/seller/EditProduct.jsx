
import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, categories, axios, fetchCategories, backendUrl, products } = useAppContext();
  
  const [files, setFiles] = useState([]); // For NEW files
  const [existingImages, setExistingImages] = useState([]); // For CURRENT images
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("1");
  const [maxOrderQuantity, setMaxOrderQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProductDetails();
  }, [id, products]); // Re-run if ID or products change (though ideally we fetch specific product)

  const fetchProductDetails = async () => {
      // 1. Try to find in context first (faster)
      let product = products.find(p => p._id === id);

      // 2. If not found (e.g. direct link load), fetch from API
      if (!product) {
          try {
              const { data } = await axios.get(backendUrl + `/api/product/${id}`);
              if (data.success) {
                  product = data.product;
              } else {
                  toast.error("Product not found");
                  navigate("/seller/product-list");
                  return;
              }
          } catch (error) {
             console.error(error);
             toast.error("Failed to fetch product details");
             navigate("/seller/product-list");
             return;
          }
      }

      if (product) {
          setName(product.name);
          setDescription(product.description.join("\n")); // Assuming description is array
          setCategory(product.category);
          setPrice(product.price);
          setOfferPrice(product.offerPrice);
          setQuantity(product.quantity);
          setMinOrderQuantity(product.minOrderQuantity || 1);
          setMaxOrderQuantity(product.maxOrderQuantity || "");
          setWeight(product.weight || "");
          setShelfLife(product.shelfLife || "");
          setManufacturer(product.manufacturer || "");
          setCountryOfOrigin(product.countryOfOrigin || "");
          setExistingImages(product.image || []);
          setInitialLoading(false);
      }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (maxOrderQuantity && Number(minOrderQuantity) > Number(maxOrderQuantity)) {
      return toast.error("Min Quantity cannot be greater than Max Quantity");
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const productData = {
        productId: id,
        name,
        description,
        category,
        price,
        offerPrice,
        quantity,
        minOrderQuantity,
        maxOrderQuantity,
        weight,
        shelfLife,
        manufacturer,
        countryOfOrigin,
      };
      
      formData.append("productData", JSON.stringify(productData));
      
      // Append NEW files
      files.forEach((file) => {
        if (file) formData.append("images", file);
      });

      const { data } = await axios.post(backendUrl + "/api/product/update", formData, { withCredentials: true });
      
      if (data.success) {
        toast.success(data.message);
        navigate("/seller/product-list");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading product details...</div>;
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="mt-1 text-sm text-gray-500">Update the details of your product.</p>
        </div>
        
        <form onSubmit={onSubmitHandler} className="space-y-8">
          {/* Image Upload/Edit Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h3>
            
            {/* Show Existing Images */}
            {existingImages.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Images (Upload new ones to replace)</p>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {existingImages.map((img, idx) => (
                            <div key={idx} className="w-20 h-20 border rounded-lg overflow-hidden shrink-0">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array(4).fill("").map((_, index) => (
                <label key={index} htmlFor={`image${index}`} className="cursor-pointer group relative aspect-square">
                  <div className={`w-full h-full bg-gray-50 border-2 border-dashed ${files[index] ? 'border-primary/50 bg-white' : 'border-gray-300 hover:border-primary hover:bg-primary/5'} rounded-xl flex flex-col items-center justify-center transition-all duration-200 overflow-hidden`}>
                    {files[index] ? (
                      <>
                        <img src={URL.createObjectURL(files[index])} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-medium">Change</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors p-2 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="text-xs font-medium">Upload New</span>
                      </div>
                    )}
                  </div>
                  <input 
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }} 
                    type="file" 
                    id={`image${index}`} 
                    hidden 
                    accept="image/*"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Basic Details Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</label>
                <input 
                    onChange={(e) => setName(e.target.value)} 
                    value={name} 
                    type="text" 
                    id="name"
                    placeholder="e.g. Organic Fresh Apples" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                    required 
                />
                </div>

                <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    onChange={(e) => setDescription(e.target.value)} 
                    value={description} 
                    id="description"
                    rows={4}
                    placeholder="Describe your product features and benefits..." 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none" 
                    required 
                />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                    <div className="relative">
                        <select 
                            onChange={(e) => setCategory(e.target.value)} 
                            value={category}
                            id="category"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none bg-white cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {categories?.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Detailed Specifications Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Specifications</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="weight" className="text-sm font-medium text-gray-700">Unit / Weight</label>
                    <input 
                        onChange={(e) => setWeight(e.target.value)} 
                        value={weight} 
                        type="text" 
                        id="weight"
                        placeholder="e.g. 500g, 1L, 12 pcs" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="shelfLife" className="text-sm font-medium text-gray-700">Shelf Life</label>
                    <input 
                        onChange={(e) => setShelfLife(e.target.value)} 
                        value={shelfLife} 
                        type="text" 
                        id="shelfLife"
                        placeholder="e.g. 7 days, 12 months" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">Manufacturer</label>
                    <input 
                        onChange={(e) => setManufacturer(e.target.value)} 
                        value={manufacturer} 
                        type="text" 
                        id="manufacturer"
                        placeholder="e.g. FreshBuy Pvt Ltd" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                    />
                </div>
                 <div className="flex flex-col gap-2">
                    <label htmlFor="countryOfOrigin" className="text-sm font-medium text-gray-700">Country of Origin</label>
                    <input 
                        onChange={(e) => setCountryOfOrigin(e.target.value)} 
                        value={countryOfOrigin} 
                        type="text" 
                        id="countryOfOrigin"
                        placeholder="e.g. India" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                    />
                </div>
             </div>
          </div>

          {/* Pricing & Inventory Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="price" className="text-sm font-medium text-gray-700">Regular Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                        <input 
                            onChange={(e) => setPrice(e.target.value)} 
                            value={price} 
                            type="number" 
                            id="price"
                            placeholder="0.00" 
                            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                            required 
                            min="0"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="offerPrice" className="text-sm font-medium text-gray-700">Offer Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                        <input 
                            onChange={(e) => setOfferPrice(e.target.value)} 
                            value={offerPrice} 
                            type="number" 
                            id="offerPrice"
                            placeholder="0.00" 
                            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                            required 
                            min="0"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input 
                        onChange={(e) => setQuantity(e.target.value)} 
                        value={quantity} 
                        type="number" 
                        id="quantity"
                        placeholder="0" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                        required 
                        min="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                    <label htmlFor="minOrderQuantity" className="text-sm font-medium text-gray-700">Min Order Quantity</label>
                    <input 
                        onChange={(e) => setMinOrderQuantity(e.target.value)} 
                        value={minOrderQuantity} 
                        type="number" 
                        id="minOrderQuantity"
                        placeholder="1" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                        min="1"
                    />
                    <p className="text-xs text-gray-500">Minimum quantity a customer must purchase.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="maxOrderQuantity" className="text-sm font-medium text-gray-700">Max Order Quantity (Optional)</label>
                    <input 
                        onChange={(e) => setMaxOrderQuantity(e.target.value)} 
                        value={maxOrderQuantity} 
                        type="number" 
                        id="maxOrderQuantity"
                        placeholder="No Limit" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                        min="1"
                    />
                    <p className="text-xs text-gray-500">Maximum quantity a customer can purchase per order.</p>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate('/seller/product-list')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-8 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Product...
                  </>
              ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                    Update Product
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
