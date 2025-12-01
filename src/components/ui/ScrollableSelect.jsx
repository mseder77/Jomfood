import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable scrollable select/dropdown component.
 *
 * Props:
 * - label: string (optional, if you want to render label outside, skip this)
 * - value: string | number
 * - onChange: (value) => void
 * - options: Array<{ label: string, value: string | number }>
 * - placeholder: string
 * - className: string (optional, wrapper)
 * - maxVisibleItems: number (used to approximate panel height; default 4)
 * - searchable: boolean (show search input inside dropdown; default false)
 * - searchPlaceholder: string (placeholder for search box)
 */
const ScrollableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  maxVisibleItems = 4,
  searchable = false,
  searchPlaceholder = 'Type to search...',
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const displayText =
    searchable && (open || searchTerm)
      ? searchTerm
      : selectedOption
      ? selectedOption.label
      : '';

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleOptionClick = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      setSearchTerm('');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOptions =
    !searchable || !normalizedSearch
      ? options
      : options.filter((opt) =>
          String(opt.label).toLowerCase().includes(normalizedSearch)
        );

  // Rough height per item for max-height calculation (px)
  const itemHeight = 40; // 2.5rem approx
  const maxHeight = maxVisibleItems * itemHeight;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="w-full flex items-center rounded border border-gray-300 bg-white outline-none focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-400"
        onClick={() => {
          if (!open) {
            setOpen(true);
          }
        }}
      >
        <input
          type="text"
          value={displayText}
          onChange={(e) => {
            if (!searchable) return;
            const text = e.target.value;
            setSearchTerm(text);
            if (!open) setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none focus:outline-none"
          readOnly={!searchable}
        />
        <button
          type="button"
          className="px-2 pr-3 text-gray-500 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
        >
          <svg
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto"
          style={{ maxHeight }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options</div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  handleOptionClick(opt.value);
                  if (searchable) {
                    setSearchTerm(opt.label);
                  }
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  opt.value === value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ScrollableSelect;


