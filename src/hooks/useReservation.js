import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservation } from '../utils/reservation';

export const useReservation = (module, returnPath = '') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reservedItem, setReservedItem] = useState(null);
  const [autoOpenId, setAutoOpenId] = useState(null);

  useEffect(() => {
    const params = reservation.getUrlParams(module);
    const storedReservation = reservation.getReservation(module);

    // Check if we should auto-open an item
    if (params.autoOpen === 'true' && params.itemId) {
      setAutoOpenId(params.itemId);
      // Clear the reservation after setting the auto-open
      reservation.clearReservation(module);
    } else if (storedReservation) {
      setAutoOpenId(storedReservation.itemId);
      // Clear the reservation after setting the auto-open
      reservation.clearReservation(module);
    }

    // Set reserved item for display
    if (params.itemId && params.itemName) {
      setReservedItem({
        id: params.itemId,
        name: params.itemName
      });
    } else if (storedReservation) {
      setReservedItem({
        id: storedReservation.itemId,
        name: storedReservation.itemName
      });
    }
  }, [module, searchParams]);

  const clearAutoOpen = () => {
    setAutoOpenId(null);
    
    // Remove dealId and autoOpen params from URL
    const newSearchParams = new URLSearchParams(searchParams);
    const moduleIdParam = `${module}Id`;
    
    if (newSearchParams.has(moduleIdParam)) {
      newSearchParams.delete(moduleIdParam);
    }
    if (newSearchParams.has('autoOpen')) {
      newSearchParams.delete('autoOpen');
    }
    
    // Update URL without the params using setSearchParams
    setSearchParams(newSearchParams, { replace: true });
  };

  const clearReservedItem = () => {
    setReservedItem(null);
  };

  return {
    reservedItem,
    autoOpenId,
    clearAutoOpen,
    clearReservedItem
  };
};
