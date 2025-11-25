import React, { useState, useEffect } from 'react';
import { SORT_OPTIONS } from '../../constants';
import RestaurantCard from './RestaurantCard';
import { useApiContext } from '../../context/ApiContext';
import { useRestaurants } from '../../hooks/useApi';
import { useGeolocation } from '../../hooks/useGeolocation';
import Pagination from '../ui/Pagination';
import { MapPin, Navigation } from 'lucide-react';

const RestaurantList = () => {
  const [sortBy, setSortBy] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { selectedCategory } = useApiContext();
  
  // Geolocation hook
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    fetchLocation, 
    hasLocation 
  } = useGeolocation();
  
  // Fetch restaurants with location and sortBy - backend will handle sorting
  const { restaurants, loading, error, pagination } = useRestaurants(
    selectedCategory?._id, 
    currentPage, 
    itemsPerPage,
    location,  // Pass user location to backend
    sortBy     // Pass sort option to backend
  );

  // Reset to page 1 when category or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex bg-white rounded-xl shadow-light mb-4 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-44 h-32 bg-gray-200 flex-shrink-0"></div>
      
      {/* Content skeleton */}
      <div className="flex-1 p-4">
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
      
      {/* Buttons skeleton */}
      <div className="flex flex-col gap-3 p-4 min-w-32">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    
    // If user selects "nearest" but doesn't have location yet, request it
    if (newSortBy === 'nearest' && !hasLocation) {
      fetchLocation().catch((err) => {
        console.error('Failed to get location:', err);
        // Revert to recommended if location fetch fails
        setSortBy('recommended');
      });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestLocation = async () => {
    try {
      await fetchLocation();
      setSortBy('nearest');
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 sm:p-6 bg-white min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-200 gap-4">
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <label htmlFor="sort-select" className="text-sm text-gray-600 font-medium">
              Sort By:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm cursor-pointer focus:border-primary focus:outline-none w-full sm:w-auto"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 sm:p-6 bg-white min-h-screen">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-semibold mb-2">Error Loading Restaurants</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 bg-white min-h-screen">
      {/* Location prompt banner */}
      {!hasLocation && sortBy !== 'nearest' && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-orange-50 border border-primary-200 rounded-lg flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Find restaurants near you
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Enable location to discover nearby restaurants and get accurate delivery times
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestLocation}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="w-4 h-4" />
            {locationLoading ? 'Getting location...' : 'Enable Location'}
          </button>
        </div>
      )}

      {/* Location error message */}
      {locationError && sortBy === 'nearest' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Location Error:</span> {locationError}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Please enable location permissions in your browser settings to use this feature.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-200 gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {selectedCategory ? `${selectedCategory.name} Restaurants` : 'All Restaurants'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {pagination?.totalItems || 0} restaurant{pagination?.totalItems !== 1 ? 's' : ''} found
            {hasLocation && sortBy === 'nearest' && (
              <span className="ml-2 text-primary font-medium">
                • Sorted by distance
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label htmlFor="sort-select" className="text-sm text-gray-600 font-medium">
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm cursor-pointer focus:border-primary focus:outline-none w-full sm:w-auto"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="flex items-center justify-center min-h-96 text-center">
          <div>
            <h3 className="text-xl sm:text-2xl text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">No restaurants available for the selected category.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant._id} 
                restaurant={restaurant}
              />
            ))}
          </div>
          
          {/* Pagination Component */}
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={handlePageChange}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.limit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantList;
