import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../../utils/toast';

const GoogleSignIn = ({ onSuccess, onError, buttonText }) => {
  const { t } = useTranslation();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback((response) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userInfo = {
        idToken: response.credential,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        profile_picture: payload.picture, // Map to API expected field
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      // Call the success callback with user info
      onSuccess(userInfo);
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error(t('auth.googleSignInFailed'));
      onError(error);
    }
  }, [onSuccess, onError, t]);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false
        });
      }
    };

    return () => {
      // Cleanup
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, [clientId, handleCredentialResponse]);

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast.error(t('auth.googleSignInUnavailable'));
    }
  };

  if (!clientId) {
    console.error('Google Client ID not found. Please check your environment variables.');
    return null;
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full relative flex items-center px-4 py-3 bg-[#4285F4] hover:bg-[#357AE8] rounded-lg shadow-md transition-all duration-200 font-medium text-white text-sm"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* White square container for Google logo - positioned at start */}
      <div className="bg-white rounded p-1.5 flex-shrink-0">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      {/* Text centered in the button */}
      <span className="absolute inset-0 flex items-center justify-center">{buttonText || t('auth.continueWithGoogle')}</span>
    </button>
  );
};

export default GoogleSignIn;
