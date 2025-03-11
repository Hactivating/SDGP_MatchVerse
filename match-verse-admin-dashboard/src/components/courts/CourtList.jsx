import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const CourtList = ({ courts, onDelete }) => {
  if (!courts || courts.length === 0) {
    return (
      <div className="text-center py-8 text-[#6b7280]">
        <p className="mb-2">No courts found.</p>
        <p className="text-sm">Add your first court using the "Add New Court" button above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#e5e7eb]">
        <thead className="bg-[#f9fafb]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Court Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Venue
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#e5e7eb]">
          {courts.map((court) => {
            // Handle both potential ID field names
            const courtId = court.courtId || court.id;
            
            return (
              <tr key={courtId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b7280]">
                  {courtId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1f2937]">
                  {court.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b7280]">
                  {court.venue?.location || `Venue #${court.venueId}` || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(courtId)}
                    className="inline-flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CourtList;