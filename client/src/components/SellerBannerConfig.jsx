import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';

const SellerBannerConfig = () => {
  const { backendUrl, token, axios, banners, fetchBanners, categories } = useAppContext();
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState({
    title: "",
    description: "",
    buttonText: "Shop Now",
    buttonLink: "/products",
    showBanner: true,
    showPages: [],
    showCategories: []
  });

  const setForm = (banner) => {
    if(banner) {
        setEditId(banner._id);
        setData({
            title: banner.title || "",
            description: banner.description || "",
            buttonText: banner.buttonText || "Shop Now",
            buttonLink: banner.buttonLink || "/products",
            showBanner: banner.showBanner !== undefined ? banner.showBanner : true,
            showPages: banner.showPages || ['home'],
            showCategories: banner.showCategories || []
        });
    } else {
        setEditId(null);
        setData({
            title: "", description: "", buttonText: "Shop Now", buttonLink: "/products", showBanner: true, showPages: ['home'], showCategories: []
        });
        setImage(false);
    }
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setData(data => ({ ...data, [name]: value }));
  }

  const handlePageChange = (page) => {
    setData(prev => {
      const pages = prev.showPages.includes(page)
        ? prev.showPages.filter(p => p !== page)
        : [...prev.showPages, page];
      return { ...prev, showPages: pages };
    });
  }

  const handleCategoryChange = (category) => {
    setData(prev => {
      const cats = prev.showCategories.includes(category)
        ? prev.showCategories.filter(c => c !== category)
        : [...prev.showCategories, category];
      return { ...prev, showCategories: cats };
    });
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if(editId) {
        formData.append("id", editId);
      }
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("buttonText", data.buttonText);
      formData.append("buttonLink", data.buttonLink);
      formData.append("showBanner", data.showBanner);
      formData.append("showPages", JSON.stringify(data.showPages));
      formData.append("showCategories", JSON.stringify(data.showCategories));
      if (image) {
        formData.append("image", image);
      }

      const endpoint = editId ? "/api/banner/update" : "/api/banner/add";
      const { data: responseData } = await axios.post(backendUrl + endpoint, formData, { headers: { token }, withCredentials: true });

      if (responseData.success) {
        toast.success(responseData.message);
        fetchBanners();
        setImage(false);
        setForm(null);
        setShowForm(false);
      } else {
        toast.error(responseData.message);
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  const deleteBanner = async (id) => {
    if(!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
        const { data } = await axios.delete(backendUrl + `/api/banner/delete/${id}`, { headers: { token }, withCredentials: true });
        if(data.success) {
            toast.success(data.message);
            fetchBanners();
            if(editId === id) {
              setForm(null);
              setShowForm(false);
            }
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
  }

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Banner Configuration</h2>
            <button 
                onClick={() => setForm(null)} 
                className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 font-medium"
            >
                <span className="text-xl leading-none mb-0.5">+</span> Add New Banner
            </button>
        </div>
        
        {/* List of existing banners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {banners.map((b) => (
                <div key={b._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group ${editId === b._id ? 'ring-2 ring-primary border-transparent' : 'border-gray-200'}`}>
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img src={b.image} alt={b.title} className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                             <div className="flex gap-2 w-full">
                                <button onClick={() => setForm(b)} className="flex-1 bg-white/90 hover:bg-white text-gray-900 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">Edit</button>
                                <button onClick={() => deleteBanner(b._id)} className="flex-1 bg-red-500/90 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">Delete</button>
                             </div>
                        </div>
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${b.showBanner ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                            {b.showBanner ? 'Active' : 'Inactive'}
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{b.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 leading-relaxed">{b.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                            {b.showPages.map(page => (
                                <span key={page} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md capitalize border border-gray-200">
                                    {page}
                                </span>
                            ))}
                            {b.showCategories?.map(cat => (
                                <span key={cat} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md capitalize border border-blue-100">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            {banners.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <img src={assets.banner_icon} alt="" className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">No banners found</p>
                    <p className="text-sm mt-1">Get started by creating a new banner for your store.</p>
                </div>
            )}
        </div>

        {showForm && (
            <div ref={formRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">{editId ? "Edit Banner" : "Create New Banner"}</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Banner Title</label>
                        <input
                          onChange={onChangeHandler}
                          value={data.title}
                          name="title"
                          type="text"
                          placeholder="e.g. Mega Summer Sale"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Button Text</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.buttonText}
                            name="buttonText"
                            type="text"
                            placeholder="e.g. Shop Now"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      onChange={onChangeHandler}
                      value={data.description}
                      name="description"
                      placeholder="Enter a catchy description for your banner..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Button Link</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.buttonLink}
                            name="buttonLink"
                            type="text"
                            placeholder="e.g. /products/fruits"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Visibility</label>
                        <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                            <input
                            type="checkbox"
                            id="showBanner"
                            name="showBanner"
                            checked={data.showBanner}
                            onChange={onChangeHandler}
                            className="w-5 h-5 cursor-pointer accent-primary text-primary focus:ring-primary rounded"
                            />
                            <label htmlFor="showBanner" className="cursor-pointer font-medium text-gray-700 select-none flex-1">
                            Active Status
                            </label>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Display Pages</label>
                    <div className="flex flex-wrap gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                        {['home', 'products', 'contact'].map((page) => (
                            <label key={page} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all select-none ${data.showPages.includes(page) ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    checked={data.showPages.includes(page)}
                                    onChange={() => handlePageChange(page)}
                                    className="hidden"
                                />
                                <span className="capitalize">{page}</span>
                                {data.showPages.includes(page) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </label>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Display Categories</label>
                    <div className="flex flex-wrap gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                        {categories.map((cat) => (
                            <label key={cat._id} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all select-none ${data.showCategories.includes(cat.name) ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    checked={data.showCategories.includes(cat.name)}
                                    onChange={() => handleCategoryChange(cat.name)}
                                    className="hidden"
                                />
                                <span className="capitalize">{cat.name}</span>
                                {data.showCategories.includes(cat.name) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </label>
                        ))}
                        {categories.length === 0 && <p className="text-sm text-gray-500">No categories available.</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Banner Image</label>
                    <label htmlFor="banner-image" className="cursor-pointer w-full h-56 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-primary/50 transition-all bg-gray-50 overflow-hidden relative group">
                       <div className='absolute inset-0 flex items-center justify-center'>
                          {!image && (!editId || !data.image) && <div className='flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors'>
                              <img src={assets.upload_area} alt="" className='w-12 h-12 mb-3 opacity-40 group-hover:opacity-60 transition-opacity'/>
                              <p className="font-medium">Click to upload image</p>
                              <p className="text-xs mt-1 opacity-70">Recommended size: 1920x400px</p>
                          </div>}
                          {image ? (
                            <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                             editId && <img src={banners.find(b => b._id === editId)?.image} alt="Current" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                          )}
                       </div>
                       <input onChange={(e) => setImage(e.target.files[0])} type="file" id="banner-image" hidden />
                    </label>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button type="submit" disabled={loading} className="bg-primary text-white py-3 px-8 rounded-lg hover:bg-primary/90 transition-all shadow-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex-1 md:flex-none md:w-48 justify-center flex">
                      {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (editId ? 'Update Banner' : 'Create Banner')}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="bg-white text-gray-700 border border-gray-300 py-3 px-8 rounded-lg hover:bg-gray-50 transition-all font-medium flex-1 md:flex-none">Cancel</button>
                  </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerBannerConfig;
