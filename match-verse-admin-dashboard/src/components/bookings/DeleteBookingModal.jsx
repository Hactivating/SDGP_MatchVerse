import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const DeleteBookingModal = ({ isOpen, onClose, onDelete, bookingInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await onDelete(bookingInfo);
      // Modal will be closed by the parent component
    } catch (err) {
      setError(err.message || 'Failed to delete booking');
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !bookingInfo) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="bg-red-50 px-4 py-3 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-red-900 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
            Delete Booking
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={handleClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 pt-5 pb-4 sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Are you sure you want to delete this booking?
              </h3>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Court:</span> {bookingInfo?.courtName}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Date:</span> {bookingInfo?.date}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {bookingInfo?.startingTime}
                </p>
              </div>
              
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            type="button"
            variant="danger"
            className="w-full sm:w-auto sm:ml-3"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Booking'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full sm:mt-0 sm:w-auto"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteBookingModal;