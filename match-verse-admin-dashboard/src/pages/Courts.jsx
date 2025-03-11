import React, { useState, useEffect } from 'react';
import { PlusIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { courtsApi } from '../services/api';
import CourtList from '../components/courts/CourtList';
import AddCourtModal from '../components/courts/AddCourtModal';

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [venueId, setVenueId] = useState(null);

  // Function to get the venue ID from localStorage
  const getVenueIdFromStorage = () => {
    try {
      console.log('All localStorage items:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }

      // Directly get venue value
      const venueId = localStorage.getItem('venue');
      console.log('Raw venue ID:', venueId);

      // Convert to number if it's a string representation of a number
      const parsedVenueId = venueId ? Number(venueId) : null;
      
      console.log('Parsed Venue ID:', parsedVenueId);

      return parsedVenueId;
    } catch (err) {
      console.error('Error getting venue ID from storage:', err);
      return null;
    }
  };

  useEffect(() => {
    // Get venue ID when component mounts
    const storedVenueId = getVenueIdFromStorage();
    console.log('Stored Venue ID in useEffect:', storedVenueId);
    setVenueId(storedVenueId);
  }, []);

  useEffect(() => {
    // Only fetch courts if venue ID is available
    if (venueId) {
      console.log('Fetching courts for venueId:', venueId);
      fetchCourts();
    } else {
      console.warn('No venue ID available');
      setLoading(false);
      setError('No venue information found. Please log in.');
    }
  }, [venueId]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Log current venue ID
      console.log('Current Venue ID in fetchCourts:', venueId);
  
      // Fetch courts for the current venue
      const courtsResponse = await courtsApi.getAll();
      console.log('Courts Response:', courtsResponse);
      
      // Process courts data
      let courtsData = courtsResponse.data || [];
      console.log('All Courts:', courtsData);
      
      // Extra verification of venue ID
      courtsData = courtsData.filter(court => {
        const isMatch = Number(court.venueId) === Number(venueId);
        console.log(`Court ${court.id} venue check:`, {
          courtVenueId: court.venueId, 
          currentVenueId: venueId, 
          match: isMatch
        });
        return isMatch;
      });
      
      console.log('Filtered Courts:', courtsData);
      
      setCourts(courtsData);
    } catch (err) {
      console.error('Failed to fetch courts data:', err);
      
      // More detailed error handling
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to load courts data';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  const handleAddCourt = async (courtData) => {
    try {
      if (!venueId) {
        throw new Error('Cannot create court: No venue found');
      }

      // Ensure court is created for the current venue
      const dataToSend = {
        name: courtData.name,
        venueId: Number(venueId)
      };

      const response = await courtsApi.create(dataToSend);
      setCourts([...courts, response.data]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to add court:', err);
      alert('Failed to create court: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleDeleteCourt = async (courtId) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        // Find the court to verify ownership
        const courtToDelete = courts.find(court => {
          const id = court.courtId || court.id;
          return id === courtId;
        });
        
        if (!courtToDelete) {
          throw new Error('Court not found');
        }
        
        // Verify this court belongs to the current venue
        if (Number(courtToDelete.venueId) !== Number(venueId)) {
          throw new Error('You can only delete courts from your own venue');
        }
        
        await courtsApi.delete(courtId);
        
        // Update the local state
        setCourts(courts.filter(court => {
          const id = court.courtId || court.id;
          return id !== courtId;
        }));
      } catch (err) {
        console.error('Failed to delete court:', err);
        alert('Failed to delete court: ' + (err.message || 'Please try again.'));
      }
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-10">
      <TableCellsIcon className="mx-auto h-20 w-20 text-[rgb(73,209,84)] opacity-50 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No courts found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Courts are spaces where activities happen. Add your first court to start managing bookings.
      </p>
      <Button 
        onClick={() => setIsAddModalOpen(true)}
        className="flex items-center mx-auto"
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Add Your First Court
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Courts Management</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center"
          disabled={!venueId}
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New Court
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
          <span className="ml-2 text-gray-600">Loading courts...</span>
        </div>
      ) : error ? (
        <Card>
          <div className="text-red-500 text-center py-8">
            {error}
            {venueId && (
              <Button 
                onClick={fetchCourts} 
                className="mt-4"
                variant="secondary"
              >
                Try Again
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          {courts.length === 0 ? renderEmptyState() : 
           <CourtList courts={courts} onDelete={handleDeleteCourt} />
          }
        </Card>
      )}

      {venueId && (
        <AddCourtModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCourt}
          venueId={venueId}
        />
      )}
    </div>
  );
};

export default Courts;