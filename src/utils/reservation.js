// Generalized Reservation System
// Handles saving and retrieving reservations for any module (deals, orders, etc.)

const RESERVATION_KEY_PREFIX = 'jomfood_reserved_';

export const reservation = {
  // Save a reservation for any module
  saveReservation: (module, itemId, itemName, additionalData = {}) => {
    const reservation = {
      module,
      itemId,
      itemName,
      additionalData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
    };
    
    const key = `${RESERVATION_KEY_PREFIX}${module}`;
    localStorage.setItem(key, JSON.stringify(reservation));
  },

  // Get the reserved item for a module
  getReservation: (module) => {
    try {
      const key = `${RESERVATION_KEY_PREFIX}${module}`;
      const reservation = localStorage.getItem(key);
      if (!reservation) return null;

      const data = JSON.parse(reservation);
      
      // Check if reservation has expired
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error getting ${module} reservation:`, error);
      return null;
    }
  },

  // Clear the reservation for a module
  clearReservation: (module) => {
    const key = `${RESERVATION_KEY_PREFIX}${module}`;
    localStorage.removeItem(key);
  },

  // Build login URL with parameters for any module
  buildLoginUrl: (module, itemId, itemName, returnPath = '') => {
    const params = new URLSearchParams();
    params.set('returnTo', returnPath || `/${module}`);
    params.set(`${module}Id`, itemId);
    params.set(`${module}Name`, itemName);
    return `/login?${params.toString()}`;
  },

  // Get URL parameters for any module
  getUrlParams: (module) => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      returnTo: urlParams.get('returnTo'),
      itemId: urlParams.get(`${module}Id`),
      itemName: urlParams.get(`${module}Name`),
      autoOpen: urlParams.get('autoOpen')
    };
  }
};

// Legacy support for deals (backward compatibility)
export const dealReservation = {
  saveReservation: (dealId, dealName) => reservation.saveReservation('deal', dealId, dealName),
  getReservation: () => reservation.getReservation('deal'),
  clearReservation: () => reservation.clearReservation('deal'),
  buildLoginUrl: (dealId, dealName) => reservation.buildLoginUrl('deal', dealId, dealName, '/deals')
};
