import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import jomfoodLogo from '../assets/jomfood.png';
import { toast } from '../utils/toast';
import CommonLayout from '../components/layout/CommonLayout';
import { reservation } from '../utils/reservation';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import { googleOAuthAPI } from '../utils/api';
import { authStorage } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, reload } = useUser();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reservedItem, setReservedItem] = useState(null);

  // Get URL parameters
  const returnTo = searchParams.get('returnTo');
  const dealId = searchParams.get('dealId');
  const dealName = searchParams.get('dealName');

  useEffect(() => {
    // Check if there's a reserved item (deal or any other module)
    const dealReservation = reservation.getReservation('deal');
    if (dealReservation) {
      setReservedItem(dealReservation);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('auth.requiredLoginFields'));
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success(t('auth.loginSuccess'));
      
      // Navigate to the appropriate page
      if (returnTo) {
        const separator = returnTo.includes('?') ? '&' : '?';
        const finalUrl = dealId ? `${returnTo}${separator}dealId=${dealId}&autoOpen=true` : returnTo;
        navigate(finalUrl, { replace: true });
          } else if (reservedItem) {
            navigate(`/deals?dealId=${reservedItem.itemId}&autoOpen=true`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || t('auth.loginFailed');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (userInfo) => {
    try {
      setSubmitting(true);
      // Call Google OAuth API
      const response = await googleOAuthAPI.authenticate(userInfo);
      
      if (response.success) {
        // Store tokens using authStorage (same as email/password login)
        authStorage.setAccessToken(response.data.tokens.access_token);
        authStorage.setRefreshToken(response.data.tokens.refresh_token);
        
        // Reload user context to update logged-in state
        await reload();
        
        toast.success(t('auth.googleSignInSuccess'));
        
        // Navigate to the appropriate page
        if (returnTo) {
          const separator = returnTo.includes('?') ? '&' : '?';
          const finalUrl = dealId ? `${returnTo}${separator}dealId=${dealId}&autoOpen=true` : returnTo;
          navigate(finalUrl, { replace: true });
        } else if (reservedItem) {
          navigate(`/deals?dealId=${reservedItem.itemId}&autoOpen=true`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      // Handle specific error types
      const errorCode = err?.response?.data?.error;
      const message = err?.response?.data?.message || err?.message || t('auth.googleSignInFailed');
      
      switch (errorCode) {
        case 'MISSING_FIELDS':
          toast.error(t('auth.provideAllInfo'));
          break;
        case 'INVALID_TOKEN':
          toast.error(t('auth.invalidGoogleToken'));
          break;
        case 'EMAIL_MISMATCH':
          toast.error(t('auth.emailVerificationFailed'));
          break;
        case 'GOOGLE_ACCOUNT_CONFLICT':
          toast.error(t('auth.googleAccountConflict'));
          break;
        case 'SERVER_ERROR':
          toast.error(t('auth.serverError'));
          break;
        default:
          toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth error:', error);
    toast.error(t('auth.googleSignInFailed'));
  };

  return (
    <CommonLayout>
      <div className="flex items-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-center mb-6">
            <img src={jomfoodLogo} alt="JomFood" className="h-10 sm:h-12 w-auto" />
          </div>
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 text-center">{t('auth.welcomeBack')}</h1>
          <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.loginSubtitle')}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.emailLabel')}</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.passwordLabel')}</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-600 disabled:opacity-60 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
            >
              {submitting ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          {/* Google OAuth */}
          <GoogleSignIn
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText={t('auth.continueWithGoogle')}
          />

          <div className="text-sm text-gray-600 mt-4 text-center">
            {t('auth.noAccount')} <Link to="/signup" className="text-primary font-medium">{t('auth.signupCta')}</Link>
          </div>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default LoginPage;


