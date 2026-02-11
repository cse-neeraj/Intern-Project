import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";

const Category = () => {
  const { categories, axios, fetchCategories, backendUrl, token } = useAppContext();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editBgColor, setEditBgColor] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetchCategories) {
      fetchCategories();
    }
  }, [fetchCategories]);

  const addCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      formData.append("bgColor", bgColor);
      const { data } = await axios.post(backendUrl + "/api/category/add", formData, { headers: { token }, withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setName("");
        setImage(null);
        setBgColor("#ffffff");
        if (fetchCategories) {
          fetchCategories();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      const { data } = await axios.post(backendUrl + "/api/category/delete", { _id: id }, { headers: { token }, withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        if (fetchCategories) {
          fetchCategories();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const updateCategory = async (id) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", editName);
      formData.append("bgColor", editBgColor);
      if (editImage) formData.append("image", editImage);

      const { data } = await axios.post(backendUrl + "/api/category/update", formData, { headers: { token }, withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setEditId(null);
        if (fetchCategories) {
          fetchCategories();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
            <p className="mt-1 text-sm text-gray-500">Create and manage product categories for your store.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Add New Category</h3>
          <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category Icon</label>
              <label htmlFor="category-image" className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all relative overflow-hidden group">
                {image ? (
                  <img src={URL.createObjectURL(image)} alt="preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="text-xs font-medium">Upload</span>
                  </div>
                )}
                <input id="category-image" type="file" onChange={(e) => setImage(e.target.files[0])} hidden accept="image/*" />
              </label>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="category-name" className="text-sm font-medium text-gray-700">Category Name</label>
                <input id="category-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fruits & Vegetables" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" required />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="category-bgcolor" className="text-sm font-medium text-gray-700">Background Color</label>
                <div className="flex items-center gap-3 p-1.5 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input id="category-bgcolor" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 cursor-pointer border-none rounded bg-transparent p-0" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 outline-none text-sm uppercase text-gray-600 font-mono" />
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-end pt-2">
                <button disabled={loading} type="submit" className={`px-8 py-2.5 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dull hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
                  {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                  ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Category
                      </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800">Existing Categories <span className="text-sm font-medium text-gray-500 ml-2 bg-white px-2 py-0.5 rounded-full border border-gray-200">{categories?.length || 0}</span></h3>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
          
          {categories?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V18A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">No categories found</p>
                <p className="text-sm mt-1">Try adjusting your search or add a new one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <div key={item._id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 transition-colors duration-300" style={{ backgroundColor: editId === item._id ? editBgColor : item.bgColor }}></div>
                <img src={editId === item._id && editImage ? URL.createObjectURL(editImage) : item.image} alt={item.name} className={`w-20 h-20 object-contain z-10 drop-shadow-sm ${editId !== item._id ? "group-hover:scale-110 transition-transform duration-300" : ""}`} />
                
                {editId === item._id && (
                  <label htmlFor={`edit-image-${item._id}`} className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-20 backdrop-blur-[1px]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white mb-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    <span className="text-white text-xs font-medium">Change Icon</span>
                    <input id={`edit-image-${item._id}`} type="file" onChange={(e) => setEditImage(e.target.files[0])} hidden accept="image/*" />
                  </label>
                )}

                {editId !== item._id && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm z-20 border border-gray-100">
                    <button onClick={() => { setEditId(item._id); setEditName(item.name); setEditImage(null); setEditBgColor(item.bgColor); }} className="p-1.5 text-gray-500 hover:text-primary rounded-md hover:bg-primary/10 transition-colors" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button onClick={() => deleteCategory(item._id)} className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between border-t border-gray-100">
                {editId === item._id ? (
                  <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full outline-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        autoFocus
                        placeholder="Category Name"
                      />
                      <div className="flex items-center gap-2">
                        <div className="relative">
                            <input type="color" value={editBgColor} onChange={(e) => setEditBgColor(e.target.value)} className="h-9 w-9 cursor-pointer border border-gray-300 rounded-lg p-0.5 bg-white" title="Bg Color" />
                        </div>
                        <input 
                          type="text" 
                          value={editBgColor} 
                          onChange={(e) => setEditBgColor(e.target.value)} 
                          className="flex-1 outline-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono uppercase transition-all" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={() => setEditId(null)} className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Cancel</button>
                      <button onClick={() => updateCategory(item._id)} className="text-xs font-medium bg-primary text-white px-4 py-1.5 rounded hover:bg-primary-dull transition-colors shadow-sm">Save</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-gray-800 truncate text-lg mb-1" title={item.name}>{item.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: item.bgColor }}></div>
                      <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">{item.bgColor}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
