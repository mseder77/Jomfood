import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Clock, ChevronLeft, ChevronRight, MapPin, Star, Sparkles, Tag, Package, DollarSign, Percent } from 'lucide-react';
import DealModal from './DealModal';
import QRCodeModal from './QRCodeModal';

const DealCard = ({ deal, disableHoverEffect = false }) => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [claimData, setClaimData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  const formatPrice = (price) => `RM ${price.toFixed(2)}`;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'malay' ? 'ms-MY' : 'en-GB';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDiscountText = () => {
    if (deal.deal_type === 'percentage') {
      return `${deal.discount_percentage}% ${t('deals.offSuffix', 'OFF')}`;
    }
    if (deal.deal_type === 'fixed_amount') {
      return `RM ${deal.discount_amount.toFixed(2)} ${t('deals.offSuffix', 'OFF')}`;
    }
    if (deal.deal_type === 'combo') {
      return t('dealModal.comboDeal');
    }
    return t('dealModal.deal');
  };

  const getDealTypeIcon = () => {
    if (deal.deal_type === 'percentage') {
      return Percent;
    }
    if (deal.deal_type === 'fixed_amount') {
      return DollarSign;
    }
    if (deal.deal_type === 'combo') {
      return Package;
    }
    return Tag;
  };

  const getSavingsAmount = () => {
    return deal.original_total - deal.deal_total;
  };

  // Prioritize deal_image, then product images
  const productImages = deal.deal_items?.map(item => item.product_image).filter(Boolean) || [];
  const allImages = deal.deal_image 
    ? [deal.deal_image, ...productImages]
    : productImages;
  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleDealClaimed = (data) => {
    setClaimData(data);
    setShowQRModal(true);
  };

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!deal.end_date) return null;
      
      const now = new Date().getTime();
      const endDate = new Date(deal.end_date).getTime();
      const difference = endDate - now;
      
      if (difference <= 0) {
        return null; // Deal has expired
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Only show countdown if less than 24 hours remaining
      if (hours < 24) {
        return {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
          totalMs: difference
        };
      }
      
      return null;
    };

    // Calculate immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      // Clear interval if deal has expired
      if (!remaining || remaining.totalMs <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deal.end_date]);

  return (
    <>
      <div 
        className="group relative bg-white rounded-2xl shadow-md transition-all duration-300 overflow-hidden cursor-pointer w-full h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
        style={{ minHeight: '100%' }}
      >
        {/* Discount Badge */}
        {/* <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-primary to-[#FF1744] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            {getDiscountText()}
          </div>
        </div> */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-primary to-[#FF1744] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            {getDiscountText()}
          </div>
        </div>

        {/* Deal Type Badge */}
        {/* <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full shadow-md text-xs font-semibold uppercase flex items-center gap-1">
            {React.createElement(getDealTypeIcon(), { className: "w-3 h-3" })}
            {deal.deal_type === 'combo' ? 'Combo' : deal.deal_type === 'percentage' ? 'Off' : 'Fixed'}
          </div>
        </div> */}

        {/* Image Carousel */}
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[currentImageIndex]}
                alt={deal.deal_name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

              {/* Image Navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 z-10"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-800" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 z-10"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-800" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {allImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'w-8 bg-white' 
                            : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Deal Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {deal.deal_name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
            {deal.deal_description}
          </p>

          {/* Tags - Show first 1-2 tags that fit */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 overflow-hidden">
              {deal.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 flex-shrink-0"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Restaurant Info */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 font-medium line-clamp-1">
                {deal.business_id?.company_name || t('dealCard.restaurantFallback')}
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {/* <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{deal.business_id?.average_rating || '5.0'}</span>
              </div>
              <span>•</span> */}
              <span className="line-clamp-1">
                {t('dealCard.items', { count: deal.deal_items?.length || 0 })}
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(deal.deal_total)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(deal.original_total)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{t('dealCard.youSave')}</div>
                <div className="text-sm font-bold text-green-600">
                  {formatPrice(getSavingsAmount())}
                </div>
              </div>
            </div>
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-grow"></div>

          {/* Validity / Countdown Timer */}
          {timeRemaining ? (
            <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 px-3 py-2 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-red-700 font-medium">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('dealCard.expiresIn')}</span>
                  <span className="sm:hidden">{t('dealCard.ends')}</span>
                </div>
                <div className="flex items-center gap-1 text-red-700 font-bold text-xs sm:text-sm tabular-nums">
                  <span className="bg-white/80 px-1.5 py-0.5 rounded">{timeRemaining.hours}</span>
                  <span className="text-red-500">:</span>
                  <span className="bg-white/80 px-1.5 py-0.5 rounded">{timeRemaining.minutes}</span>
                  <span className="text-red-500">:</span>
                  <span className="bg-white/80 px-1.5 py-0.5 rounded">{timeRemaining.seconds}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{t('dealCard.validUntil', { date: formatDate(deal.end_date) })}</span>
            </div>
          )}

          {/* View Details Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="w-full bg-gradient-to-r from-primary to-[#FF1744] hover:from-primary-600 hover:to-[#E01535] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md transform group-hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t('deals.viewDealDetails')}
          </button>
        </div>
      </div>

      {/* Modals - Rendered as portals */}
      {showModal && createPortal(
        <DealModal
          deal={deal}
          onClose={() => setShowModal(false)}
          onDealClaimed={handleDealClaimed}
        />,
        document.body
      )}

      {showQRModal && claimData && createPortal(
        <QRCodeModal
          claimData={claimData}
          onClose={() => setShowQRModal(false)}
        />,
        document.body
      )}
    </>
  );
};

export default DealCard;