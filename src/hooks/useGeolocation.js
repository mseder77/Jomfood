import { useState, useEffect, useCallback } from 'react';
import { getUserLocation } from '../utils/geolocation';

/**
 * Custom hook for managing user's geolocation
 * @param {boolean} autoFetch - Whether to automatically fetch location on mount
 * @returns {Object} Location state and methods
 */
export const useGeolocation = (autoFetch = false) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Check permission status
  const checkPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermission(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermission(result.state);
        });
      } catch (err) {
        console.error('Error checking permission:', err);
      }
    }
  }, []);

  // Fetch user location
  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await getUserLocation();
      setLocation(position);
      setPermission('granted');
      
      // Store in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify({
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: Date.now()
      }));
      
      return position;
    } catch (err) {
      setError(err.message);
      setPermission('denied');
      console.error('Geolocation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    localStorage.removeItem('userLocation');
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    checkPermission();
    
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;
        
        // Use stored location if less than 1 hour old
        if (age < 60 * 60 * 1000) {
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude
          });
        } else {
          // Location too old, remove it
          localStorage.removeItem('userLocation');
        }
      } catch (err) {
        console.error('Error parsing stored location:', err);
      }
    }
  }, [checkPermission]);

  // Auto-fetch if enabled
  useEffect(() => {
    if (autoFetch && !location && !error) {
      fetchLocation();
    }
  }, [autoFetch, location, error, fetchLocation]);

  return {
    location,
    loading,
    error,
    permission,
    fetchLocation,
    clearLocation,
    hasLocation: !!location,
  };
};

export default useGeolocation;

