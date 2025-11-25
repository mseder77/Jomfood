import React, { useState, useEffect } from 'react';
import { useApiContext } from '../../context/ApiContext';
import { categoriesAPI } from '../../utils/api';

const CategoriesSection = () => {
  const { selectedCategory, setSelectedCategory } = useApiContext();
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial categories on component mount
  useEffect(() => {
    const fetchInitialCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await categoriesAPI.getCategories({ 
          limit: 4, 
          is_active: true 
        });
        setCategories(data.data || data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
        console.error('Error fetching initial categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCategories();
  }, []); // Empty dependency array - only run once on mount

  const handleShowAll = async () => {
    if (showAll) return; // Prevent multiple calls
    
    setShowAll(true);
    setLoading(true);
    
    try {
      const data = await categoriesAPI.getCategories({ 
        limit: 999999,
        is_active: true 
      });
      setCategories(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch all categories');
      console.error('Error fetching all categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="mb-6 sm:mb-8 px-3 sm:px-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Categories</h3>
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3.5 sm:h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="mb-6 sm:mb-8 px-3 sm:px-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Categories</h3>
        <div className="text-xs sm:text-sm text-red-600">
          Failed to load categories. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8 px-3 sm:px-4">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Categories</h3>
      
      <div className="space-y-2 sm:space-y-3">
        {categories.map((category) => (
          <label key={category._id} className="flex items-center gap-2 sm:gap-3 cursor-pointer py-1">
            <input
              type="radio"
              name="category"
              value={category._id}
              checked={selectedCategory?._id === category._id}
              onChange={() => handleCategorySelect(category)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-xs sm:text-sm text-gray-700 leading-relaxed hover:text-primary transition-colors">
              {category.name}
            </span>
          </label>
        ))}
        
        {!showAll && categories.length > 0 && (
          <button 
            className="text-primary text-xs sm:text-sm font-medium py-2 hover:text-primary-600 transition-colors"
            onClick={handleShowAll}
          >
            View All Categories
          </button>
        )}
        
        {selectedCategory && (
          <button 
            className="text-gray-500 text-xs sm:text-sm font-medium ml-2 py-2 hover:text-gray-700 transition-colors"
            onClick={handleClearCategory}
          >
            Clear Selection
          </button>
        )}
        
        {loading && showAll && (
          <div className="text-xs sm:text-sm text-gray-500">
            Loading more categories...
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesSection;
