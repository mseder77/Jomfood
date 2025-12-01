import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { messaging, initializeMessaging, onMessage } from '../firebase-config';
import { notificationsAPI } from '../utils/api';
import { useUser } from './UserContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useUser();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const listenerSetupRef = useRef(false);

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setHasUnreadNotifications(false);
      return;
    }

    try {
      const customerId = user.id || user._id;
      if (!customerId) return;

      const response = await notificationsAPI.getUnreadCount(customerId);
      const count = response?.data?.unreadCount || 0;
      setUnreadCount(count);
      setHasUnreadNotifications(count > 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't update state on error to avoid false negatives
    }
  }, [user]);

  // Fetch unread count when user changes
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up interval to periodically check for new notifications (every 30 seconds)
    const interval = setInterval(() => {
      if (user) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    // Set up onMessage listener for foreground notifications (only once)
    const setupMessageListener = async () => {
      if (listenerSetupRef.current) return;

      try {
        const messagingInstance = await initializeMessaging();
        if (!messagingInstance) {
          console.warn('Firebase messaging not available');
          return;
        }

        // Set up listener for foreground messages
        onMessage(messagingInstance, (payload) => {
          console.log('Foreground notification received:', payload);
          
          // Show red dot indicator when notification arrives
          setHasUnreadNotifications(true);
          
          // Refresh unread count from API
          if (user) {
            fetchUnreadCount();
          }

          // Optional: Play sound
          try {
            const audio = new Audio('/ping.mp3');
            audio.play().catch(err => {
              console.warn('Could not play notification sound:', err);
            });
          } catch (audioError) {
            console.warn('Audio not available:', audioError);
          }
        });

        listenerSetupRef.current = true;
        console.log('✅ Notification message listener set up');
      } catch (error) {
        console.error('Error setting up notification listener:', error);
      }
    };

    setupMessageListener();
  }, [user, fetchUnreadCount]);

  const markAsRead = () => {
    setHasUnreadNotifications(false);
  };

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  const value = {
    hasUnreadNotifications,
    unreadCount,
    markAsRead,
    setHasUnreadNotifications,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values if context is not available (shouldn't happen, but safety check)
    return {
      hasUnreadNotifications: false,
      unreadCount: 0,
      markAsRead: () => {},
      setHasUnreadNotifications: () => {},
      refreshUnreadCount: () => {},
    };
  }
  return context;
};

export default NotificationContext;

