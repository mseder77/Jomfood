import React from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Sidebar from "./Sidebar";
import RestaurantList from "../restaurant/RestaurantList";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isRestaurantPage={true}/>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)]">
        <Sidebar />
        <RestaurantList />
      </div>
    </div>
  );
};

export default Layout;
