import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import DealCard from './DealCard';
import { dealsAPI } from '../../utils/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom styles for category deals swiper - removed to avoid conflicts
const swiperStyles = ``;

const CategoryDealsSection = ({ category, userLocation, globalFilters = {} }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    const loadCategoryDeals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('deal_category_id', category._id);
        queryParams.append('limit', '10'); // Show first 10 deals
        
        // Apply global filters (except page and limit which are specific)
        Object.entries(globalFilters).forEach(([key, value]) => {
          // Skip empty values, arrays, page, and limit
          // Note: category_id is included to filter by restaurant category
          if (key === 'page' || key === 'limit' || value === '' || value === null || value === undefined) {
            return;
          }
          
          // Handle tags array - join with comma
          if (key === 'tags' && Array.isArray(value) && value.length > 0) {
            queryParams.append('tags', value.join(','));
            return;
          }
          
          // Skip empty arrays
          if (Array.isArray(value) && value.length === 0) {
            return;
          }
          
          // Add other non-empty values
          queryParams.append(key, value);
        });

        // Add user location if available
        if (userLocation && userLocation.latitude && userLocation.longitude) {
          queryParams.append('lat', userLocation.latitude.toString());
          queryParams.append('lng', userLocation.longitude.toString());
        }

        const response = await dealsAPI.getActiveDeals(queryParams.toString());

        if (response?.success && response?.data) {
          // Handle both old format (array) and new format (object with deals)
          if (Array.isArray(response.data)) {
            setDeals(response.data);
          } else {
            setDeals(response.data.deals || []);
          }
        } else {
          setDeals([]);
        }
      } catch (err) {
        console.error(`Error loading deals for category ${category.name}:`, err);
        setError(err.message);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    if (category?._id) {
      loadCategoryDeals();
    }
  }, [category, userLocation, globalFilters]);

  // Equalize card heights after deals load
  useEffect(() => {
    if (deals.length > 0 && swiperRef.current) {
      const equalizeHeights = () => {
        const swiper = swiperRef.current;
        if (!swiper) return;

        // Get all visible slides (not duplicates)
        const slides = Array.from(swiper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));
        if (slides.length === 0) return;

        // Reset heights first to get natural height
        slides.forEach((slide) => {
          const card = slide.querySelector('.group');
          if (card) {
            card.style.height = 'auto';
            card.style.minHeight = 'auto';
          }
        });

        // Force a reflow
        void swiper.offsetHeight;

        // Calculate max height from all visible slides
        let maxHeight = 0;
        slides.forEach((slide) => {
          const card = slide.querySelector('.group');
          if (card) {
            const rect = card.getBoundingClientRect();
            const height = rect.height;
            if (height > maxHeight) {
              maxHeight = height;
            }
          }
        });

        // Apply max height to all cards
        if (maxHeight > 0) {
          slides.forEach((slide) => {
            const card = slide.querySelector('.group');
            if (card) {
              card.style.height = `${maxHeight}px`;
              card.style.minHeight = `${maxHeight}px`;
            }
          });
        }
      };

      // Wait for DOM and images to load
      const timer1 = setTimeout(equalizeHeights, 100);
      const timer2 = setTimeout(equalizeHeights, 300);
      const timer3 = setTimeout(equalizeHeights, 800);
      
      // Handle window resize
      const handleResize = () => {
        setTimeout(equalizeHeights, 100);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [deals]);

  // Don't render if no deals or loading failed
  if (loading) {
    return (
      <div className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !deals || deals.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <div className="bg-white py-8">
      <style>{swiperStyles}</style>
      <div className="max-w-6xl mx-auto px-4">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {category.name}
          </h2>
        </div>

        {/* Swiper Carousel */}
        <div className="relative pb-4">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            autoHeight={false}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = navigationPrevRef.current;
              swiper.params.navigation.nextEl = navigationNextRef.current;
            }}
            onSlideChange={() => {
              // Recalculate heights after slide change
              setTimeout(() => {
                const swiper = swiperRef.current;
                if (!swiper) return;

                const slides = Array.from(swiper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));
                if (slides.length === 0) return;
                
                // Reset heights
                slides.forEach((slide) => {
                  const card = slide.querySelector('.group');
                  if (card) {
                    card.style.height = 'auto';
                    card.style.minHeight = 'auto';
                  }
                });
                
                // Force reflow
                void swiper.offsetHeight;
                
                // Calculate max height from all visible slides
                let maxHeight = 0;
                slides.forEach((slide) => {
                  const card = slide.querySelector('.group');
                  if (card) {
                    const rect = card.getBoundingClientRect();
                    if (rect.height > maxHeight) {
                      maxHeight = rect.height;
                    }
                  }
                });
                
                // Apply max height
                if (maxHeight > 0) {
                  slides.forEach((slide) => {
                    const card = slide.querySelector('.group');
                    if (card) {
                      card.style.height = `${maxHeight}px`;
                      card.style.minHeight = `${maxHeight}px`;
                    }
                  });
                }
              }, 150);
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={deals.length > 3}
            className="category-deals-swiper"
            style={{
              paddingBottom: '20px',
              paddingLeft: '10px',
              paddingRight: '10px',
            }}
          >
            {deals.map((deal) => (
              <SwiperSlide key={deal._id} style={{ height: '100%', display: 'flex' }}>
                <div className="h-full w-full flex" style={{ minHeight: '100%' }}>
                  <DealCard deal={deal} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {deals.length > 3 && (
            <>
              <button
                ref={navigationPrevRef}
                className="absolute -left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center"
                aria-label="Previous deals"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                ref={navigationNextRef}
                className="absolute -right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center"
                aria-label="Next deals"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDealsSection;

