import React from 'react';
import { PencilIcon, TrashIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const VenueItem = ({ venue, onEdit, onDelete }) => {
  // Convert time in HHMM format to a readable string
  const formatTimeDisplay = (time) => {
    if (time === undefined || time === null) return 'N/A';
    
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    
    let period = 'AM';
    let displayHours = hours;
    
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) {
        displayHours = hours - 12;
      }
    }
    if (displayHours === 0) {
      displayHours = 12;
    }
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Venue #{venue.id}</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(venue)}
            className="inline-flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(venue.id)}
            className="inline-flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {venue.location && (
          <div className="flex items-center text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{venue.location}</span>
          </div>
        )}
        
        {venue.email && (
          <div className="flex items-center text-gray-500">
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{venue.email}</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-500">
          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {formatTimeDisplay(venue.openingTime)} - {formatTimeDisplay(venue.closingTime)}
          </span>
        </div>
      </div>
      
      {/* Display information about courts at this venue */}
      {venue.courts && venue.courts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Courts: {venue.courts.length}</p>
        </div>
      )}
    </div>
  );
};

export default VenueItem;