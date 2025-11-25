import React, { useState, useEffect, useCallback } from 'react';
import { dealsAPI } from '../utils/api';
import DealCard from '../components/deals/DealCard';
import DealSidebar from '../components/deals/DealSidebar';
import MobileFilterBar from '../components/deals/MobileFilterBar';
import Pagination from '../components/deals/Pagination';
import AutoOpener from '../components/common/AutoOpener';
import DealModal from '../components/deals/DealModal';
import QRCodeModal from '../components/deals/QRCodeModal';
import { toast } from '../utils/toast';
import Header from '../components/layout/Header';
import { Package } from 'lucide-react';
import { useReservation } from '../hooks/useReservation';

const DealsPage = () => {
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
    page: 1,
    limit: 12
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [claimData, setClaimData] = useState(null);

  // Use the generalized reservation hook
  const { autoOpenId, clearAutoOpen } = useReservation('deal', '/deals');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });
      
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
  }, [filters]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleFiltersChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    });
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDealClaimed = (data) => {
    setClaimData(data);
    setShowQRModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Mobile Filter Bar */}
        <MobileFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalDeals={pagination.total_deals}
          isOpen={mobileFiltersOpen}
          onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        />
        
        <div className="flex flex-col lg:flex-row">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <DealSidebar 
              filters={filters} 
              onFiltersChange={handleFiltersChange} 
            />
          </div>
          
          <div className="flex-1 p-4 sm:p-6 lg:ml-0 order-2 lg:order-2">
            <div className="mb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Hot Deals Today
              </h1>
              <p className="text-sm text-gray-600">Loading amazing deals for you...</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
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
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Mobile Filter Bar */}
        <MobileFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalDeals={pagination.total_deals}
          isOpen={mobileFiltersOpen}
          onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        />
        
        <div className="flex flex-col lg:flex-row">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <DealSidebar 
              filters={filters} 
              onFiltersChange={handleFiltersChange} 
            />
          </div>
          
          <div className="flex-1 p-4 sm:p-6 lg:ml-0 order-2 lg:order-2">
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load deals</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={loadDeals}
                className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Mobile Filter Bar */}
      <MobileFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalDeals={pagination.total_deals}
        isOpen={mobileFiltersOpen}
        onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      />
      
      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <DealSidebar 
            filters={filters} 
            onFiltersChange={handleFiltersChange} 
          />
        </div>
        
        <div className="flex-1 p-4 sm:p-6 lg:ml-0 order-2 lg:order-2">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Hot Deals Today
            </h1>
            <p className="text-sm text-gray-600">
              {pagination.total_deals > 0 
                ? `${pagination.total_deals} amazing deals waiting for you!`
                : 'Discover incredible food deals near you'
              }
            </p>
          </div>

          {/* Deals Grid */}
          {deals.length === 0 ? (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">No deals found</h2>
              <p className="text-gray-600 text-sm">Try adjusting your filters or check back later for new deals!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn items-stretch">
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
      </div>

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

export default DealsPage;
