import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { token, categories, axios, fetchCategories, backendUrl } = useAppContext();
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (maxOrderQuantity && Number(minOrderQuantity) > Number(maxOrderQuantity)) {
      return toast.error("Min Quantity cannot be greater than Max Quantity");
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const productData = {
        name,
        description,
        category,
        subCategory,
        price,
        offerPrice,
        quantity,
        minOrderQuantity,
        maxOrderQuantity,
        weight,
        shelfLife,
        manufacturer,
        countryOfOrigin,
        inStock: true,
      };
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => {
        if (file) formData.append("images", file);
      });
      const { data } = await axios.post(backendUrl + "/api/product/add", formData, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setSubCategory("");
        setPrice("");
        setOfferPrice("");
        setQuantity("");
        setMinOrderQuantity("1");
        setMaxOrderQuantity("");
        setWeight("");
        setShelfLife("");
        setManufacturer("");
        setCountryOfOrigin("");
        setFiles([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                <p className="mt-1 text-sm text-gray-500">Create a new product listing.</p>
            </div>
        </div>
        
        <form onSubmit={onSubmitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h3>
                <div className="grid grid-cols-2 gap-4">
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
                            <span className="text-xs font-medium">Upload</span>
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
                <p className="mt-3 text-xs text-gray-500">Upload up to 4 images. JPG, PNG, WEBP.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Inventory</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Regular Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input 
                                onChange={(e) => setPrice(e.target.value)} 
                                value={price} 
                                type="number" 
                                placeholder="0.00" 
                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                                required 
                                min="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Offer Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input 
                                onChange={(e) => setOfferPrice(e.target.value)} 
                                value={offerPrice} 
                                type="number" 
                                placeholder="0.00" 
                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                                min="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Stock Quantity</label>
                        <input 
                            onChange={(e) => setQuantity(e.target.value)} 
                            value={quantity} 
                            type="number" 
                            placeholder="0" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                            required 
                            min="0"
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Product Name</label>
                        <input 
                            onChange={(e) => setName(e.target.value)} 
                            value={name} 
                            type="text" 
                            placeholder="e.g. Organic Fresh Apples" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                        <textarea 
                            onChange={(e) => setDescription(e.target.value)} 
                            value={description} 
                            rows={4}
                            placeholder="Product description..." 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm resize-none" 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                            <select 
                                onChange={(e) => setCategory(e.target.value)} 
                                value={category}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm bg-white"
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {categories?.map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Sub Category (Optional)</label>
                            <input 
                                onChange={(e) => setSubCategory(e.target.value)} 
                                value={subCategory} 
                                type="text" 
                                placeholder="e.g. Fruits" 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Unit / Weight</label>
                        <input 
                            onChange={(e) => setWeight(e.target.value)} 
                            value={weight} 
                            type="text" 
                            placeholder="e.g. 500g" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Shelf Life</label>
                        <input 
                            onChange={(e) => setShelfLife(e.target.value)} 
                            value={shelfLife} 
                            type="text" 
                            placeholder="e.g. 7 days" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Manufacturer</label>
                        <input 
                            onChange={(e) => setManufacturer(e.target.value)} 
                            value={manufacturer} 
                            type="text" 
                            placeholder="e.g. FreshBuy" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Country of Origin</label>
                        <input 
                            onChange={(e) => setCountryOfOrigin(e.target.value)} 
                            value={countryOfOrigin} 
                            type="text" 
                            placeholder="e.g. India" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                        />
                    </div>
                    <div>
                         <label className="text-sm font-medium text-gray-700 block mb-1">Min Order Qty</label>
                         <input 
                            onChange={(e) => setMinOrderQuantity(e.target.value)} 
                            value={minOrderQuantity} 
                            type="number" 
                            placeholder="1" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                        />
                    </div>
                     <div>
                         <label className="text-sm font-medium text-gray-700 block mb-1">Max Order Qty</label>
                         <input 
                            onChange={(e) => setMaxOrderQuantity(e.target.value)} 
                            value={maxOrderQuantity} 
                            type="number" 
                            placeholder="No Limit" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => window.history.back()}
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
                        Adding Product...
                      </>
                  ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Product
                      </>
                  )}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
