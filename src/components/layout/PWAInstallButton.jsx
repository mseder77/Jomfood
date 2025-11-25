import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from '../../utils/toast';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  // TEMPORARY: For testing - remove this after confirming it works
  const FORCE_SHOW_BUTTON = true;

  useEffect(() => {
    console.log('🔧 PWA Install Button: Component mounted');
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('🔧 PWA Install Button: Already installed (standalone mode)');
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('🔧 PWA Install Button: beforeinstallprompt event received!');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('🔧 PWA Install Button: App installed successfully');
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App installed successfully! 🎉');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Install prompt not available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔧 PWA Button State:', { isInstalled, deferredPrompt: !!deferredPrompt });
  }, [isInstalled, deferredPrompt]);

  // Don't show button if already installed or prompt not available
  // TEMPORARY: Force show for testing
  if (!FORCE_SHOW_BUTTON && (isInstalled || !deferredPrompt)) {
    console.log('🔧 PWA Button: Not rendering (isInstalled:', isInstalled, ', deferredPrompt:', !!deferredPrompt, ')');
    return null;
  }
  
  console.log('🔧 PWA Button: Rendering button (FORCE_SHOW:', FORCE_SHOW_BUTTON, ')');

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-primary transition-colors text-xs sm:text-sm font-medium"
      aria-label="Install JomFood App"
    >
      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="sm:inline">Install App</span>
    </button>
  );
};

export default PWAInstallButton;

