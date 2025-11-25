import React from "react";
import Header from "./Header";

const CommonLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {children}
    </div>
  );
};

export default CommonLayout;
