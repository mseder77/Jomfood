import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, ChevronDown } from 'lucide-react';

const MobileFilterBar = ({ 
  filters, 
  onFiltersChange, 
  totalDeals,
  isOpen,
  onToggle 
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.deal_type) count++;
    if (filters.min_price || filters.max_price) count++;
    if (filters.min_discount || filters.max_discount) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <>
      {/* Mobile Filter Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="font-medium text-gray-900">
              {t('filters.title')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {t('filters.dealsCount', { count: totalDeals })}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Filter Panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('filters.title')}</h2>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Deal Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('deals.dealType')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "", label: t('deals.allDeals') },
                    { value: "combo", label: t('deals.combo') },
                    { value: "percentage", label: t('deals.discount') },
                    { value: "fixed_amount", label: t('filters.fixedAmount', 'Fixed') }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => onFiltersChange({ ...filters, deal_type: type.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.deal_type === type.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('deals.priceRange')} (RM)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('deals.min')}</label>
                    <input
                      type="number"
                      value={filters.min_price || ''}
                      onChange={(e) => onFiltersChange({ ...filters, min_price: e.target.value || '' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('deals.max')}</label>
                    <input
                      type="number"
                      value={filters.max_price || ''}
                      onChange={(e) => onFiltersChange({ ...filters, max_price: e.target.value || '' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('deals.sortBy')}</h3>
                <div className="space-y-2">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "price_asc", label: "Price: Low to High" },
                    { value: "price_desc", label: "Price: High to Low" },
                    { value: "discount_desc", label: "Best Discount" },
                    { value: "expiry_asc", label: "Expiring Soon" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer py-2">
                      <input
                        type="radio"
                        name="sort_by"
                        value={option.value}
                        checked={filters.sort_by === option.value}
                        onChange={(e) => onFiltersChange({ ...filters, sort_by: e.target.value })}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onFiltersChange({
                      deal_type: '',
                      min_price: '',
                      max_price: '',
                      min_discount: '',
                      max_discount: '',
                      sort_by: 'newest',
                      page: 1,
                      limit: 12
                    });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('filters.clearAll')}
                </button>
                <button
                  onClick={onToggle}
                  className="flex-1 bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('filters.apply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilterBar;
