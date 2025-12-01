import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader2, ExternalLink, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { notificationsAPI } from '../utils/api';
import CommonLayout from '../components/layout/CommonLayout';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
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
        setUnreadCount(response.data.unreadCount || 0);
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

  // Fetch notifications on mount and when filter changes
  useEffect(() => {
    if (user) {
      fetchNotifications(1, statusFilter);
      setPage(1);
    }
  }, [user, statusFilter]);

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

    // Handle navigation based on notification type
    if (notification.type === 'deal') {
      // Get dealId from data field
      const dealId = notification.data?.dealId || notification.data?.deal_id;
      if (dealId) {
        // Navigate to home page with dealId and autoOpen query parameters
        navigate(`/?dealId=${dealId}&autoOpen=true`);
      }
    }
    // For other types, don't redirect
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      const diffInDays = diffInHours / 24;

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInDays < 7) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        return `${dayName} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      }
    } catch {
      return '';
    }
  };

  const hasUnread = notifications.some(n => !n.isRead && !n.is_read);
  const localUnreadCount = notifications.filter(n => !n.isRead && !n.is_read).length;

  return (
    <CommonLayout>
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('notifications.pageTitle', 'Notifications')}
                  </h1>
                  {pagination && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t('notifications.totalCount', '{{count}} notifications', {
                        count: pagination.totalCount || 0,
                      })}
                    </p>
                  )}
                </div>
              </div>
              {hasUnread && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {markingAllAsRead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('notifications.marking', 'Marking...')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>{t('notifications.markAllAsRead', 'Mark all as read')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'text-primary border-b-2 border-primary bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('notifications.all', 'All')}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unread')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  statusFilter === 'unread'
                    ? 'text-primary border-b-2 border-primary bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('notifications.unread', 'Unread')}
                {statusFilter === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('read')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  statusFilter === 'read'
                    ? 'text-primary border-b-2 border-primary bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('notifications.read', 'Read')}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <X className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchNotifications(page, statusFilter)}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {t('common.tryAgain', 'Try Again')}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {t('notifications.empty', 'No notifications yet')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('notifications.emptyDescription', 'Your notifications will appear here')}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const isUnread = !notification.isRead && !notification.is_read;
                    return (
                      <div
                        key={notification._id}
                        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                          isUnread ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            isUnread ? 'bg-primary' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3
                                  className={`text-base font-medium ${
                                    isUnread ? 'text-gray-900' : 'text-gray-700'
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.body || notification.message}
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                  <span className="text-xs text-gray-400">
                                    {formatDate(notification.createdAt)}
                                  </span>
                                  {notification.type && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                      {notification.type}
                                    </span>
                                  )}
                                  {notification.type === 'deal' && (
                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              {isUnread && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification._id);
                                  }}
                                  disabled={markingAsRead === notification._id}
                                  className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                  aria-label="Mark as read"
                                >
                                  {markingAsRead === notification._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                  ) : (
                                    <Check className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
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
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {t('pagination.page', 'Page')} {pagination.currentPage} {t('pagination.of', 'of')} {pagination.totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newPage = page - 1;
                            setPage(newPage);
                            fetchNotifications(newPage, statusFilter);
                          }}
                          disabled={page === 1 || loading}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('common.previous', 'Previous')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newPage = page + 1;
                            setPage(newPage);
                            fetchNotifications(newPage, statusFilter);
                          }}
                          disabled={page >= pagination.totalPages || loading}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('common.next', 'Next')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default NotificationsPage;

