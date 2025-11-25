import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchInput = ({ 
  placeholder, 
  onSearch, 
  className = "",
  showButton = true,
  buttonText
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder || t('common.searchPlaceholderGeneral')}
            className="w-full px-6 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 border-0"
          />
        </div>
        
        {/* Search Button */}
        {showButton && (
          
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 mr-1 bg-primary hover:bg-primary-600 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">{buttonText || t('common.search')}</span>
          </button>
          
        )}
      </div>
    </form>
  );
};

export default SearchInput;
