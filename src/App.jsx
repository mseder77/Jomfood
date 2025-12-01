import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { ApiProvider } from './context/ApiContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';
import SignupPage from './pages/SignupPage';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DealsPage from './pages/DealsPage';
import DealsPage2 from './pages/DealsPage2';
import DealValidityPage from './pages/DealValidityPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import NotificationsPage from './pages/NotificationsPage';
import RestaurantRequestPage from './pages/RestaurantRequestPage';
import ScrollToTop from './components/common/ScrollToTop';
// import GoogleTranslate from './components/common/GoogleTranslate'; // COMMENTED: Using i18n instead, keep for revert
import NotificationPermissionModal from './components/common/NotificationPermissionModal';
import { useNotificationPermission } from './hooks/useNotificationPermission';

function AppContent() {
  const { showModal, handleClose } = useNotificationPermission();

  return (
    <div className="App">
      {/* <GoogleTranslate /> COMMENTED: Using i18n instead, keep for revert */}
      <ScrollToTop />
      <Toaster richColors position="top-right" />
      <NotificationPermissionModal isOpen={showModal} onClose={handleClose} />
      <Routes>
        <Route path="/" element={<DealsPage2 />} />
        <Route path="/restaurants" element={<HomePage />} />
        {/* <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage2 />} /> */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/deals-2" element={<DealsPage />} />
        <Route path="/deal-validity" element={<DealValidityPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/restaurant-request" element={<RestaurantRequestPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ApiProvider>
      <UserProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </UserProvider>
    </ApiProvider>
  );
}

export default App;
