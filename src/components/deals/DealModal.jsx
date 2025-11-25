import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock, Calendar, Tag, MapPin, Phone, Star } from 'lucide-react';
import { dealsAPI } from '../../utils/api';
import { toast } from '../../utils/toast';
import { useUser } from '../../context/UserContext';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import noImage from '../../assets/default_product_deal_image.jpg';

const DealModal = ({ deal, onClose, onDealClaimed }) => {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [fullDeal, setFullDeal] = useState(deal);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    // Try to fetch full deal details if we have the deal ID
    if (deal._id) {
      setLoading(true);
      dealsAPI.getDealById(deal._id)
        .then(response => {
          if (response?.success && response?.data) {
            setFullDeal(response.data);
          }
        })
        .catch(error => {
          console.log('Could not fetch full deal details, using card data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [deal._id]);

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!fullDeal.end_date) return null;
      
      const now = new Date().getTime();
      const endDate = new Date(fullDeal.end_date).getTime();
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
  }, [fullDeal.end_date]);

  const formatPrice = (price) => `RM ${price.toFixed(2)}`;
  const getLocale = () => (i18n.language === 'ms' ? 'ms-MY' : 'en-GB');
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(getLocale(), { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString(getLocale(), { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return t('dealModal.dateAtTime', { date: dateStr, time: timeStr });
  };

  const getDiscountText = () => {
    if (fullDeal.deal_type === 'percentage') {
      return `${fullDeal.discount_percentage}% OFF`;
    }
    if (fullDeal.deal_type === 'fixed_amount') {
      return `RM ${fullDeal.discount_amount.toFixed(2)} OFF`;
    }
    if (fullDeal.deal_type === 'combo') {
      return 'COMBO DEAL';
    }
    return 'DEAL';
  };

  const getUsageLimitText = () => {
    if (!fullDeal.max_quantity) return null;
    
    if (fullDeal.max_quantity === 1) {
      return t('deals.oneTimeUse');
    } else if (fullDeal.max_quantity === 2) {
      return t('deals.canBeUsedTwice');
    } else {
      return t('deals.canBeUsedUpTo', { count: fullDeal.max_quantity });
    }
  };


  const handleClaimDeal = async () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      setClaiming(true);
      
      console.log('Claiming deal:', {
        dealId: fullDeal._id,
        customerId: user._id,
        dealName: fullDeal.deal_name
      });
      
      const response = await dealsAPI.claimDeal(fullDeal._id, user._id);
      
      console.log('Claim response:', response);
      
      if (response.success) {
        toast.success(t('dealModal.claimSuccess'));
        // Close the deal modal first
        onClose();
        // Then show QR modal after a short delay
        setTimeout(() => {
          onDealClaimed(response.data);
        }, 200);
      } else {
        toast.error(response.message || t('dealModal.claimFailed'));
      }
    } catch (error) {
      console.error('Error claiming deal:', error);
      toast.error(error.message || t('dealModal.claimFailed'));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="pr-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">{fullDeal.deal_name}</h2>
              <div className="flex items-center gap-2">
                {timeRemaining && (
                  <div className="relative text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full animate-pulse"></div>
                    <Clock className="w-3.5 h-3.5 relative z-10" />
                    <span className="tabular-nums relative z-10">
                      {timeRemaining.hours}:{timeRemaining.minutes}:{timeRemaining.seconds}
                    </span>
                  </div>
                )}
                <div className="bg-white text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {getDiscountText()}
                </div>
              </div>
            </div>
            <p className="text-white/90 text-sm">{t('dealModal.completeDealDetails')}</p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">{t('dealModal.loadingDetails')}</p>
            </div>
          ) : (
            <>
              {/* Deal Description */}
              {fullDeal.deal_description && (
                <div className="">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {fullDeal.deal_description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {fullDeal.tags && fullDeal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fullDeal.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Deal Image */}
              {fullDeal.deal_image && (
                <div className="w-full h-56 rounded-lg overflow-hidden">
                  <img
                    src={fullDeal.deal_image}
                    alt="Deal Image"
                    className="w-full h-full object-contain object-center"
                  />
                </div>
              )}

              {/* Business Information */}
              <div className="p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3">{t('dealModal.restaurantInfo')}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">{fullDeal.business_id?.company_name || t('dealCard.restaurantFallback')}</div>
                    {fullDeal.group_id?.name && (
                      <div className="text-sm text-gray-600">{fullDeal.group_id.name}</div>
                    )}
                  </div>
                  
                  {fullDeal.business_id?.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{t('dealModal.address')}</div>
                        <div className="text-sm text-gray-600">{fullDeal.business_id.address}</div>
                      </div>
                    </div>
                  )}
                  
                  {fullDeal.business_id?.office_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{t('dealModal.contact')}</div>
                        <div className="text-sm text-gray-600">{fullDeal.business_id.office_phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* {fullDeal.business_id?.average_rating && (
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Rating</div>
                        <div className="text-sm text-gray-600">{fullDeal.business_id.average_rating}/5</div>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Deal Items */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  {t('dealModal.dealItemsWithCount', { count: fullDeal.deal_items?.length || 0 })}
                </h3>
                <div className="space-y-4">
                  {fullDeal.deal_items?.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = noImage;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{item.product_name}</h4>
                        {item.category_name && (
                          <p className="text-sm text-gray-500 mb-2">{item.category_name}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {t('dealModal.quantity', { count: item.quantity })}
                          </div>
                          <div className="font-medium text-primary text-lg">
                            {formatPrice(item.product_price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deal Terms */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{t('dealModal.validPeriod')}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t('dealModal.from')} {formatDateTime(fullDeal.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t('dealModal.until')} {formatDateTime(fullDeal.end_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {fullDeal.max_quantity && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{t('dealModal.usageLimit')}</div>
                      <div className="text-sm text-gray-600">
                        {getUsageLimitText()}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3">{t('dealModal.pricingSummary')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('dealModal.regularPrice')}</span>
                    <span className="line-through text-gray-500">{formatPrice(fullDeal.original_total)}</span>
                  </div>
                  
                  {/* Show discount only if there's actual savings */}
                  {fullDeal.original_total > fullDeal.deal_total && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dealModal.youSaveLabel')}</span>
                      <span className="text-red-600 font-medium">
                        -{formatPrice(fullDeal.original_total - fullDeal.deal_total)}
                      </span>
                    </div>
                  )}
                  
                  {/* Show deal type info for combo deals with no discount */}
                  {fullDeal.deal_type === 'combo' && fullDeal.original_total === fullDeal.deal_total && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dealModal.dealType')}</span>
                      <span className="text-blue-600 font-medium">{t('dealModal.comboBundle')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('dealModal.dealTotal')}</span>
                    <span className="text-primary">{formatPrice(fullDeal.deal_total)}</span>
                  </div>
                  
                  {/* Show savings only if there are actual savings */}
                  {/* {fullDeal.original_total > fullDeal.deal_total && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>You Save:</span>
                      <span className="font-medium">{formatPrice(calculateSavings())}</span>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('common.close')}
                </button>
                <button 
                  onClick={handleClaimDeal}
                  disabled={claiming}
                  className="flex-1 bg-primary hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {claiming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('dealModal.claiming')}
                    </>
                  ) : (
                    t('deals.claimDeal')
                  )}
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

          {/* Login Required Modal */}
          <LoginRequiredModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            module="deal"
            itemName={fullDeal.deal_name}
            itemId={fullDeal._id}
            returnPath="/"
          />
    </div>
  );
};

export default DealModal;
