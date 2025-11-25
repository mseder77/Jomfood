import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import msTranslations from './locales/ms.json';
import enTranslations from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ms: {
        translation: msTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    fallbackLng: 'en', // Use English as base language - Google Translate will translate the page
    lng: 'en', // Fixed to English - Google Translate handles translation
    debug: false,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

