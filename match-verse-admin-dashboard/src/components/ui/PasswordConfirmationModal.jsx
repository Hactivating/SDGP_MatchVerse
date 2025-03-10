import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ExclamationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const PasswordConfirmModal = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Please enter your password to confirm this action." }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Pass the password to the parent component for verification
      await onConfirm(password);
      
      // Reset form if successful
      setPassword('');
    } catch (err) {
      setError(err.message || 'Invalid password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-gray-600 mb-4">{message}</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center relative">
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)]"
                placeholder="Enter your venue password"
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!password.trim() || isSubmitting}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordConfirmModal;