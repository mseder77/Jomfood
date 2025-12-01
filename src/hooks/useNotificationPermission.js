import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage notification permission state
 * Shows modal on every page until permission is granted
 */
export const useNotificationPermission = () => {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkPermission = async () => {
      setIsChecking(true);
      
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        setIsChecking(false);
        return;
      }

      // Check current permission status
      const currentPermission = Notification.permission;
      
      // If permission is already granted, don't show modal
      if (currentPermission === 'granted') {
        console.log('Notification permission already granted');
        localStorage.setItem('notificationPermissionRequested', 'granted');
        setIsChecking(false);
        return;
      }

      // Check if we've stored a "granted" status in localStorage
      const storedStatus = localStorage.getItem('notificationPermissionRequested');
      if (storedStatus === 'granted' && currentPermission === 'granted') {
        console.log('Notification permission was previously granted');
        setIsChecking(false);
        return;
      }

      // If permission was denied, we still show the modal (as per requirement)
      // But we can add a small delay if it was just dismissed
      const wasDismissed = storedStatus === 'dismissed';
      const delay = wasDismissed ? 2000 : 1000; // Longer delay if just dismissed

      // Show modal on every page visit until permission is granted
      setTimeout(() => {
        setShowModal(true);
        setIsChecking(false);
      }, delay);
    };

    checkPermission();
  }, []); // Re-check on route change

  const handleClose = () => {
    setShowModal(false);
    // Don't store dismissed status - we want to show again on next page
    // Only store if permission was actually granted or denied
  };

  return {
    showModal,
    isChecking,
    handleClose,
  };
};

