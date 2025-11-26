import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { dealsAPI } from '../utils/api';
import DealCard from '../components/deals/DealCard';
import Pagination from '../components/deals/Pagination';
import AutoOpener from '../components/common/AutoOpener';
import DealModal from '../components/deals/DealModal';
import QRCodeModal from '../components/deals/QRCodeModal';
import { toast } from '../utils/toast';
import Header from '../components/layout/Header';
import SearchInput from '../components/ui/SearchInput';
import { Package, Flame, SlidersHorizontal, X, Tag, DollarSign, Percent, Sparkles, TrendingUp, TrendingDown, Clock, Plus, Star, Navigation, ChevronDown, Gift } from 'lucide-react';
import { useReservation } from '../hooks/useReservation';
import { categoriesAPI, dealCategoriesAPI } from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';
import { useGeolocation } from '../hooks/useGeolocation';
import CategoryDealsSection from '../components/deals/CategoryDealsSection';
import DealTypeSection from '../components/deals/DealTypeSection';
// import Slider from "rc-slider";
// import "rc-slider/assets/index.css";

const DealsPage2 = () => {
  const { t } = useTranslation();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_deals: 0,
    has_next: false,
    has_prev: false
  });
  const [filters, setFilters] = useState({
    deal_type: '',
    min_price: '',
    max_price: '',
    min_discount: '',
    max_discount: '',
    sort_by: 'newest',
    category_id: '',
    company_name: '',
    text_search: '',
    tags: [],
    page: 1,
    limit: 12
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0,
    filters.max_price || 500
  ]);
  const [discountRange, setDiscountRange] = useState([
    filters.min_discount || 0,
    filters.max_discount || 100
  ]);
  const [priceMinInput, setPriceMinInput] = useState(filters.min_price || 0);
  const [priceMaxInput, setPriceMaxInput] = useState(filters.max_price || 500);
  const [discountMinInput, setDiscountMinInput] = useState(filters.min_discount || 0);
  const [discountMaxInput, setDiscountMaxInput] = useState(filters.max_discount || 100);
  const [showQRModal, setShowQRModal] = useState(false);
  const [claimData, setClaimData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Text search input state (for debouncing)
  const [textSearchInput, setTextSearchInput] = useState(filters.text_search || '');
  const debouncedTextSearch = useDebounce(textSearchInput, 500);

  // Category states
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Store all categories for dropdown
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Tags states
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Deal Categories states (for category sections)
  const [dealCategories, setDealCategories] = useState([]);
  const [loadingDealCategories, setLoadingDealCategories] = useState(false);

  // Debounced values for input changes (currently disabled)
  // const debouncedPriceMin = useDebounce(priceMinInput, 500);
  // const debouncedPriceMax = useDebounce(priceMaxInput, 500);
  // const debouncedDiscountMin = useDebounce(discountMinInput, 500);
  // const debouncedDiscountMax = useDebounce(discountMaxInput, 500);

  // Track if component has mounted to prevent initial debounced updates (currently disabled)
  // const [hasMounted, setHasMounted] = useState(false);

  // Use the generalized reservation hook
  const { autoOpenId, clearAutoOpen } = useReservation('deal', '/deals-2');

  // Get user location for distance-based sorting
  const { location: userLocation, fetchLocation } = useGeolocation(false);

  // Fetch location on component mount
  useEffect(() => {
    fetchLocation().catch(err => {
      console.log('Location not available:', err.message);
    });
  }, [fetchLocation]);

  // Update filters when debounced text search changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      text_search: debouncedTextSearch.trim(),
      page: 1
    }));
  }, [debouncedTextSearch]);

  // Load tags when filters are opened
  useEffect(() => {
    if (showFilters && availableTags.length === 0) {
      setLoadingTags(true);
      dealsAPI.getAllTags()
        .then(response => {
          if (response?.success && response?.data && Array.isArray(response.data)) {
            setAvailableTags(response.data);
          } else if (Array.isArray(response)) {
            setAvailableTags(response);
          }
          setLoadingTags(false);
        })
        .catch(err => {
          console.error('Error fetching tags:', err);
          setLoadingTags(false);
        });
    }
  }, [showFilters, availableTags.length]);

  // Load all categories on mount
  useEffect(() => {
    const loadAllCategories = async () => {
      setCategoriesLoading(true);
      try {
        // Load all categories
        const response = await categoriesAPI.getCategories({
          limit: 999999,
          is_active: true
        });

        // Handle different response structures
        let loadedCategories = [];
        if (Array.isArray(response)) {
          loadedCategories = response;
        } else if (response?.data && Array.isArray(response.data)) {
          loadedCategories = response.data;
        } else if (response?.success && response?.data && Array.isArray(response.data)) {
          loadedCategories = response.data;
        }

        console.log('Full API response:', response);
        console.log('Loaded categories for dropdown:', loadedCategories);
        console.log('Categories count:', loadedCategories.length);

        // Set all categories for dropdown - ensure it's an array
        if (Array.isArray(loadedCategories) && loadedCategories.length > 0) {
          setAllCategories(loadedCategories);

          // Show first 6-8 categories as pill buttons
          const initialCategories = loadedCategories.slice(0, 8);
          setCategories(initialCategories);
        } else {
          console.warn('No categories loaded or invalid format:', loadedCategories);
          setAllCategories([]);
          setCategories([]);
        }
        setTotalCategoriesCount(loadedCategories.length);
        setShowAllCategories(true);
      } catch (err) {
        console.error('Error loading categories:', err);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadAllCategories();
  }, []);

  // Load deal categories for category sections
  useEffect(() => {
    const loadDealCategories = async () => {
      setLoadingDealCategories(true);
      try {
        const response = await dealCategoriesAPI.getActiveDealCategories({
          show_category: true
        });
        const loadedCategories = response?.data || response || [];
        // Sort by sort_order if available
        const sortedCategories = loadedCategories.sort((a, b) => {
          const orderA = a.sort_order || 999;
          const orderB = b.sort_order || 999;
          return orderA - orderB;
        });
        setDealCategories(sortedCategories);
      } catch (err) {
        console.error('Error loading deal categories:', err);
        toast.error('Failed to load deal categories');
        setDealCategories([]);
      } finally {
        setLoadingDealCategories(false);
      }
    };

    loadDealCategories();
  }, []);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      category_id: category._id,
      page: 1
    }));
  };

  // Handle category clear
  const handleCategoryClear = () => {
    setSelectedCategory(null);
    setFilters(prev => ({
      ...prev,
      category_id: '',
      page: 1
    }));
  };

  // Search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Search query:', query);
    // Update filters to trigger API call with search
    setFilters(prev => ({
      ...prev,
      text_search: query.trim(),
      page: 1
    }));
  };


  const dealTypes = [
    { value: "", label: t("deals.allDeals"), icon: Tag },
    { value: "combo", label: t("deals.combo"), icon: Tag },
    { value: "percentage", label: t("deals.discount"), icon: Percent },
    { value: "fixed_amount", label: t("deals.discount"), icon: DollarSign }
  ];

  const sortOptions = [
    { value: "newest", label: t("deals.newest"), icon: Sparkles },
    { value: "price_asc", label: t("deals.priceLow"), icon: TrendingUp },
    { value: "price_desc", label: t("deals.priceHigh"), icon: TrendingDown },
    { value: "discount_desc", label: t("deals.discountHigh"), icon: Sparkles },
    { value: "expiry_asc", label: t("deals.newest"), icon: Clock },
    { value: "recommended", label: t("deals.recommended"), icon: Star },
    { value: "nearest", label: t("deals.nearest"), icon: Navigation }
  ];

  // (Filters UI will render inline under section header)

  const loadDeals = useCallback(async () => {
    console.log('🔍 loadDeals called with filters:', filters);
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        // Skip empty values and arrays
        if (value === '' || value === null || value === undefined) {
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

      // Add user location if available (needed for nearest/recommended sorting)
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        queryParams.append('lat', userLocation.latitude.toString());
        queryParams.append('lng', userLocation.longitude.toString());
        console.log('📍 Sending location to backend:', {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          sort_by: filters.sort_by
        });
      }

      const response = await dealsAPI.getActiveDeals(queryParams.toString());

      if (response?.success && response?.data) {
        // Handle both old format (array) and new format (object with pagination)
        if (Array.isArray(response.data)) {
          setDeals(response.data);
          setPagination({
            current_page: 1,
            total_pages: 1,
            total_deals: response.data.length,
            has_next: false,
            has_prev: false
          });
        } else {
          setDeals(response.data.deals || []);
          setPagination(response.data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_deals: 0,
            has_next: false,
            has_prev: false
          });
        }
      } else {
        setDeals([]);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_deals: 0,
          has_next: false,
          has_prev: false
        });
      }
    } catch (err) {
      const message = err?.message || 'Failed to load deals';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters, userLocation]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  // Set mounted flag after initial load (currently disabled)
  // useEffect(() => {
  //   setHasMounted(true);
  // }, []);

  // Disable debounced input changes for now - use only blur handlers
  // useEffect(() => {
  //   if (!hasMounted) return;

  //   const min = Math.max(0, debouncedPriceMin);
  //   const max = Math.max(min, debouncedPriceMax);

  //   setFilters(prev => ({
  //     ...prev,
  //     min_price: min,
  //     max_price: max,
  //     page: 1
  //   }));
  // }, [debouncedPriceMin, debouncedPriceMax, hasMounted]);

  // useEffect(() => {
  //   if (!hasMounted) return;

  //   const min = Math.max(0, debouncedDiscountMin);
  //   const max = Math.max(min, Math.min(100, debouncedDiscountMax));

  //   setFilters(prev => ({
  //     ...prev,
  //     min_discount: min,
  //     max_discount: max,
  //     page: 1
  //   }));
  // }, [debouncedDiscountMin, debouncedDiscountMax, hasMounted]);


  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleDealClaimed = useCallback((data) => {
    setClaimData(data);
    setShowQRModal(true);
  }, []);

  const handleDealTypeChange = useCallback((type) => {
    setFilters(prev => ({
      ...prev,
      deal_type: type,
      page: 1
    }));
  }, []);

  const handleSortChange = useCallback((sort) => {
    setFilters(prev => ({
      ...prev,
      sort_by: sort,
      page: 1
    }));
  }, []);

  // Removed old slider handlers - now using HTML range inputs

  const handlePriceInputChange = useCallback((type, value) => {
    console.log('🔍 Price input change (NO FILTER UPDATE):', type, value);
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setPriceMinInput(numValue);
      if (numValue <= priceMaxInput) {
        setPriceRange([numValue, priceMaxInput]);
      }
    } else {
      setPriceMaxInput(numValue);
      if (numValue >= priceMinInput) {
        setPriceRange([priceMinInput, numValue]);
      }
    }
    // NO filter update here - only on blur or slider complete
  }, [priceMaxInput, priceMinInput]);

  const handlePriceInputBlur = useCallback(() => {
    console.log('🔍 Price input blur triggered');
    const min = Math.max(0, priceMinInput);
    const max = Math.max(min, priceMaxInput);
    setPriceRange([min, max]);
    setPriceMinInput(min);
    setPriceMaxInput(max);

    // Update filters immediately on blur
    console.log('🔍 Updating price filters:', { min, max });
    setFilters(prev => ({
      ...prev,
      min_price: min,
      max_price: max,
      page: 1
    }));
  }, [priceMinInput, priceMaxInput]);

  // Removed old discount slider handlers - now using HTML range inputs

  const handleDiscountInputChange = useCallback((type, value) => {
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setDiscountMinInput(numValue);
      if (numValue <= discountMaxInput) {
        setDiscountRange([numValue, discountMaxInput]);
      }
    } else {
      setDiscountMaxInput(numValue);
      if (numValue >= discountMinInput) {
        setDiscountRange([discountMinInput, numValue]);
      }
    }
    // NO filter update here - only on blur or slider complete
  }, [discountMinInput, discountMaxInput]);

  const handleDiscountInputBlur = useCallback(() => {
    const min = Math.max(0, discountMinInput);
    const max = Math.max(min, Math.min(100, discountMaxInput));
    setDiscountRange([min, max]);
    setDiscountMinInput(min);
    setDiscountMaxInput(max);

    // Update filters immediately on blur
    setFilters(prev => ({
      ...prev,
      min_discount: min,
      max_discount: max,
      page: 1
    }));
  }, [discountMinInput, discountMaxInput]);

  const handleClearFilters = useCallback(() => {
    setPriceRange([0, 500]);
    setDiscountRange([0, 100]);
    setPriceMinInput(0);
    setPriceMaxInput(500);
    setDiscountMinInput(0);
    setDiscountMaxInput(100);
    setShowFilters(false);
    setSelectedCategory(null);
    setSearchQuery('');
    setTextSearchInput('');
    setFilters(prev => ({
      ...prev,
      deal_type: '',
      min_price: '',
      max_price: '',
      min_discount: '',
      max_discount: '',
      sort_by: 'newest',
      category_id: '',
      company_name: '',
      text_search: '',
      tags: [],
      page: 1
    }));
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <div
          className="relative text-white py-12 px-4 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://media.istockphoto.com/id/922783734/photo/assorted-indian-recipes-food-various.jpg?s=612x612&w=0&k=20&c=p8DepvymWfC5j7c6En2UsQ6sUM794SQMwceeBW3yQ9M=)'
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800"></div>

          {/* Content */}
          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {t("deals.heroTitle")}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-100">
              {t("deals.heroSubtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("deals.unableToLoadDeals")}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadDeals}
              className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              {t("deals.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Hero Section */}
      <div
        className="relative text-white py-12 px-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://media.istockphoto.com/id/922783734/photo/assorted-indian-recipes-food-various.jpg?s=612x612&w=0&k=20&c=p8DepvymWfC5j7c6En2UsQ6sUM794SQMwceeBW3yQ9M=)'
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-900/90"></div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-4">
            {t("deals.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl mb-4 text-primary-100">
            {t("deals.heroSubtitle")}
          </p>

          {/* Search Input */}
          <div className="">
            <SearchInput
              placeholder={t('common.searchPlaceholderGeneral')}
              onSearch={handleSearch}
              className="max-w-lg"
            />
          </div>
        </div>
      </div>

      {/* Browse by Category Section - With Filters */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            {/* Center: Title */}
            <h3 className="text-2xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">{t("deals.browseByCuisine")}</h3>


            {/* Right: Filter Button */}
            <div className=" ml-auto mr-4 flex items-center gap-2 text-red-600">
              <Clock className="w-5 h-5 md:block hidden" />
              <span className="text-sm font-semibold">{t('common.limitedTime')}</span>
            </div>
            <button
              onClick={toggleFilters}
              className=" text-white bg-primary rounded-lg flex items-center gap-2 md:px-3 md:py-2 px-2 py-1 hover:bg-primary-600 transition-colors"
            >
              {showFilters ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
              <span className="text-sm font-medium md:block hidden">{showFilters ? t("deals.closeFilters") : t("deals.viewFilters")}</span>
            </button>
          </div>

          {/* Category Dropdown and Pill Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
            {/* Dropdown - First item before pills */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors min-w-[200px]"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {selectedCategory ? selectedCategory.name : t("deals.allCuisine")}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCategoryDropdown(false)}
                  ></div>
                  <div className="absolute top-full left-0 right-0 min-w-[200px] mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        handleCategoryClear();
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                    >
                      <Tag className="w-4 h-4" />
                      <span>{t("deals.allCuisine")}</span>
                    </button>
                    {allCategories.length > 0 ? (
                      allCategories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => {
                            handleCategorySelect(category);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 ${selectedCategory?._id === category._id ? 'bg-primary/10 text-primary font-medium' : ''
                            }`}
                        >
                          <Tag className="w-4 h-4" />
                          <span>{category.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        {categoriesLoading ? t("deals.loadingCategories") : t("deals.noCategoriesAvailable")}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Category Pill Buttons - Show first 6-8 */}
            {categories.slice(0, 8).map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory?._id === category._id
                    ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-md border border-transparent'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
              >
                <span>{category.name}</span>
              </button>
            ))}

            {/* Clear Category Button */}
            {selectedCategory && (
              <button
                onClick={handleCategoryClear}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              >
                <X className="w-4 h-4" />
                <span>{t("common.clear")}</span>
              </button>
            )}
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="rounded-lg mb-4 border border-gray-200 p-4 bg-gray-50">
              {/* Text Search - First */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("deals.search")}</label>
                <p className="text-xs text-gray-500 mb-2">{t("deals.searchPlaceholder")}</p>
                <input
                  type="text"
                  value={textSearchInput}
                  onChange={(e) => setTextSearchInput(e.target.value)}
                  placeholder={t("deals.searchPlaceholder")}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              {/* Sort By - Second */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("deals.sortBy")}</label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filters.sort_by === option.value
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deal Type - Third */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("deals.dealType")}</label>
                <div className="flex flex-wrap gap-2">
                  {dealTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleDealTypeChange(type.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filters.deal_type === type.value
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags - Fourth */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("deals.specialOffers")}</label>
                {loadingTags ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-500">{t("deals.loadingTags")}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = filters.tags && filters.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            const currentTags = filters.tags || [];
                            if (isSelected) {
                              setFilters(prev => ({
                                ...prev,
                                tags: currentTags.filter(t => t !== tag),
                                page: 1
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                tags: [...currentTags, tag],
                                page: 1
                              }));
                            }
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isSelected
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters - Price and Discount Ranges */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t("deals.advancedFilters")}</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      {t("deals.priceRange")}
                    </label>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      RM {priceRange[0]} - RM {priceRange[1]}
                    </span>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">{t("deals.min")} (RM)</label>
                      <input
                        type="number"
                        value={priceMinInput}
                        onChange={(e) => handlePriceInputChange('min', e.target.value)}
                        onBlur={handlePriceInputBlur}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">{t("deals.max")} (RM)</label>
                      <input
                        type="number"
                        value={priceMaxInput}
                        onChange={(e) => handlePriceInputChange('max', e.target.value)}
                        onBlur={handlePriceInputBlur}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="1000"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Dual Handle Range Slider */}
                  <div className="relative">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Min: {priceRange[0]}</span>
                      <span>Max: {priceRange[1]}</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                      {/* Track */}
                      <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>

                      {/* Active Range */}
                      <div
                        className="absolute h-2 bg-primary rounded-lg"
                        style={{
                          left: `${(priceRange[0] / Math.max(500, priceMaxInput + 100)) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / Math.max(500, priceMaxInput + 100)) * 100}%`
                        }}
                      ></div>

                      {/* Min Handle */}
                      <div
                        className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer z-30"
                        style={{
                          left: `calc(${(priceRange[0] / Math.max(500, priceMaxInput + 100)) * 100}% - 8px)`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startValue = priceRange[0];
                          const currentMax = priceRange[1];
                          const maxValue = Math.max(500, priceMaxInput + 100);

                          let finalMin = startValue;
                          let finalMax = currentMax;

                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaValue = Math.round((deltaX / e.target.closest('.relative').offsetWidth) * maxValue);
                            const newValue = Math.max(0, Math.min(startValue + deltaValue, currentMax - 1));

                            finalMin = newValue;
                            setPriceRange([newValue, currentMax]);
                            setPriceMinInput(newValue);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                            setFilters(prev => ({
                              ...prev,
                              min_price: finalMin,
                              max_price: finalMax,
                              page: 1
                            }));
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      ></div>

                      {/* Max Handle */}
                      <div
                        className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer z-30"
                        style={{
                          left: `calc(${(priceRange[1] / Math.max(500, priceMaxInput + 100)) * 100}% - 8px)`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startValue = priceRange[1];
                          const currentMin = priceRange[0];
                          const maxValue = Math.max(500, priceMaxInput + 100);

                          let finalMin = currentMin;
                          let finalMax = startValue;

                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaValue = Math.round((deltaX / e.target.closest('.relative').offsetWidth) * maxValue);
                            const newValue = Math.max(currentMin + 1, Math.min(startValue + deltaValue, maxValue));

                            finalMax = newValue;
                            setPriceRange([currentMin, newValue]);
                            setPriceMaxInput(newValue);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                            setFilters(prev => ({
                              ...prev,
                              min_price: finalMin,
                              max_price: finalMax,
                              page: 1
                            }));
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Discount Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      {t("deals.discountRange")}
                    </label>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {discountRange[0]}% - {discountRange[1]}%
                    </span>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">{t("deals.min")} (%)</label>
                      <input
                        type="number"
                        value={discountMinInput}
                        onChange={(e) => handleDiscountInputChange('min', e.target.value)}
                        onBlur={handleDiscountInputBlur}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">{t("deals.max")} (%)</label>
                      <input
                        type="number"
                        value={discountMaxInput}
                        onChange={(e) => handleDiscountInputChange('max', e.target.value)}
                        onBlur={handleDiscountInputBlur}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="100"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Dual Handle Range Slider */}
                  <div className="relative">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Min: {discountRange[0]}%</span>
                      <span>Max: {discountRange[1]}%</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                      {/* Track */}
                      <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>

                      {/* Active Range */}
                      <div
                        className="absolute h-2 bg-primary rounded-lg"
                        style={{
                          left: `${discountRange[0]}%`,
                          width: `${discountRange[1] - discountRange[0]}%`
                        }}
                      ></div>

                      {/* Min Handle */}
                      <div
                        className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer z-30"
                        style={{
                          left: `calc(${discountRange[0]}% - 8px)`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startValue = discountRange[0];
                          const currentMax = discountRange[1];

                          let finalMin = startValue;
                          let finalMax = currentMax;

                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaValue = Math.round((deltaX / e.target.closest('.relative').offsetWidth) * 100);
                            const newValue = Math.max(0, Math.min(startValue + deltaValue, currentMax - 1));

                            finalMin = newValue;
                            setDiscountRange([newValue, currentMax]);
                            setDiscountMinInput(newValue);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                            setFilters(prev => ({
                              ...prev,
                              min_discount: finalMin,
                              max_discount: finalMax,
                              page: 1
                            }));
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      ></div>

                      {/* Max Handle */}
                      <div
                        className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer z-30"
                        style={{
                          left: `calc(${discountRange[1]}% - 8px)`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startValue = discountRange[1];
                          const currentMin = discountRange[0];

                          let finalMin = currentMin;
                          let finalMax = startValue;

                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaValue = Math.round((deltaX / e.target.closest('.relative').offsetWidth) * 100);
                            const newValue = Math.max(currentMin + 1, Math.min(startValue + deltaValue, 100));

                            finalMax = newValue;
                            setDiscountRange([currentMin, newValue]);
                            setDiscountMaxInput(newValue);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                            setFilters(prev => ({
                              ...prev,
                              min_discount: finalMin,
                              max_discount: finalMax,
                              page: 1
                            }));
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 md:px-3 md:py-2 px-2 py-1 text-gray-700 hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm font-medium md:block hidden">{t("common.clear")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Deals Sections - After Browse by Category */}
      {!loadingDealCategories && dealCategories.length > 0 && (
        <div className="bg-gray-50">
          {dealCategories.map((dealCategory) => (
            <CategoryDealsSection
              key={dealCategory._id}
              category={dealCategory}
              userLocation={userLocation}
              globalFilters={filters}
            />
          ))}
        </div>
      )}

      {/* Hot Deals Today Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-2 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">{t("deals.hotDealsToday")}</h2>
          </div>
        </div>
      </div>

      {/* Deal Type Sections */}
      <div className="bg-gray-50">
        <DealTypeSection
          dealType="percentage"
          icon={Percent}
          title={t("deals.percentageDeals")}
          description={t("deals.percentageDealsDesc")}
          userLocation={userLocation}
        />
        <DealTypeSection
          dealType="fixed"
          icon={DollarSign}
          title={t("deals.fixedDeals")}
          description={t("deals.fixedDealsDesc")}
          userLocation={userLocation}
        />
        <DealTypeSection
          dealType="combo"
          icon={Gift}
          title={t("deals.comboDeals")}
          description={t("deals.comboDealsDesc")}
          userLocation={userLocation}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">

        {/* Results Count */}
        <div className="mb-6">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-gray-600">{t("deals.loadingDeals")}</p>
            </div>
          ) : (
            <p className="text-gray-600">
              {t("deals.showingDeals", { count: pagination.total_deals })}
            </p>
          )}
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-56"></div>
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
                  </div>
                  <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t("deals.noDealsFound")}</h2>
            <p className="text-gray-600 text-sm">{t("deals.tryAdjustingFilters")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {deals.map((deal, index) => (
                <div
                  key={deal._id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <DealCard deal={deal} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              hasNext={pagination.has_next}
              hasPrev={pagination.has_prev}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <div className="h-16"></div>

      {/* Auto-open deal modal */}
      <AutoOpener
        items={deals}
        itemId={autoOpenId}
        onClose={clearAutoOpen}
        ModalComponent={DealModal}
        itemKey="_id"
        itemPropName="deal"
        additionalProps={{ onDealClaimed: handleDealClaimed }}
        fetchItemById={async (dealId) => {
          try {
            const response = await dealsAPI.getDealById(dealId);
            return response?.success ? response.data : null;
          } catch (error) {
            console.error('Error fetching deal by ID:', error);
            return null;
          }
        }}
      />

      {/* QR Code Modal */}
      {showQRModal && claimData && (
        <QRCodeModal
          claimData={claimData}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

export default DealsPage2;
