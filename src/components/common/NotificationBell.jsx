import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { hasUnreadNotifications } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleBellClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {hasUnreadNotifications && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      <NotificationDropdown isOpen={isDropdownOpen} onClose={handleCloseDropdown} />
    </div>
  );
};

export default NotificationBell;

