import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { ApiProvider } from './context/ApiContext';
import { UserProvider } from './context/UserContext';
import './App.css';
import SignupPage from './pages/SignupPage';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DealsPage from './pages/DealsPage';
import DealsPage2 from './pages/DealsPage2';
import DealValidityPage from './pages/DealValidityPage';
import ScrollToTop from './components/common/ScrollToTop';
import GoogleTranslate from './components/common/GoogleTranslate';

function App() {
  return (
    <ApiProvider>
      <UserProvider>
        <div className="App">
          <GoogleTranslate />
          <ScrollToTop />
          <Toaster richColors position="top-right" />
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
          </Routes>
        </div>
      </UserProvider>
    </ApiProvider>
  );
}

export default App;
