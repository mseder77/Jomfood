import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const AutoOpener = ({ 
  items, 
  itemId, 
  onClose, 
  ModalComponent, 
  itemKey = '_id',
  itemPropName = 'item',
  additionalProps = {},
  fetchItemById = null
}) => {
  const [showModal, setShowModal] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      // First, try to find the item in the current items array
      if (items.length > 0) {
        const item = items.find(item => item[itemKey] === itemId);
        if (item) {
          setTargetItem(item);
          setShowModal(true);
          return;
        }
      }

      // If not found in current items and we have a fetch function, fetch it
      if (fetchItemById) {
        setLoading(true);
        fetchItemById(itemId)
          .then(item => {
            if (item) {
              setTargetItem(item);
              setShowModal(true);
            }
          })
          .catch(error => {
            console.error('Error fetching item by ID:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [itemId, items, itemKey, fetchItemById]);

  const handleClose = () => {
    setShowModal(false);
    setTargetItem(null);
    onClose();
  };

  // Show loading state if we're fetching the item
  if (loading) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-gray-700">Loading deal...</span>
        </div>
      </div>,
      document.body
    );
  }

  if (!showModal || !targetItem || !ModalComponent) return null;

  return createPortal(
    <ModalComponent
      {...{ [itemPropName]: targetItem }}
      onClose={handleClose}
      {...additionalProps}
    />,
    document.body
  );
};

export default AutoOpener;
