import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { assets } from "../assets/assets";

const AllProducts = () => {
  const { products, searchQuery, navigate } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredProducts(products);
    }
    setVisibleCount(10);
  }, [searchQuery, products]);

  return (
    <div className="mt-8 md:mt-10 px-4 md:px-10">
      <div id="all-products" className="text-2xl font-medium uppercase scroll-mt-24">
        <p>All PRODUCTS</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-6">
        {filteredProducts.slice(0, visibleCount).map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-8 py-3 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
