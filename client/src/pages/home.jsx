import React from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSellers from "../components/BestSellers";
import BottomBanner from "../components/BottomBanner";
import NewsLetter from "../components/NewsLetter";
import SmallBanner from "../components/SmallBanner";

const Home = () => {
  return (
    <div className="mt-4 px-4 md:mt-10 md:px-10">
      <MainBanner />
      <SmallBanner />
      <Categories />
      <BestSellers />
      <BottomBanner />
      <NewsLetter />
    </div>
  );
};

export default Home;
