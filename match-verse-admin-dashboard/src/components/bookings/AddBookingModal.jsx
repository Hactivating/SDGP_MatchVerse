import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getTimeSlots, formatDate, convertHHMMToHour, formatTime } from '../../utils/dateUtils';

const AddBookingModal = ({ isOpen, onClose, onAdd, courts, initialCourtId, venueInfo }) => {
  const [formData, setFormData] = useState({
    courtId: '',
    date: new Date(),
    startingTime: ''
  });
  
  // Array of time slots based on venue hours
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    if (isOpen && initialCourtId) {
      setFormData(prev => ({
        ...prev,
        courtId: initialCourtId
      }));
    }
  }, [isOpen, initialCourtId]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(prev => ({
        courtId: prev.courtId,
        date: new Date(),
        startingTime: ''
      }));
    }
  }, [isOpen]);

  // Update time slots when venue info changes
  useEffect(() => {
    if (venueInfo) {
      // Convert HHMM format to hours
      const openingHour = convertHHMMToHour(venueInfo.openingTime || 900); // Default to 9 AM
      const closingHour = convertHHMMToHour(venueInfo.closingTime || 2100); // Default to 9 PM
      
      // Generate time slots
      const slots = getTimeSlots(openingHour, closingHour);
      setAvailableTimeSlots(slots);
      
      // Clear selected time if outside new venue hours
      if (formData.startingTime && !slots.includes(formData.startingTime)) {
        setFormData(prev => ({
          ...prev,
          startingTime: ''
        }));
      }
    }
  }, [venueInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  // Format time for display
  const formatVenueHours = () => {
    if (!venueInfo) return "Unknown";
    
    const openingHour = convertHHMMToHour(venueInfo.openingTime || 900);
    const closingHour = convertHHMMToHour(venueInfo.closingTime || 2100);
    
    return `${formatTime(openingHour)} to ${formatTime(closingHour)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Booking">
      <form id="add-booking-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="courtId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Court
            </label>
            <select
                id="courtId"
                name="courtId"
                required
                className="w-full p-2 border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)] appearance-none bg-white h-10 pl-4 pr-10"
                value={formData.courtId}
                onChange={handleChange}
              >
                <option value="">Select a court</option>
                {courts.map((court) => {
                  const courtId = court.id?.toString();
                  return (
                    <option key={courtId || `court-${court.name}`} value={courtId}>
                      {court.name}
                    </option>
                  );
                })}
              </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <div className="relative">
              <DatePicker
                id="date"
                selected={formData.date}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="w-full p-2 border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)] bg-white"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="startingTime" className="block text-sm font-medium text-gray-700 mb-1">
              Select Time
            </label>
            <div className="relative">
              <select
                id="startingTime"
                name="startingTime"
                required
                className="w-full p-2 border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)] appearance-none bg-white"
                value={formData.startingTime}
                onChange={handleChange}
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <ClockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            <p>Available booking hours: {formatVenueHours()}</p>
            <p className="mt-1 text-xs italic">Each booking is for a 1-hour time slot.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={!formData.courtId || !formData.startingTime}
          >
            Add Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBookingModal;