import React from 'react';
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const BookingCalendar = ({ bookings = [], date, venueInfo, onDeleteBooking }) => {
  // Convert HHMM format to hours
  const convertTimeToHours = (timeInHHMM) => {
    const hours = Math.floor(timeInHHMM / 100);
    return hours;
  };
  
  // Use venue hours with fallback defaults
  const openingHour = convertTimeToHours(venueInfo?.openingTime || 900); // Default to 9 AM
  const closingHour = convertTimeToHours(venueInfo?.closingTime || 2100); // Default to 9 PM
  
  // Generate array of hours from opening to closing (inclusive for starting hour, exclusive for ending hour)
  const hours = Array.from(
    { length: closingHour - openingHour }, 
    (_, i) => i + openingHour
  );
  
  const formatDisplayTime = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${ampm}`;
  };

  const getBookingForTime = (hour) => {
    const timeStr = formatDisplayTime(hour);
    return bookings.find(booking => booking.startingTime === timeStr);
  };

  const handleDeleteBooking = (bookingId) => {
    onDeleteBooking(bookingId);
  };

  // Function to render user information safely
  const renderUserInfo = (booking) => {
    if (!booking || !booking.userId) {
      return (
        <div className="text-sm text-[#6b7280]">
          Venue Admin Booking
        </div>
      );
    }
    
    if (booking.userInfo) {
      // User info is available
      const user = booking.userInfo;
      return (
        <div className="text-sm text-[#6b7280]">
          <div>
            {user.username || `User #${booking.userId}`}
          </div>
          {user.email && (
            <div className="text-xs text-gray-500">
              {user.email}
            </div>
          )}
        </div>
      );
    }
    
    // Fallback to just showing the userId
    return (
      <div className="text-sm text-[#6b7280]">
        User ID: {booking.userId}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-[#1f2937]">
        Booking Schedule for {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </h2>
      
      <div className="bg-[#f9fafb] rounded-lg p-4">
        <div className="grid grid-cols-1 gap-2">
          {hours.map((hour) => {
            const booking = getBookingForTime(hour);
            const isBooked = !!booking;
            
            return (
              <div 
                key={hour} 
                className={`flex items-center p-3 rounded-md ${
                  isBooked 
                  ? 'bg-[rgba(73,209,84,0.1)] border border-[rgb(73,209,84)]' 
                  : 'bg-white border border-[#e5e7eb]'
                }`}
              >
                <div className="w-24 font-medium text-[#4b5563]">
                  <ClockIcon className="h-4 w-4 inline mr-1 text-[#6b7280]" />
                  {formatDisplayTime(hour)}
                </div>
                
                {isBooked ? (
                  <div className="ml-4 flex-1 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[rgb(73,209,84)]">Booked</div>
                      {/* Display user information */}
                      {renderUserInfo(booking)}
                      <div className="text-sm text-[#6b7280]">
                        Court: {booking.courtName || booking.courtId}
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="ml-2 inline-flex items-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="ml-4 text-[#6b7280]">Available</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-[#6b7280]">
        <div>
          <span className="inline-block w-3 h-3 bg-[rgba(73,209,84,0.1)] border border-[rgb(73,209,84)] rounded-sm mr-1"></span>
          Booked
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-white border border-[#e5e7eb] rounded-sm mr-1"></span>
          Available
        </div>
      </div>
      
      <div className="text-sm text-[#6b7280] italic mt-2">
        Operating hours: {formatDisplayTime(openingHour)} - {formatDisplayTime(closingHour)}
      </div>
    </div>
  );
};

export default BookingCalendar;