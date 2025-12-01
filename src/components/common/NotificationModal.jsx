import React, { useState, useEffect } from 'react';
import { X, Check, CheckCheck, Loader2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationsAPI } from '../../utils/api';

const NotificationModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'read', 'unread'

  const limit = 20;

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, filter = 'all') => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const customerId = user.id || user._id;
      if (!customerId) return;

      const response = await notificationsAPI.getNotifications(customerId, {
        page: pageNum,
        limit,
        status: filter,
      });

      if (response?.data?.success) {
        setNotifications(response.data.notifications || []);
        setPagination(response.data.pagination || null);
      } else {
        setError(response?.data?.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when modal opens or filter changes
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications(1, statusFilter);
      setPage(1);
    }
  }, [isOpen, user, statusFilter]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (!user || markingAsRead === notificationId) return;

    try {
      setMarkingAsRead(notificationId);
      const customerId = user.id || user._id;
      
      await notificationsAPI.markAsRead(notificationId, customerId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true, is_read: true, readAt: new Date().toISOString() }
            : notif
        )
      );

      // Refresh unread count
      refreshUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!user || markingAllAsRead) return;

    try {
      setMarkingAllAsRead(true);
      const customerId = user.id || user._id;
      
      await notificationsAPI.markAllAsRead(customerId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          isRead: true,
          is_read: true,
          readAt: notif.readAt || new Date().toISOString(),
        }))
      );

      // Refresh unread count
      refreshUnreadCount();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead && !notification.is_read) {
      handleMarkAsRead(notification._id);
    }

    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      const diffInDays = diffInHours / 24;

      if (diffInHours < 24) {
        // Today - show time only
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (diffInDays < 7) {
        // This week - show day and time
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        return `${dayName} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        // Older - show date
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      }
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  const hasUnread = notifications.some(n => !n.isRead && !n.is_read);
  const unreadCount = notifications.filter(n => !n.isRead && !n.is_read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('notifications.title', 'Notifications')}
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllAsRead}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  aria-label="Mark all as read"
                  title={t('notifications.markAllAsRead', 'Mark all as read')}
                >
                  {markingAllAsRead ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('notifications.all', 'All')}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unread')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'unread'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('notifications.unread', 'Unread')}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('read')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'read'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('notifications.read', 'Read')}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchNotifications(page, statusFilter)}
                  className="text-sm text-primary hover:underline"
                >
                  {t('common.tryAgain', 'Try Again')}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <div className="text-center">
                  <p className="text-sm">
                    {t('notifications.empty', 'No notifications yet')}
                  </p>
                  <p className="text-xs mt-2 text-gray-400">
                    {t('notifications.emptyDescription', 'Your notifications will appear here')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const isUnread = !notification.isRead && !notification.is_read;
                    return (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          isUnread ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                className={`text-sm font-medium ${
                                  isUnread ? 'text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {isUnread && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification._id);
                                  }}
                                  disabled={markingAsRead === notification._id}
                                  className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                                  aria-label="Mark as read"
                                >
                                  {markingAsRead === notification._id ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                  ) : (
                                    <Check className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.body || notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDate(notification.createdAt)}
                              </span>
                              {notification.link && (
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const newPage = page - 1;
                        setPage(newPage);
                        fetchNotifications(newPage, statusFilter);
                      }}
                      disabled={page === 1 || loading}
                      className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.previous', 'Previous')}
                    </button>
                    <span className="text-sm text-gray-600">
                      {t('pagination.page', 'Page')} {pagination.currentPage} {t('pagination.of', 'of')} {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        fetchNotifications(newPage, statusFilter);
                      }}
                      disabled={page >= pagination.totalPages || loading}
                      className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.next', 'Next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationModal;

