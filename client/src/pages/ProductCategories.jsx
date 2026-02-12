import React from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Banner from "../components/Banner";

const ProductCategories = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category,
  );

  return (
    <div className="mt-4 md:mt-10 px-4 md:px-10">
      <Banner />
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product._id} product={product} hideCategory={true} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500 text-lg">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCategories;
