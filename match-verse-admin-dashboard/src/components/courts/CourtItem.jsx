import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const CourtItem = ({ court, onDelete }) => {
  // Handle both potential ID field names
  const courtId = court.courtId || court.id;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{court.name}</h3>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="block">ID: {courtId}</span>
          <span className="block">Venue: {court.venue?.location || `Venue #${court.venueId}` || 'Not assigned'}</span>
        </div>
        
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(courtId)}
          className="inline-flex items-center"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default CourtItem;