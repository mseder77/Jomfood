import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Bell, X } from 'lucide-react';
import { initializeNotifications } from '../../utils/initializeNotifications';
import { useUser } from '../../context/UserContext';
import { toast } from '../../utils/toast';

const NotificationPermissionModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      // First, request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error(t('notifications.permissionDenied'));
          localStorage.setItem('notificationPermissionRequested', 'denied');
          setIsRequesting(false);
          return;
        }
      }

      // If permission is granted, initialize Firebase notifications
      if (Notification.permission === 'granted') {
        const userId = user?.id || user?._id || null;
        const result = await initializeNotifications(userId);
        
        if (result.success) {
          toast.success(t('notifications.permissionGranted'));
          // Store permission granted status
          localStorage.setItem('notificationPermissionRequested', 'granted');
          onClose();
        } else {
          // Even if Firebase init fails, browser permission is granted
          localStorage.setItem('notificationPermissionRequested', 'granted');
          toast.warning(result.error || t('notifications.errorRequesting'));
          onClose();
        }
      } else {
        toast.error(t('notifications.permissionDenied'));
        localStorage.setItem('notificationPermissionRequested', 'denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error(t('notifications.errorRequesting'));
      localStorage.setItem('notificationPermissionRequested', 'denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    // Store that user dismissed (but we'll show again on next page)
    // Don't store as 'denied' - we want to keep showing until they allow
    localStorage.setItem('notificationPermissionRequested', 'dismissed');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isRequesting}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-[#FF1744] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('notifications.title')}
            </h3>
            <p className="text-gray-600 mb-2">
              {t('notifications.description')}
            </p>
            <ul className="text-sm text-gray-500 text-left mt-4 space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>{t('notifications.benefit1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>{t('notifications.benefit2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>{t('notifications.benefit3')}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
              disabled={isRequesting}
            >
              {t('notifications.notNow')}
            </button>
            <button
              onClick={handleAllow}
              className="flex-1 bg-gradient-to-r from-primary to-[#FF1744] hover:from-primary-600 hover:to-[#E01535] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('notifications.requesting')}</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>{t('notifications.allow')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationPermissionModal;

