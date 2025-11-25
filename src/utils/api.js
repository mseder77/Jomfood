// Import Supabase-based APIs
export {
  dealsAPI,
  categoriesAPI,
  dealCategoriesAPI,
  restaurantsAPI,
  dealValidityAPI,
  googleOAuthAPI
} from './api-supabase';

// API Configuration and Utilities (legacy, kept for compatibility)
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5055/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message = typeof data === 'object' && data !== null ? (data.message || JSON.stringify(data)) : String(data || `HTTP ${response.status}`);
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API Methods
export const api = {
  // GET request
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'GET', ...options }),
  
  // POST request
  post: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data), 
      ...options 
    }),
  
  // PUT request
  put: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data), 
      ...options 
    }),
  
  // DELETE request
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'DELETE', ...options }),
};

// Restaurant API endpoints
export const restaurantAPI = {
  // Get all restaurants
  getRestaurants: (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return api.get(`/restaurants?${queryParams}`);
  },
  
  // Get single restaurant
  getRestaurant: (id) => api.get(`/restaurants/${id}`),
  
  // Search restaurants
  searchRestaurants: (searchParams) => {
    const queryParams = new URLSearchParams(searchParams);
    return api.get(`/restaurants/search?${queryParams}`);
  },
  
  // Get restaurant menu
  getRestaurantMenu: (id) => api.get(`/restaurants/${id}/menu`),
  
  // Toggle restaurant favorite
  toggleFavorite: (id) => api.post(`/restaurants/${id}/favorite`),
};


// Filter API endpoints
export const filterAPI = {
  // Get filter options
  getFilterOptions: () => api.get('/filters/options'),
  
  // Get dietary options
  getDietaryOptions: () => api.get('/filters/dietary'),
  
  // Get cuisine types
  getCuisineTypes: () => api.get('/filters/cuisines'),
  
  // Get delivery areas
  getDeliveryAreas: () => api.get('/filters/areas'),
};

// User API endpoints (if needed)
export const userAPI = {
  // Get user favorites
  getFavorites: () => api.get('/user/favorites'),
  
  // Get user orders
  getOrders: () => api.get('/user/orders'),
  
  // Get user profile
  getProfile: () => api.get('/user/profile'),
};



export default api;
