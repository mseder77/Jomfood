import { useState, useEffect, useCallback } from 'react';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};

// Custom hook for categories
export const useCategories = (params = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchCategories = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Import here to avoid circular dependency
      const { categoriesAPI } = await import('../utils/api');
      const data = await categoriesAPI.getCategories({ ...params, ...newParams });
      setCategories(data.data || data);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    pagination,
    refetch: fetchCategories
  };
};

// Custom hook for restaurants with pagination and location-based sorting
export const useRestaurants = (categoryId = null, page = 1, limit = 20, userLocation = null, sortBy = 'recommended') => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchRestaurants = useCallback(async (newPage = page, newLimit = limit) => {
    setLoading(true);
    setError(null);

    try {
      // Import here to avoid circular dependency
      const { restaurantsAPI } = await import('../utils/api');
      
      const params = {
        page: newPage,
        limit: newLimit
      };
      
      // Always send sort_by parameter
      params.sort_by = sortBy;
      
      // Always add location params if available (backend will calculate distance)
      if (userLocation) {
        params.user_lat = userLocation.latitude;
        params.user_lng = userLocation.longitude;
        
        console.log('🌍 Sending location to backend:', {
          lat: params.user_lat,
          lng: params.user_lng,
          sort_by: params.sort_by
        });
      } else {
        console.log('📍 No location available:', {
          hasLocation: false,
          sortBy: sortBy,
          willSendLocation: false
        });
      }
      
      console.log('📡 API Request params:', params);
      
      let data;
      if (categoryId) {
        data = await restaurantsAPI.getRestaurantsByCategory(categoryId, params);
      } else {
        // Fetch all restaurants when no category is selected
        data = await restaurantsAPI.getRestaurants(params);
      }
      
      console.log('📥 API Response:', {
        restaurantsCount: data.data?.length || 0,
        hasDistance: data.data?.[0]?.distance !== undefined,
        firstDistance: data.data?.[0]?.distance
      });
      
      setRestaurants(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, limit, userLocation, sortBy]);

  useEffect(() => {
    // Always fetch restaurants, whether category is selected or not
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    pagination,
    refetch: fetchRestaurants
  };
};

// Custom hook for filter options
export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState({
    dietary: [],
    cuisines: [],
    areas: [],
    dishTypes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFilterOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Import here to avoid circular dependency
      const { filterAPI } = await import('../utils/api');
      const [dietary, cuisines, areas] = await Promise.all([
        filterAPI.getDietaryOptions(),
        filterAPI.getCuisineTypes(),
        filterAPI.getDeliveryAreas()
      ]);
      
      setFilterOptions({
        dietary: dietary.data || dietary,
        cuisines: cuisines.data || cuisines,
        areas: areas.data || areas,
        dishTypes: [] // Add when available
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch filter options');
      console.error('Error fetching filter options:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return { 
    filterOptions, 
    loading, 
    error, 
    refetch: fetchFilterOptions 
  };
};
