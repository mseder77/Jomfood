import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '../utils/http';
import { authStorage } from '../utils/auth';
import { toast } from '../utils/toast';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await http.get('/auth/customer/me');
      setUser(data);
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

  const logout = useCallback(() => {
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


