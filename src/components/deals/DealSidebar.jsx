import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Tag, 
  DollarSign, 
  Percent,
  X,
  Filter,
  Clock
} from "lucide-react";

const DealSidebar = ({ filters, onFiltersChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const dealTypes = [
    { value: "", label: "All Deals", icon: Tag },
    { value: "combo", label: "Combo", icon: Tag },
    { value: "percentage", label: "Percent Off", icon: Percent },
    { value: "fixed_amount", label: "Fixed", icon: DollarSign }
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: Sparkles },
    { value: "price_asc", label: "Price: Low to High", icon: TrendingUp },
    { value: "price_desc", label: "Price: High to Low", icon: TrendingDown },
    { value: "discount_desc", label: "Best Discount", icon: Sparkles },
    { value: "expiry_asc", label: "Expiring Soon", icon: Clock }
  ];

  const handleDealTypeChange = (type) => {
    onFiltersChange({
      ...filters,
      deal_type: type
    });
  };

  const handleSortChange = (sort) => {
    onFiltersChange({
      ...filters,
      sort_by: sort
    });
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
    setPriceMinInput(values[0]);
    setPriceMaxInput(values[1]);
  };

  const handlePriceRangeComplete = (values) => {
    onFiltersChange({
      ...filters,
      min_price: values[0],
      max_price: values[1]
    });
  };

  const handlePriceInputChange = (type, value) => {
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
  };

  const handlePriceInputBlur = () => {
    const min = Math.max(0, priceMinInput);
    const max = Math.max(min, priceMaxInput);
    setPriceRange([min, max]);
    setPriceMinInput(min);
    setPriceMaxInput(max);
    onFiltersChange({
      ...filters,
      min_price: min,
      max_price: max
    });
  };

  const handleDiscountRangeChange = (values) => {
    setDiscountRange(values);
    setDiscountMinInput(values[0]);
    setDiscountMaxInput(values[1]);
  };

  const handleDiscountRangeComplete = (values) => {
    onFiltersChange({
      ...filters,
      min_discount: values[0],
      max_discount: values[1]
    });
  };

  const handleDiscountInputChange = (type, value) => {
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
  };

  const handleDiscountInputBlur = () => {
    const min = Math.max(0, discountMinInput);
    const max = Math.max(min, Math.min(100, discountMaxInput));
    setDiscountRange([min, max]);
    setDiscountMinInput(min);
    setDiscountMaxInput(max);
    onFiltersChange({
      ...filters,
      min_discount: min,
      max_discount: max
    });
  };

  const handleClearFilters = () => {
    setPriceRange([0, 500]);
    setDiscountRange([0, 100]);
    setPriceMinInput(0);
    setPriceMaxInput(500);
    setDiscountMinInput(0);
    setDiscountMaxInput(100);
    onFiltersChange({
      deal_type: '',
      min_price: '',
      max_price: '',
      min_discount: '',
      max_discount: '',
      sort_by: 'newest',
      page: 1,
      limit: filters.limit
    });
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 lg:h-[calc(100vh-66px)] overflow-y-auto lg:sticky lg:top-16 z-10 order-1 lg:order-1">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Deal Type Filter */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Deal Type</h3>
          <div className="space-y-2">
            {dealTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleDealTypeChange(type.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.deal_type === type.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sort By</h3>
          <div className="space-y-2">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.sort_by === option.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
          </div>
          {showAdvanced ? (
            <X className="w-4 h-4" />
          ) : (
            <span className="text-xs text-gray-500">Click to expand</span>
          )}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 animate-fadeIn">
            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Price Range
                </label>
                <span className="text-sm font-medium text-primary">
                  RM {priceRange[0]} - RM {priceRange[1]}
                </span>
              </div>
              
              {/* Custom Input Fields */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min (RM)</label>
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
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max (RM)</label>
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

              <Slider
                range
                min={0}
                max={Math.max(500, priceMaxInput + 100)}
                value={priceRange}
                onChange={handlePriceRangeChange}
                onChangeComplete={handlePriceRangeComplete}
                trackStyle={[{ backgroundColor: '#C40C0C', height: 6 }]}
                handleStyle={[
                  { 
                    backgroundColor: '#C40C0C', 
                    borderColor: '#C40C0C',
                    width: 20,
                    height: 20,
                    marginTop: -7
                  },
                  { 
                    backgroundColor: '#C40C0C', 
                    borderColor: '#C40C0C',
                    width: 20,
                    height: 20,
                    marginTop: -7
                  }
                ]}
                railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
              />
            </div>

            {/* Discount Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Discount Range
                </label>
                <span className="text-sm font-medium text-primary">
                  {discountRange[0]}% - {discountRange[1]}%
                </span>
              </div>
              
              {/* Custom Input Fields */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min (%)</label>
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
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max (%)</label>
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

              <Slider
                range
                min={0}
                max={100}
                value={discountRange}
                onChange={handleDiscountRangeChange}
                onChangeComplete={handleDiscountRangeComplete}
                trackStyle={[{ backgroundColor: '#C40C0C', height: 6 }]}
                handleStyle={[
                  { 
                    backgroundColor: '#C40C0C', 
                    borderColor: '#C40C0C',
                    width: 20,
                    height: 20,
                    marginTop: -7
                  },
                  { 
                    backgroundColor: '#C40C0C', 
                    borderColor: '#C40C0C',
                    width: 20,
                    height: 20,
                    marginTop: -7
                  }
                ]}
                railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DealSidebar;
