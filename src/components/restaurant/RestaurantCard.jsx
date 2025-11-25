import React, { useState, useMemo } from 'react';
import { Heart, ArrowUpRight, MapPin } from 'lucide-react';
// import { Clock, DollarSign, Truck } from 'lucide-react'; // TODO: Uncomment when backend provides delivery data
import { formatDistance } from '../../utils/geolocation';
import restaurantDefaultImage from '../../assets/restaurent-default.png';

const RestaurantCard = ({ restaurant }) => {
  // Extract data from API structure
  const businessData = restaurant.business_id || {};
  const companyName = restaurant.business_id?.company_name || 'Restaurant';
  const frontendUrl = businessData.business_group?.business_group_frontend_url || null;
  const hasValidUrl = frontendUrl && frontendUrl !== '#' && frontendUrl.trim() !== '';
  const groupName = restaurant.business_id?.business_group?.name || '';
  
  // Get the product image URL from API or use default
  const productImageUrl = businessData.product_image_url || businessData.product_url;
  const displayImage = productImageUrl || restaurantDefaultImage;
  
  // Generate stable values using useMemo (only once per restaurant)
  const cuisine = useMemo(() => {
    return restaurant.jomfood_categories?.map(category => category.name).join(', ') || 'Uncategorized';
  }, [restaurant.jomfood_categories]);

  const [isFavorite] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFavoriteToggle = () => {
    // setIsFavorite(!isFavorite);
  };

  const handleImageError = (e) => {
    // Set default image on error
    if (!imageError) {
      e.target.src = restaurantDefaultImage;
      setImageError(true);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-light hover:shadow-medium transition-shadow mb-4 overflow-hidden">
      {/* Restaurant Image - Full Left Side */}
      <div className="relative w-full sm:w-44 h-48 sm:h-auto flex-shrink-0 sm:self-stretch">
        <img
          src={displayImage}
          alt={companyName}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        <button
          className={`absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-light ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-400 hover:bg-white'
          }`}
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      {/* Restaurant Details */}
      <div className="flex-1 p-3 sm:p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 leading-tight">
          {groupName} - {companyName}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{cuisine}</p>
        
        <div className="space-y-1.5 sm:space-y-2">
          {/* Show distance if backend provided it (when user location is enabled) */}
          {restaurant.distance !== undefined && restaurant.distance !== null && restaurant.distance !== Infinity && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-primary font-medium">
                {formatDistance(restaurant.distance)} away
              </span>
            </div>
          )}
          
          {/* TODO: Uncomment when backend provides real data */}
          {/* <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              Earliest Delivery: {deliveryTime}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              Min. {minOrder}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {deliveryFee}
            </span>
          </div> */}
        </div>
      </div>
      
      {/* Action Buttons - Right Side / Bottom on Mobile */}
      <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 p-3 sm:p-4 sm:min-w-32 border-t sm:border-t-0 sm:border-l border-gray-100">
        {hasValidUrl ? (
          <a 
            href={frontendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none bg-primary hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <span>Visit Shop</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />
          </a>
        ) : (
          <div className="relative flex-1 sm:flex-none">
            <button
              disabled
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-full bg-gray-300 text-gray-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <span>Visit Shop</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
                Shop not available yet
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        )}
        <a 
          href="#"
          className="flex-1 sm:flex-none bg-black hover:bg-gray-800 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-colors text-center"
        >
          View Menu
        </a>
      </div>
    </div>
  );
};

export default RestaurantCard;
