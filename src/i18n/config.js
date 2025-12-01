import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import malayTranslations from './locales/malay.json';
import enTranslations from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      malay: {
        translation: malayTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    fallbackLng: 'en',
    // lng: 'en', // REMOVED: Allow dynamic language switching via LanguageDetector
    // Google Translate was using fixed 'en' - now using i18n dynamic switching
    debug: false,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng' // i18n's default localStorage key
    }
  });

export default i18n;

