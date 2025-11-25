import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, LogIn } from 'lucide-react';
import { reservation } from '../../utils/reservation';

const LoginRequiredModal = ({ 
  isOpen, 
  onClose, 
  module, 
  itemName, 
  itemId, 
  returnPath = '' 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    reservation.saveReservation(module, itemId, itemName);
    onClose();
    navigate(reservation.buildLoginUrl(module, itemId, itemName, returnPath));
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-[#FF1744] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Login Required
            </h3>
            <p className="text-gray-600 mb-6">
              Please log in to {module === 'deal' ? 'claim' : 'access'} <strong>"{itemName}"</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 bg-gradient-to-r from-primary to-[#FF1744] hover:from-primary-600 hover:to-[#E01535] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginRequiredModal;