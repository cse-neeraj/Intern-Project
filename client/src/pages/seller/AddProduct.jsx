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
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("1");
  const [maxOrderQuantity, setMaxOrderQuantity] = useState("");
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
        price,
        offerPrice,
        quantity,
        minOrderQuantity,
        maxOrderQuantity,
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
        setPrice("");
        setOfferPrice("");
        setQuantity("");
        setMinOrderQuantity("1");
        setMaxOrderQuantity("");
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
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Product</h2>
        <form onSubmit={onSubmitHandler} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-3xl">
          
          {/* Image Upload */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-3">Product Images</p>
            <div className="flex gap-4 flex-wrap">
              {Array(4).fill("").map((_, index) => (
                <label key={index} htmlFor={`image${index}`} className="cursor-pointer group">
                  <div className={`w-24 h-24 bg-gray-50 border-2 border-dashed ${files[index] ? 'border-primary/50' : 'border-gray-300'} rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative`}>
                    {files[index] ? (
                      <img src={URL.createObjectURL(files[index])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                        <img src={assets.upload_area} alt="" className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px] font-medium">Upload</span>
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
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Product Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-600">Product Name</label>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                type="text" 
                id="name"
                placeholder="Type product name here" 
                className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" 
                required 
              />
            </div>

            {/* Product Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-600">Product Description</label>
              <textarea 
                onChange={(e) => setDescription(e.target.value)} 
                value={description} 
                id="description"
                rows={4}
                placeholder="Write content here" 
                className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all resize-none" 
                required 
              />
            </div>

            {/* Category & Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-600">Category</label>
                <div className="relative">
                  <select 
                    onChange={(e) => setCategory(e.target.value)} 
                    value={category}
                    id="category"
                    className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all appearance-none bg-white cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="price" className="text-sm font-medium text-gray-600">Product Price</label>
                <input 
                  onChange={(e) => setPrice(e.target.value)} 
                  value={price} 
                  type="number" 
                  id="price"
                  placeholder="0" 
                  className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="offerPrice" className="text-sm font-medium text-gray-600">Offer Price</label>
                <input 
                  onChange={(e) => setOfferPrice(e.target.value)} 
                  value={offerPrice} 
                  type="number" 
                  id="offerPrice"
                  placeholder="0" 
                  className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-600">Quantity</label>
                <input 
                  onChange={(e) => setQuantity(e.target.value)} 
                  value={quantity} 
                  type="number" 
                  id="quantity"
                  placeholder="0" 
                  className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="minOrderQuantity" className="text-sm font-medium text-gray-600">Min Order Qty</label>
                <input 
                  onChange={(e) => setMinOrderQuantity(e.target.value)} 
                  value={minOrderQuantity} 
                  type="number" 
                  id="minOrderQuantity"
                  placeholder="1" 
                  className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="maxOrderQuantity" className="text-sm font-medium text-gray-600">Max Order Qty</label>
                <input 
                  onChange={(e) => setMaxOrderQuantity(e.target.value)} 
                  value={maxOrderQuantity} 
                  type="number" 
                  id="maxOrderQuantity"
                  placeholder="Optional" 
                  className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button 
              type="submit" 
              disabled={loading}
              className={`px-8 py-3 bg-primary text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
