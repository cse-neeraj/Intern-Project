import React, { useEffect, useState, useMemo } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Inventory = () => {

  const { backendUrl, axios, currency = '₹', products, fetchProducts } = useAppContext()
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selected, setSelected] = useState(new Set());
  const [bulkStock, setBulkStock] = useState('');
  const [changedStocks, setChangedStocks] = useState({});
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('inventory');
  const [history, setHistory] = useState([]);
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const itemsPerPage = 10

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (p.quantity || p.stock || 0) <= 5 && (p.quantity || p.stock || 0) > 0).length;
  const outOfStockCount = products.filter(p => (p.quantity || p.stock || 0) === 0).length;

  const updateStock = async (productId, newStock) => {
    const product = products.find(p => p._id === productId);
    const oldStock = product ? (product.quantity || product.stock || 0) : 0;

    try {
      const { data } = await axios.post(backendUrl + '/api/seller/update-stock', { productId, stock: newStock }, { withCredentials: true })
      if (data.success) {
        toast.success(data.message)
        setHistory(prev => [{
          id: Date.now(),
          productName: product?.name || 'Unknown Product',
          oldStock,
          newStock,
          date: new Date()
        }, ...prev]);
        fetchProducts()
        return true
      } else {
        toast.error(data.message)
        return false
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      return false
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    setSelected(new Set())
    setChangedStocks({})
  }, [search, showLowStock, sortConfig, products])

  const sortedProducts = useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key !== null) {
      sortableProducts.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'stock') {
          aValue = a.quantity || a.stock || 0;
          bValue = b.quantity || b.stock || 0;
        } else { // price
          aValue = a.price;
          bValue = b.price;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      const recordDate = new Date(record.date);
      if (historyStartDate) {
          const [sy, sm, sd] = historyStartDate.split('-').map(Number);
          const startDate = new Date(sy, sm - 1, sd);
          if (recordDate < startDate) return false;
      }
      if (historyEndDate) {
          const [ey, em, ed] = historyEndDate.split('-').map(Number);
          const endDate = new Date(ey, em - 1, ed, 23, 59, 59, 999);
          if (recordDate > endDate) return false;
      }
      return true;
    });
  }, [history, historyStartDate, historyEndDate]);

  const filteredProducts = sortedProducts.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const currentStock = item.quantity || item.stock || 0
    return matchesSearch && (showLowStock ? currentStock <= 5 : true)
  })
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (!sortConfig.key || sortConfig.key !== name) return '↕️';
    return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === paginatedProducts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedProducts.map(p => p._id)));
    }
  };

  const handleBulkUpdate = () => {
    if (bulkStock === '' || Number(bulkStock) < 0) return toast.error("Please enter a valid stock value");
    setIsBulkUpdateModalOpen(true);
  };

  const confirmBulkUpdate = async () => {
    setIsBulkUpdateModalOpen(false);
    const toastId = toast.loading("Updating stock...");
    
    const updates = [];
    [...selected].forEach(id => {
      const product = products.find(p => p._id === id);
      if (product) {
        updates.push({
          id: Date.now() + Math.random(),
          productName: product.name,
          oldStock: product.quantity || product.stock || 0,
          newStock: bulkStock,
          date: new Date()
        });
      }
    });

    try {
        await Promise.all([...selected].map(id => 
            axios.post(backendUrl + '/api/seller/update-stock', { productId: id, stock: bulkStock }, { withCredentials: true })
        ));
        toast.success("Stock updated successfully", { id: toastId });
        setHistory(prev => [...updates, ...prev]);
        fetchProducts();
        setSelected(new Set());
        setBulkStock('');
    } catch (error) {
        console.log(error);
        toast.error("Failed to update some items", { id: toastId });
    }
  };

  const handleStockUpdate = (id) => {
    const newStock = changedStocks[id];
    if (newStock === undefined) return;
    setItemToUpdate(id);
    setIsUpdateModalOpen(true);
  };

  const handleCancelUpdate = (id) => {
    setChangedStocks(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const confirmUpdate = async () => {
    if (!itemToUpdate) return;
    const newStock = changedStocks[itemToUpdate];
    setIsUpdateModalOpen(false);
    const success = await updateStock(itemToUpdate, newStock);
    if (success) {
      setChangedStocks(prev => {
        const next = { ...prev };
        delete next[itemToUpdate];
        return next;
      });
    }
    setItemToUpdate(null);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleteModalOpen(false);
    try {
      const { data } = await axios.post(backendUrl + '/api/product/delete', { id: itemToDelete }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setItemToDelete(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu-btn') && !event.target.closest('.action-menu-dropdown')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  return (
    <div className='flex-1 h-[calc(100vh-4rem)] overflow-y-scroll overflow-x-hidden bg-gray-50'>
      <div className='md:p-10 p-4 w-full max-w-7xl mx-auto'>
      
      {/* Header & Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className='text-3xl font-bold text-gray-800'>Inventory Management</h2>
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'inventory' ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Inventory
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              History
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'inventory' && (
      <>
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.25h3m-3-3.75h3m-12-3h15.75c.828 0 1.5.672 1.5 1.5v2.25H3.375V5.25c0-.828.672-1.5 1.5-1.5z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="p-3 bg-red-50 rounded-full text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${showLowStock ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            {showLowStock ? 'Showing Low Stock' : 'Filter Low Stock'}
          </button>
          </div>
        </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-4 bg-primary/5 p-4 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-2">
            <span className="font-medium text-primary">{selected.size} items selected</span>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="Set stock to..." 
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                    className="border border-primary/20 rounded px-3 py-1.5 text-sm outline-none focus:border-primary w-40 bg-white"
                    min="0"
                />
                <button 
                    onClick={handleBulkUpdate}
                    className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Update All
                </button>
            </div>
        </div>
      )}

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4 w-16">
                  <input 
                    type="checkbox" 
                    checked={paginatedProducts.length > 0 && selected.size === paginatedProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Product</th>
                <th className="px-6 py-4 whitespace-nowrap">Category</th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('price')}>
                  <div className="flex items-center gap-1">Price {getSortIcon('price')}</div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('stock')}>
                  <div className="flex items-center gap-1">Stock {getSortIcon('stock')}</div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedProducts.map((item) => (
                <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${selected.has(item._id) ? 'bg-primary/5' : (item.quantity || item.stock || 0) <= 5 ? 'bg-amber-50/40 hover:bg-amber-50/60' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selected.has(item._id)}
                      onChange={() => toggleSelect(item._id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img className='w-12 h-12 object-cover rounded-md border border-gray-200' src={item.image[0]} alt="" />
                      <div className='flex flex-col'>
                        <p className='font-medium text-gray-800 truncate max-w-[200px]' title={item.name}>{item.name}</p>
                        {(item.quantity || item.stock || 0) === 0 && <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1">Out of Stock</span>}
                        {(item.quantity || item.stock || 0) <= 5 && (item.quantity || item.stock || 0) > 0 && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded-full w-fit mt-1">Low Stock</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{currency}{item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      onChange={(e) => setChangedStocks(prev => ({ ...prev, [item._id]: e.target.value }))}
                      className={`w-24 border rounded-lg px-3 py-1.5 text-sm outline-none transition-all shadow-sm ${(item.quantity || item.stock || 0) <= 5 ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'}`}
                      type="number" 
                      value={changedStocks[item._id] ?? (item.quantity || item.stock || 0)} 
                      min={0}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item._id ? null : item._id);
                        }}
                        className="action-menu-btn p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                      </button>
                      
                      {openMenuId === item._id && (
                        <div className="action-menu-dropdown absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {changedStocks[item._id] !== undefined && changedStocks[item._id] != (item.quantity || item.stock || 0) && (
                            <>
                              <button 
                                onClick={() => { handleStockUpdate(item._id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                Update Stock
                              </button>
                              <button 
                                onClick={() => { handleCancelUpdate(item._id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                                Discard Changes
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                            </>
                          )}
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Delete Product
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No products found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-200 bg-gray-50/50">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      </>
      )}
    
    

        {activeTab === 'history' && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2'>
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">From:</span>
                    <input 
                        type="date" 
                        value={historyStartDate} 
                        onChange={(e) => setHistoryStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">To:</span>
                    <input 
                        type="date" 
                        value={historyEndDate} 
                        onChange={(e) => setHistoryEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                    />
                </div>
                {(historyStartDate || historyEndDate) && (
                    <button 
                        onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }}
                        className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-right">Old Stock</th>
                    <th className="px-6 py-4 text-right">New Stock</th>
                    <th className="px-6 py-4 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredHistory.map((record) => {
                    const change = Number(record.newStock) - Number(record.oldStock);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {record.date.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{record.productName}</td>
                        <td className="px-6 py-4 text-right text-gray-500">{record.oldStock}</td>
                        <td className="px-6 py-4 text-right font-medium">{record.newStock}</td>
                        <td className={`px-6 py-4 text-right font-bold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {change > 0 ? '+' : ''}{change}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        {history.length === 0 ? "No stock updates recorded in this session." : "No records found for the selected date range."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isBulkUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-out duration-200">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Bulk Update</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to update the stock for <span className="font-bold text-primary">{selected.size}</span> items to <span className="font-bold text-primary">{bulkStock}</span>?
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsBulkUpdateModalOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={confirmBulkUpdate} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium shadow-sm transition-colors">
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-out duration-200">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Update</h3>
              <p className="text-gray-500 mb-6">
                Update stock for <span className="font-semibold text-gray-900">{products.find(p => p._id === itemToUpdate)?.name}</span> to <span className="font-bold text-primary">{changedStocks[itemToUpdate]}</span>?
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setIsUpdateModalOpen(false); setItemToUpdate(null); }} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={confirmUpdate} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium shadow-sm transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-out duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{products.find(p => p._id === itemToDelete)?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  )
}

export default Inventory