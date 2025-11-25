import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  hasNext, 
  hasPrev, 
  onPageChange 
}) => {
  const { t } = useTranslation();
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-12 mb-8 animate-fadeIn">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
          hasPrev
            ? 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 shadow-md hover:shadow-xl'
            : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        {t('common.previous')}
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform ${
              page === currentPage
                ? 'bg-gradient-to-r from-primary to-[#FF1744] text-white shadow-lg scale-110'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:scale-105 shadow-md'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
          hasNext
            ? 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 shadow-md hover:shadow-xl'
            : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t('common.next')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;