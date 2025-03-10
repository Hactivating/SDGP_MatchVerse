import React, { useState, useEffect } from 'react';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { venuesApi } from '../services/api';
import VenueList from '../components/venues/VenueList';
import AddVenueModal from '../components/venues/AddVenueModal';
import EditVenueModal from '../components/venues/EditVenueModal';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await venuesApi.getAll();
      setVenues(response.data || []);
    } catch (err) {
      console.error('Failed to fetch venues data:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (venueData) => {
    try {
      const response = await venuesApi.create(venueData);
      setVenues([...venues, response.data]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to add venue:', err);
      alert('Failed to create venue. Please try again.');
    }
  };

  const handleEditVenue = async (venueData) => {
    try {
      const response = await venuesApi.update(currentVenue.id, venueData);
      setVenues(venues.map(venue => 
        venue.id === currentVenue.id ? response.data : venue
      ));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update venue:', err);
      alert('Failed to update venue. Please try again.');
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await venuesApi.delete(venueId);
        setVenues(venues.filter(venue => venue.id !== venueId));
      } catch (err) {
        console.error('Failed to delete venue:', err);
        alert('Failed to delete venue. Please try again.');
      }
    }
  };

  const openEditModal = (venue) => {
    setCurrentVenue(venue);
    setIsEditModalOpen(true);
  };

  const renderEmptyState = () => (
    <div className="text-center py-10">
      <BuildingOfficeIcon className="mx-auto h-20 w-20 text-[rgb(73,209,84)] opacity-50 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Venues are locations where your indoor courts are hosted. Start by adding your first venue.
      </p>
      <Button 
        onClick={() => setIsAddModalOpen(true)}
        className="flex items-center mx-auto"
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Add Your First Venue
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Venues Management</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New Venue
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
          <span className="ml-2 text-gray-600">Loading venues...</span>
        </div>
      ) : error ? (
        <Card>
          <div className="text-red-500 text-center py-8">
            {error}
            <Button 
              onClick={fetchVenues} 
              className="mt-4"
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          {venues.length === 0 ? renderEmptyState() : (
            <VenueList 
              venues={venues} 
              onEdit={openEditModal}
              onDelete={handleDeleteVenue}
            />
          )}
        </Card>
      )}

      <AddVenueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVenue}
      />

      <EditVenueModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEditVenue}
        venue={currentVenue}
      />

      {/* Onboarding tip for new users */}
      {venues.length === 0 && !loading && !error && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Getting started:</strong> First, create venues where your courts are located. 
                Then, you'll be able to add courts to these venues and manage bookings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;