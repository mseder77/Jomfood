import React from "react";
import { ChevronDown } from "lucide-react";
import foodDeliveryIcon from "../../assets/food-delivery.png";
import foodTrayIcon from "../../assets/food-tray.png";
import locationIcon from "../../assets/location.png";

const SearchBar = () => {
  return (
    <div className="bg-primary-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 sm:p-3 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <img
                src={foodDeliveryIcon}
                alt="Delivery"
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <span className="text-xs sm:text-sm text-gray-700 font-bold">
                Delivery
              </span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ml-auto font-bold" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <img src={foodTrayIcon} alt="Food Type" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-700 font-bold">
                Food Type
              </span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ml-auto font-bold" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <img src={locationIcon} alt="Location" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-700 font-bold">
                Location
              </span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ml-auto font-bold" />
            </div>
          </div>

          <button className="bg-primary hover:bg-primary-600 text-white px-4 sm:px-6 py-2 rounded font-medium text-xs sm:text-sm transition-colors whitespace-nowrap">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
