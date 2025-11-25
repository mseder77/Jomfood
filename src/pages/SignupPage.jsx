import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { api } from '../utils/api';
import { googleOAuthAPI } from '../utils/api';
import { useUser } from '../context/UserContext';
import { authStorage } from '../utils/auth';
import jomfoodLogo from '../assets/JomFood.png';
import { toast } from '../utils/toast';
import CommonLayout from '../components/layout/CommonLayout';
import GoogleSignIn from '../components/auth/GoogleSignIn';

const initialForm = { name: '', email: '', password: '', phone: '' };

const SignupPage = () => {
  const navigate = useNavigate();
  const { reload } = useUser();
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error(t('auth.requiredSignupFields'));
      return;
    }
    if (!agreeToPrivacy) {
      toast.error('Please agree to the Privacy Policy to continue');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      };

      const res = await api.post('/auth/customer/register', payload);
      const name = res?.user?.name || t('auth.signupDefaultName');
      const email = res?.user?.email ? ` (${res.user.email})` : '';
      toast.success(t('auth.signupSuccess', { name, email }));
      // Do not store token on signup; we'll handle this on login
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err?.message || t('auth.registrationFailed');
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
        navigate('/');
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
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 text-center">{t('auth.createAccountTitle')}</h1>
          <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.signupSubtitle')}</p>

          {/* Inline error removed; we rely on toasts for notifications */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.emailLabel')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.passwordLabel')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phoneOptional')}</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('auth.phonePlaceholder')}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                />
              </div>
            </div>

            {/* Privacy Policy Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="privacy-policy"
                  name="privacy-policy"
                  type="checkbox"
                  checked={agreeToPrivacy}
                  onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary-200 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="privacy-policy" className="text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <Link 
                    to="/privacy-policy" 
                    target="_blank"
                    className="text-primary hover:text-primary-600 underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !agreeToPrivacy}
              className="w-full bg-primary hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium text-sm transition-colors"
            >
              {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
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

            <div className="text-sm text-gray-600 mt-2 text-center">
              {t('auth.haveAccount')} <Link to="/login" className="text-primary font-medium">{t('auth.loginCta')}</Link>
            </div>
            
            {/* Privacy Policy Link */}
            <div className="text-xs text-gray-500 mt-4 text-center">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default SignupPage;


