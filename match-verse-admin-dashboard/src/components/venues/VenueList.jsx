import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const VenueList = ({ venues, onEdit, onDelete }) => {
  if (!venues || venues.length === 0) {
    return (
      <div className="text-center py-8 text-[#6b7280]">
        <p className="mb-2">No venues found.</p>
        <p className="text-sm">Add your first venue using the "Add New Venue" button above.</p>
      </div>
    );
  }

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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#e5e7eb]">
        <thead className="bg-[#f9fafb]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Hours
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#e5e7eb]">
          {venues.map((venue) => (
            <tr key={venue.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b7280]">
                {venue.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1f2937]">
                {venue.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b7280]">
                {venue.location || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b7280]">
                {formatTimeDisplay(venue.openingTime)} - {formatTimeDisplay(venue.closingTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(venue)}
                    className="inline-flex items-center border border-[#d1d5db] bg-white hover:bg-[#f9fafb] text-[#4b5563]"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(venue.id)}
                    className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VenueList;