import { useState, useEffect, useRef } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
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

