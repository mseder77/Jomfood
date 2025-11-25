import React, { useState } from 'react';
import { DIETARY_OPTIONS, DISH_OPTIONS, RECOMMENDATION_OPTIONS, BAKERY_DEALS_OPTIONS, CUISINE_OPTIONS } from '../../constants';
import CategoriesSection from './CategoriesSection';

const Sidebar = () => {
  const [selectedDietary, setSelectedDietary] = useState('halal');
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [selectedBakery, setSelectedBakery] = useState(null);
  const [selectedCuisine, setSelectedCuisine] = useState(null);

  const handleClearAll = () => {
    setSelectedDietary(null);
    setSelectedDish(null);
    setSelectedRecommendation(null);
    setSelectedBakery(null);
    setSelectedCuisine(null);
  };

  const FilterSection = ({ title, options, selected, onSelect, showMore = false }) => (
    <div className="mb-8 px-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="radio"
              name={title.toLowerCase().replace(' ', '-')}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onSelect(option.value)}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700 leading-relaxed hover:text-primary transition-colors">
              {option.label}
            </span>
          </label>
        ))}
        {showMore && (
          <button className="text-primary text-sm font-medium py-2 hover:text-primary-600 transition-colors">
            Show More
          </button>
        )}
      </div>
    </div>
  );

  return (
    <aside className="w-full lg:w-72 bg-gray-50 border-r border-gray-200 lg:h-[calc(100vh-160px)] overflow-y-auto lg:sticky lg:top-[160px] z-10">
      <div className="p-4 lg:p-6 pb-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filtered By</h2>
        <button 
          className="text-primary text-sm font-medium hover:text-primary-600 transition-colors underline"
          onClick={handleClearAll}
        >
          Clear All
        </button>
      </div>
      
      <div className="py-4">
        {/* Categories Section - Dynamic from API */}
        <CategoriesSection />
        
        {/* <FilterSection
          title="Dietary"
          options={DIETARY_OPTIONS}
          selected={selectedDietary}
          onSelect={setSelectedDietary}
        />
        
        <FilterSection
          title="Dishes"
          options={DISH_OPTIONS}
          selected={selectedDish}
          onSelect={setSelectedDish}
          showMore={true}
        />
        
        <FilterSection
          title="Recommendations"
          options={RECOMMENDATION_OPTIONS}
          selected={selectedRecommendation}
          onSelect={setSelectedRecommendation}
          showMore={true}
        />
        
        <FilterSection
          title="Bakery Deals"
          options={BAKERY_DEALS_OPTIONS}
          selected={selectedBakery}
          onSelect={setSelectedBakery}
        />
        
        <FilterSection
          title="Cuisines"
          options={CUISINE_OPTIONS}
          selected={selectedCuisine}
          onSelect={setSelectedCuisine}
        /> */}
      </div>
    </aside>
  );
};

export default Sidebar;
