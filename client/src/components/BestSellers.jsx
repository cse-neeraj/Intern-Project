import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const BestSellers = () => {
  const { products, navigate } = useAppContext();
  return (
    <div className="mt-10 md:mt-20">
      <p className="text-2xl md:text-3xl font-medium">Bestsellers</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-8 mt-8">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
