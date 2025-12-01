import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationsAPI } from '../../utils/api';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUser();
    const { refreshUnreadCount } = useNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    // Fetch 5 latest notifications
    useEffect(() => {
        if (isOpen && user) {
            fetchNotifications();
        }
    }, [isOpen, user]);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const customerId = user.id || user._id;
            if (!customerId) return;

            const response = await notificationsAPI.getNotifications(customerId, {
                page: 1,
                limit: 5,
                status: 'all',
            });

            if (response?.data?.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        if (!user || markingAsRead === notificationId) return;

        try {
            setMarkingAsRead(notificationId);
            const customerId = user.id || user._id;

            await notificationsAPI.markAsRead(notificationId, customerId);

            // Update notification status instead of removing it
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

    // Handle notification click
    const handleNotificationClick = (notification) => {
        // Mark as read if unread
        if (!notification.isRead && !notification.is_read) {
            const customerId = user.id || user._id;
            notificationsAPI.markAsRead(notification._id, customerId).catch(console.error);
            // Update notification status instead of removing it
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notification._id
                        ? { ...notif, isRead: true, is_read: true, readAt: new Date().toISOString() }
                        : notif
                )
            );
            refreshUnreadCount();
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
        // For other types, don't redirect - just close the dropdown
        onClose();
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
                return `${Math.floor(diffInDays)}d ago`;
            } else {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[date.getMonth()]} ${date.getDate()}`;
            }
        } catch {
            return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">
                        {t('notifications.recent', 'Recent Notifications')}
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <Bell className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">
                            {t('notifications.empty', 'No notifications yet')}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${!notification.isRead && !notification.is_read ? 'bg-primary' : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-sm font-medium line-clamp-1 ${!notification.isRead && !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                {notification.title}
                                            </h4>
                                            {(!notification.isRead && !notification.is_read) && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                    disabled={markingAsRead === notification._id}
                                                    className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
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
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {notification.body || notification.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-0">
                                            <span className="text-xs text-gray-400">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                            {notification.type === 'deal' && (
                                                <ExternalLink className="w-3 h-3 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - View All Button */}
            {notifications.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <button
                        type="button"
                        onClick={() => {
                            navigate('/notifications');
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 rounded-md transition-colors"
                    >
                        <span>{t('notifications.viewAll', 'View All Notifications')}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

