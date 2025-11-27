import { useState, useEffect, useRef } from 'react';
import { Languages, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ms'); // Track Google Translate language (en = no translation, ms = Malay) - Default to Malay
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  // Get current language from Google Translate or localStorage
  useEffect(() => {
    // Check localStorage for saved language preference, default to Malay
    const savedLang = localStorage.getItem('google_translate_lang') || 'ms';
    setCurrentLang(savedLang);
    
    // Also check if Google Translate has already set a language
    const checkGoogleTranslateLang = () => {
      try {
        const select = document.querySelector('.goog-te-combo');
        if (select && select.value) {
          const lang = select.value === 'en' ? 'en' : (select.value === 'ms' ? 'ms' : 'en');
          setCurrentLang(lang);
          localStorage.setItem('google_translate_lang', lang);
        } else {
          // If Google Translate is ready but no language set, apply saved language (default to Malay)
          if (window.triggerGoogleTranslate) {
            setTimeout(() => {
              window.triggerGoogleTranslate(savedLang);
            }, 500);
          }
        }
      } catch (error) {
        console.warn('Error checking Google Translate language:', error);
      }
    };
    
    // Listen for Google Translate ready event
    const handleGoogleTranslateReady = () => {
      checkGoogleTranslateLang();
    };
    
    window.addEventListener('googleTranslateReady', handleGoogleTranslateReady);
    
    // Check immediately and after delays (Google Translate loads async)
    checkGoogleTranslateLang();
    const timer = setTimeout(checkGoogleTranslateLang, 500);
    const timer2 = setTimeout(checkGoogleTranslateLang, 1500);
    const timer3 = setTimeout(checkGoogleTranslateLang, 3000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('googleTranslateReady', handleGoogleTranslateReady);
    };
  }, []);

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]; // Default to first (Malay)

  const changeLanguage = (langCode) => {
    // Prevent any URL changes
    if (window.history && window.history.replaceState) {
      // Remove any existing hash
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    
    // Save to localStorage
    localStorage.setItem('google_translate_lang', langCode);
    setCurrentLang(langCode);
    
    // Trigger Google Translate
    const triggerTranslation = () => {
      // Use the global function which has built-in retry logic
      if (window.triggerGoogleTranslate) {
        window.triggerGoogleTranslate(langCode);
      } else {
        // Fallback: wait for the function to be available
        const checkForFunction = (attempt = 0) => {
          if (attempt >= 20) {
            console.warn('Google Translate function not available after multiple attempts');
            return;
          }
          
          if (window.triggerGoogleTranslate) {
            window.triggerGoogleTranslate(langCode);
          } else {
            setTimeout(() => checkForFunction(attempt + 1), 200);
          }
        };
        checkForFunction();
      }
    };
    
    // Start triggering
    triggerTranslation();
    
    setIsOpen(false);
    
    // Ensure URL doesn't have hash after a short delay
    setTimeout(() => {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative notranslate" ref={dropdownRef} translate="no">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary transition-colors text-sm font-medium notranslate"
        aria-label="Switch Language"
        translate="no"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline notranslate" translate="no">{currentLanguage.flag} {currentLanguage.name}</span>
        <span className="sm:hidden notranslate" translate="no">{currentLanguage.flag}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          />
          <div 
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 notranslate"
            translate="no"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  changeLanguage(lang.code);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 notranslate ${
                  currentLang === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                }`}
                translate="no"
              >
                <span className="notranslate" translate="no">{lang.flag}</span>
                <span className="notranslate" translate="no">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

