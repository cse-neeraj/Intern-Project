import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";

const Category = () => {
  const { categories, axios, fetchCategories, backendUrl } = useAppContext();
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
      const { data } = await axios.post(backendUrl + "/api/category/add", formData);
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
      const { data } = await axios.delete(backendUrl + `/api/category/delete/${id}`);
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

      const { data } = await axios.post(backendUrl + "/api/category/update", formData);
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
    <div className="flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="md:p-10 p-4 w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Category Management</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Category</h3>
          <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <label className="text-sm font-medium text-gray-600 mb-2 block">Icon</label>
              <label htmlFor="category-image" className="cursor-pointer flex flex-col items-center justify-center w-28 h-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all relative overflow-hidden group">
                {image ? (
                  <img src={URL.createObjectURL(image)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-primary">
                    <img src={assets.upload_area} alt="upload" className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                <input id="category-image" type="file" onChange={(e) => setImage(e.target.files[0])} hidden />
              </label>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="category-name" className="text-sm font-medium text-gray-600">Category Name</label>
                <input id="category-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fruits & Vegetables" className="outline-none py-2.5 px-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full text-sm transition-all" required />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="category-bgcolor" className="text-sm font-medium text-gray-600">Background Color</label>
                <div className="flex items-center gap-3 p-1.5 border border-gray-300 rounded-lg bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input id="category-bgcolor" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 cursor-pointer border-none rounded bg-transparent p-0" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 outline-none text-sm uppercase text-gray-600 font-mono" />
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                <button disabled={loading} type="submit" className={`px-8 py-2.5 bg-primary text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}>
                  {loading ? "Processing..." : "Add Category"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-800">Existing Categories <span className="text-sm font-normal text-gray-500 ml-2">({categories?.length || 0})</span></h3>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
          
          {categories?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500 text-lg">No categories found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories?.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <div key={item._id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              <div className="relative h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: editId === item._id ? editBgColor : item.bgColor }}></div>
                <img src={editId === item._id && editImage ? URL.createObjectURL(editImage) : item.image} alt={item.name} className={`w-16 h-16 object-contain z-10 ${editId !== item._id ? "group-hover:scale-110 transition-transform duration-300" : ""}`} />
                
                {editId === item._id && (
                  <label htmlFor={`edit-image-${item._id}`} className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-20">
                    <img src={assets.upload_area} alt="upload" className="w-6 h-6 opacity-80 invert brightness-0" />
                    <span className="text-white text-[10px] font-medium mt-1">Change</span>
                    <input id={`edit-image-${item._id}`} type="file" onChange={(e) => setEditImage(e.target.files[0])} hidden />
                  </label>
                )}

                {editId !== item._id && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm z-20">
                    <button onClick={() => { setEditId(item._id); setEditName(item.name); setEditImage(null); setEditBgColor(item.bgColor); }} className="p-1.5 text-gray-600 hover:text-primary rounded-md hover:bg-primary/10 transition-colors" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button onClick={() => deleteCategory(item._id)} className="p-1.5 text-gray-600 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" title="Delete">
                      <img src={assets.remove_icon} alt="delete" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                {editId === item._id ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full outline-none border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-primary"
                        autoFocus
                        placeholder="Name"
                      />
                      <div className="flex items-center gap-2">
                        <input type="color" value={editBgColor} onChange={(e) => setEditBgColor(e.target.value)} className="h-8 w-8 cursor-pointer border border-gray-300 rounded p-0.5 bg-white" title="Bg Color" />
                        <input 
                          type="text" 
                          value={editBgColor} 
                          onChange={(e) => setEditBgColor(e.target.value)} 
                          className="flex-1 outline-none border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-primary font-mono uppercase" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Cancel</button>
                      <button onClick={() => updateCategory(item._id)} className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/90">Save</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-gray-800 truncate" title={item.name}>{item.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: item.bgColor }}></div>
                      <span className="text-xs text-gray-400 font-mono uppercase">{item.bgColor}</span>
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
