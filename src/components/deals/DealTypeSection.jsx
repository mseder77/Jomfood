import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dealsAPI } from '../../utils/api';
import DealCard from './DealCard';
import { ChevronRight, Loader2 } from 'lucide-react';

const DealTypeSection = ({ dealType, icon: Icon, title, description, userLocation }) => {
  const { t } = useTranslation();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, [dealType, userLocation]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params = {
        deal_type: dealType,
        limit: 6,
        page: 1,
        sort_by: 'newest'
      };

      if (userLocation?.latitude && userLocation?.longitude) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
        params.sort_by = 'nearest';
      }

      const response = await dealsAPI.getDeals(params);
      if (response?.success && response?.data) {
        setDeals(response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${dealType} deals:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="w-7 h-7 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon className="w-7 h-7 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-primary hover:text-primary-600 font-medium transition-colors"
          >
            <span className="hidden sm:inline">{t("deals.viewAll")}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <div
              key={deal._id}
              className="animate-slideUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <DealCard deal={deal} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealTypeSection;
