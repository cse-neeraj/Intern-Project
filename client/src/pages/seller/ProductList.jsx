import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate = useNavigate();
  const {
    products,
    currency,
    axios,
    fetchProducts,
    backendUrl,
  } = useAppContext();

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/seller/toggle-stock`,
        { productId: id, inStock },
        { withCredentials: true }
      );

      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateProductFeatures = async (productId, field, value) => {
    const product = products.find((p) => p._id === productId);

    const minQty =
      field === "minOrderQuantity"
        ? Number(value)
        : product.minOrderQuantity || 1;

    const maxQty =
      field === "maxOrderQuantity"
        ? value
          ? Number(value)
          : Infinity
        : product.maxOrderQuantity || Infinity;

    if (maxQty !== Infinity && minQty > maxQty) {
      return toast.error("Min Quantity cannot be greater than Max Quantity");
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/seller/update-product-features`,
        { productId, [field]: value || null },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Product List</h2>
                <p className="mt-1 text-sm text-gray-500">Manage your product catalog, prices, and stock settings.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                Total Products: <span className="text-gray-900 font-bold">{products.length}</span>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">
                    Min Order Qty
                  </th>
                  <th className="px-6 py-4 text-center">
                    Max Order Qty
                  </th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 p-1">
                                <img
                                src={product.image?.[0]}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate max-w-[200px] group-hover:text-primary transition-colors">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                            </div>
                        </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{currency}{product.offerPrice}</span>
                            {product.price > product.offerPrice && (
                                <span className="text-xs text-gray-400 line-through">{currency}{product.price}</span>
                            )}
                        </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        defaultValue={product.minOrderQuantity || 1}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        onBlur={(e) =>
                          updateProductFeatures(
                            product._id,
                            "minOrderQuantity",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        placeholder="∞"
                        defaultValue={product.maxOrderQuantity || ""}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400"
                        onBlur={(e) =>
                          updateProductFeatures(
                            product._id,
                            "maxOrderQuantity",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={product.inStock}
                          onChange={() =>
                            toggleStock(
                              product._id,
                              !product.inStock
                            )
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>

                    </td>

                    <td className="px-6 py-4 text-center">
                        <button
                            onClick={() => navigate(`/seller/product-list/edit/${product._id}`)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                            title="Edit Product"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.25h3m-3-3.75h3m-12-3h15.75c.828 0 1.5.672 1.5 1.5v2.25H3.375V5.25c0-.828.672-1.5 1.5-1.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-1">Get started by adding your first product.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
