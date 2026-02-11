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
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
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
        setImage(false);
    } else {
        setEditId(null);
        setData({
            title: "", description: "", buttonText: "Shop Now", buttonLink: "/products", showBanner: true, showPages: ['home'], showCategories: []
        });
        setImage(false);
    }
    setShowForm(true);
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

  const toggleBannerStatus = async (bannerId, currentStatus) => {
    setUpdatingStatusId(bannerId);
    try {
        const formData = new FormData();
        formData.append("id", bannerId);
        formData.append("showBanner", !currentStatus);

        const { data } = await axios.post(backendUrl + '/api/banner/update', formData, { headers: { token }, withCredentials: true });

        if (data.success) {
            toast.success('Banner status updated.');
            fetchBanners();
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update status.');
    } finally {
        setUpdatingStatusId(null);
    }
  };

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

  const renderBannerCard = (b) => (
    <div key={b._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col ${editId === b._id ? 'ring-2 ring-primary border-transparent' : 'border-gray-200'} ${!b.showBanner ? 'opacity-90 grayscale-[0.1]' : ''}`}>
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                    <button onClick={() => setForm(b)} className="bg-white text-gray-900 p-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-110" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    </button>
                    <button onClick={() => deleteBanner(b._id)} className="bg-white text-red-600 p-2.5 rounded-full hover:bg-red-50 transition-colors shadow-lg transform hover:scale-110" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    </button>
            </div>
            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border z-10 uppercase tracking-wide ${b.showBanner ? 'bg-green-500 text-white border-green-600' : 'bg-gray-500 text-white border-gray-600'}`}>
                {b.showBanner ? 'Active' : 'Inactive'}
            </div>
            <label htmlFor={`toggle-${b._id}`} className="absolute top-3 right-3 flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id={`toggle-${b._id}`} 
                        className="sr-only" 
                        checked={b.showBanner}
                        onChange={() => toggleBannerStatus(b._id, b.showBanner)}
                        disabled={updatingStatusId === b._id}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors shadow-inner ${b.showBanner ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center shadow-sm ${b.showBanner ? 'translate-x-4' : ''}`}>
                        {updatingStatusId === b._id && (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>
            </label>
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 mb-1 truncate" title={b.title}>{b.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{b.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
                {b.showPages.map(page => (
                    <span key={page} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded border border-gray-200 capitalize">
                        {page}
                    </span>
                ))}
                {b.showCategories?.map(cat => (
                    <span key={cat} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded border border-blue-100 capitalize">
                        {cat}
                    </span>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Banner Configuration</h2>
                <p className="mt-1 text-sm text-gray-500">Manage promotional banners for your store.</p>
            </div>
            <button 
                onClick={() => setForm(null)} 
                className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dull transition-all shadow-lg shadow-primary/30 flex items-center gap-2 font-medium text-sm transform hover:-translate-y-0.5 active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Banner
            </button>
        </div>
        
        {/* List of existing banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {banners.map(renderBannerCard)}
        </div>

        {banners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <img src={assets.banner_icon} alt="" className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-lg font-medium text-gray-500">No banners found</p>
                <p className="text-sm mt-1">Get started by creating a new banner for your store.</p>
            </div>
        )}

        {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div ref={formRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-out duration-200 my-8">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Banner" : "Create New Banner"}</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                <form onSubmit={onSubmitHandler} className="space-y-6">
                  {/* Preview Section */}
                  <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Live Preview
                      </div>
                      <div className="relative w-full h-[250px] md:h-[300px] bg-gray-100 overflow-hidden group">
                           {image ? (
                              <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                           ) : (editId && banners.find(b => b._id === editId)?.image) ? (
                              <img src={banners.find(b => b._id === editId)?.image} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                  <div className="text-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 opacity-50">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                      </svg>
                                      <p className="text-sm font-medium">No image selected</p>
                                  </div>
                              </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col items-center md:items-start justify-center px-6 md:pl-16 lg:pl-24">
                              <div className="max-w-2xl space-y-4 text-center md:text-left">
                                  <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg line-clamp-2">
                                      {data.title || "Banner Title"}
                                  </h1>
                                  <p className="text-sm md:text-lg text-gray-100 font-medium drop-shadow-md leading-relaxed line-clamp-3">
                                      {data.description || "Banner description goes here..."}
                                  </p>
                                  <div className="flex items-center justify-center md:justify-start pt-2">
                                      <span className="group flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-full shadow-lg">
                                          {data.buttonText || "Button Text"}
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                          </svg>
                                      </span>
                                  </div>
                              </div>
                           </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Banner Title</label>
                        <input
                          onChange={onChangeHandler}
                          value={data.title}
                          name="title"
                          type="text"
                          placeholder="e.g. Mega Summer Sale"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Button Text</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.buttonText}
                            name="buttonText"
                            type="text"
                            placeholder="e.g. Shop Now"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                      </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      onChange={onChangeHandler}
                      value={data.description}
                      name="description"
                      placeholder="Enter a catchy description for your banner..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Button Link</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.buttonLink}
                            name="buttonLink"
                            type="text"
                            placeholder="e.g. /products/fruits"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Visibility</label>
                        <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                            <input
                            type="checkbox"
                            id="showBanner"
                            name="showBanner"
                            checked={data.showBanner}
                            onChange={onChangeHandler}
                            className="w-4 h-4 cursor-pointer accent-primary text-primary focus:ring-primary rounded"
                            />
                            <label htmlFor="showBanner" className="cursor-pointer font-medium text-gray-700 select-none flex-1 text-sm">
                            Active Status
                            </label>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Display Pages</label>
                    <div className="flex flex-wrap gap-3 p-4 border border-gray-300 rounded-lg bg-white">
                        {['home', 'products', 'contact', 'small-banner'].map((page) => (
                            <label key={page} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all select-none text-sm ${data.showPages.includes(page) ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
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
                    <label className="text-sm font-medium text-gray-700">Display Categories</label>
                    <div className="flex flex-wrap gap-3 p-4 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                        {categories.map((cat) => (
                            <label key={cat._id} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all select-none text-sm ${data.showCategories.includes(cat.name) ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
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
                    <label className="text-sm font-medium text-gray-700">Banner Image</label>
                    <label htmlFor="banner-image" className="cursor-pointer w-full h-56 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-primary/50 transition-all bg-white overflow-hidden relative group">
                       <div className='absolute inset-0 flex items-center justify-center'>
                          {!image && !editId && <div className='flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors'>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                              <p className="font-medium text-sm">Click to upload image</p>
                              <p className="text-xs mt-1 opacity-70">Recommended size: 1920x400px</p>
                          </div>}
                          {image ? (
                            <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                             editId && <img src={banners.find(b => b._id === editId)?.image} alt="Current" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          )}
                          {(image || editId) && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white mb-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                </svg>
                                <p className="text-white text-xs font-medium">Change Image</p>
                            </div>
                          )}
                       </div>
                       <input onChange={(e) => setImage(e.target.files[0])} type="file" id="banner-image" hidden />
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (editId ? 'Update Banner' : 'Create Banner')}
                    </button>
                  </div>
                </form>
                </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerBannerConfig;
