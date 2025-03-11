import React from 'react';
import { TrashIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { formatTime } from '../../utils/dateUtils';

const BookingList = ({ bookings, onCancel }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bookings found for the selected date and court.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div 
          key={booking.id}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Booking #{booking.id}
              </h3>
              
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{booking.startingTime}</span>
                </div>
                
                {booking.userId && (
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>User ID: {booking.userId}</span>
                  </div>
                )}
                
                {!booking.userId && (
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Venue Admin Booking</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
                {booking.status || 'Confirmed'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(booking.id)}
              className="inline-flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Cancel Booking
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingList;