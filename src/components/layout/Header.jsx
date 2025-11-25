import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import jomfoodLogo from "../../assets/JomFood.png";
import { useUser } from "../../context/UserContext";
import SearchBar from "./SearchBar";
import PWAInstallButton from "./PWAInstallButton";
import LanguageSwitcher from "../common/LanguageSwitcher";

const Header = ({ isRestaurantPage = false }) => {
  const { user, logout } = useUser();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
    <header className="bg-white border-b border-gray-200 sm:sticky sm:top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link to="/">
            <img src={jomfoodLogo} alt="JomFood" className="h-6 sm:h-8 w-auto" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="gap-4 sm:hidden inline-flex items-center justify-center">
        <LanguageSwitcher />
        <PWAInstallButton />
        <button
          type="button"
          className=" p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Open main menu"
          aria-controls="mobile-menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </div>
        
        
        <nav className="hidden sm:flex items-center gap-3 sm:gap-6">
          {/* <Link
            to="/"
            className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm font-medium"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('header.explore')}</span>
          </Link> */}
          <LanguageSwitcher />
          <PWAInstallButton />
          <Link
            to="/"
            // to="/deals"
            className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm font-medium"
          >
            <span className="sm:inline">{t('header.deals')}</span>
          </Link>
          <Link
            to="/restaurants"
            // to="/"
            className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm font-medium"
          >
            <span className="sm:inline">{t('header.restaurants')}</span>
          </Link>
          {/* <button
            className="text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm font-medium"
            type="button"
          >
            <span className="hidden sm:inline">MY LIST</span>
            <span className="sm:hidden">LIST</span>
          </button> */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-700 mr-2 hover:text-primary transition-colors text-xs sm:text-sm font-medium"
              >
                {t('common.login')}
              </Link>
              <Link
                to="/signup"
                className="bg-primary hover:bg-primary-600 text-white px-3 py-1.5 rounded font-medium text-xs sm:text-sm transition-colors"
              >
                {t('common.signup')}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-primary-100 text-primary font-semibold flex items-center justify-center overflow-hidden border border-primary-200"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('common.profile')}
                    </Link>
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => { setMenuOpen(false); logout(); }}
                    >
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
      {/* Mobile drawer menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Drawer */}
          <div 
            id="mobile-menu" 
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 sm:hidden transform transition-transform duration-300 ease-in-out"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <img src={jomfoodLogo} alt="JomFood" className="h-6 w-auto" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* <div className="flex items-center justify-center mb-3">
                  <PWAInstallButton />
                </div> */}
                
                <div className="space-y-2">
                  <div className="mb-4">
                    <LanguageSwitcher />
                  </div>
                  <Link
                    to="/"
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('header.deals').toUpperCase()}
                  </Link>
                  <Link
                    to="/restaurants"
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('header.restaurants').toUpperCase()}
                  </Link>
                </div>
                
                {!user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="flex items-center px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center px-3 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg text-base font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t('common.signup')}
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t('common.profile')}
                    </Link>
                    <button
                      type="button"
                      className="flex items-center w-full px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                      onClick={() => { setMobileOpen(false); logout(); }}
                    >
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    {isRestaurantPage && <SearchBar />}
    </header>
    </>
  );
};

export default Header;

