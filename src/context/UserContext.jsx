import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '../utils/http';
import { authStorage } from '../utils/auth';
import { toast } from '../utils/toast';
import { updateFCMTokenWithCustomerId, removeCustomerIdFromFCMToken } from '../utils/initializeNotifications';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await http.get('/auth/customer/me');
      setUser(data);
      
      // Update FCM token with customerId after user data is loaded
      if (data) {
        const customerId = data.id || data._id;
        if (customerId) {
          // Update FCM token in background (don't block UI)
          updateFCMTokenWithCustomerId(customerId).catch(err => {
            console.warn("Failed to update FCM token:", err);
          });
        }
      }
      
      return data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await http.post('/auth/customer/login', { email, password });
    const access = data?.token;
    const refresh = data?.refreshToken;
    if (access && refresh) {
      authStorage.setAccessToken(access);
      authStorage.setRefreshToken(refresh);
    }
    await loadMe();
    // toast.success('Logged in successfully');
  }, [loadMe]);

  const logout = useCallback(async () => {
    // Remove customerId from FCM token before logout (make it anonymous/public)
    try {
      await removeCustomerIdFromFCMToken();
    } catch (error) {
      console.warn("Failed to remove customerId from FCM token on logout:", error);
      // Don't block logout if FCM update fails
    }
    
    authStorage.clearAll();
    setUser(null);
    toast.success('Logged out');
  }, []);

  useEffect(() => {
    // Attempt to load profile if tokens exist
    const hasRefresh = !!authStorage.getRefreshToken();
    if (hasRefresh) {
      loadMe();
    }
  }, [loadMe]);

  const value = { user, loading, login, logout, reload: loadMe };
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;


