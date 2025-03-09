import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const AddVenueModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    location: '',
    openingTime: 900, // Default to 9:00 AM
    closingTime: 1800 // Default to 6:00 PM
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    // Convert HH:MM to HHMM integer format
    const [hours, minutes] = value.split(':');
    const timeValue = parseInt(hours) * 100 + parseInt(minutes);
    setFormData({
      ...formData,
      [name]: timeValue
    });
  };

  // Convert time in HHMM format to HH:MM for display
  const formatTimeForInput = (time) => {
    const hours = Math.floor(time / 100).toString().padStart(2, '0');
    const minutes = (time % 100).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAdd(formData);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        location: '',
        openingTime: 900,
        closingTime: 1800
      });
    } catch (error) {
      console.error('Error adding venue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Venue"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-venue-form"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Venue'}
          </Button>
        </>
      }
    >
      <form id="add-venue-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. contact@venue.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              className="input"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. 123 Sports Street, City"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700 mb-1">
                Opening Time
              </label>
              <input
                type="time"
                id="openingTime"
                name="openingTime"
                required
                className="input"
                value={formatTimeForInput(formData.openingTime)}
                onChange={handleTimeChange}
              />
            </div>
            
            <div>
              <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                id="closingTime"
                name="closingTime"
                required
                className="input"
                value={formatTimeForInput(formData.closingTime)}
                onChange={handleTimeChange}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddVenueModal;