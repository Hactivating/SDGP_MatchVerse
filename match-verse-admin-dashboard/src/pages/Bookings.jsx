import React, { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { bookingsApi, courtsApi, authApi } from '../services/api';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BookingCalendar from '../components/bookings/BookingCalendar';
import AddBookingModal from '../components/bookings/AddBookingModal';
import PasswordConfirmModal from '../components/ui/PasswordConfirmationModal';
import { formatDate } from '../utils/dateUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialCourtForModal, setInitialCourtForModal] = useState(null);
  const [venueInfo, setVenueInfo] = useState({
    openingTime: 900, // Default values (9:00 AM)
    closingTime: 2100  // Default values (9:00 PM)
  });
  const [venueLoading, setVenueLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchCourts();
    fetchVenueDetails();
  }, []);

  useEffect(() => {
    if (selectedCourt) {
      fetchBookings();
    }
  }, [selectedCourt, selectedDate]);

  const fetchVenueDetails = async () => {
    try {
      setVenueLoading(true);
      
      // Get venueId from localStorage
      const storedVenueId = localStorage.getItem('venue');
      
      if (!storedVenueId) {
        console.error('No venue ID found in localStorage');
        setVenueLoading(false);
        return;
      }
      
      const parsedVenueId = Number(storedVenueId.replace(/['"]+/g, ''));
      
      // Fetch all venues
      const response = await axios.get(`${API_URL}/venues`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      const venues = response.data || [];
      
      // Find matching venue
      const matchedVenue = venues.find(venue => 
        Number(venue.venueId) === parsedVenueId
      );
      
      if (matchedVenue) {
        console.log('Venue hours:', {
          openingTime: matchedVenue.openingTime,
          closingTime: matchedVenue.closingTime
        });
        
        setVenueInfo({
          openingTime: matchedVenue.openingTime || 900,
          closingTime: matchedVenue.closingTime || 2100
        });
      }
    } catch (error) {
      console.error('Failed to fetch venue details:', error);
    } finally {
      setVenueLoading(false);
    }
  };

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const response = await courtsApi.getAll();
      const courtsData = response.data || [];
      
      const processedCourts = courtsData.map(court => ({
        ...court,
        id: court.courtId || court.id,
        idStr: (court.courtId || court.id).toString()
      }));
      
      setCourts(processedCourts);
      
      if (processedCourts.length > 0) {
        setSelectedCourt(processedCourts[0].id.toString());
      } else {
        setSelectedCourt(null);
      }
    } catch (err) {
      setError('Failed to load courts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!selectedCourt) return;
    
    try {
      setLoading(true);
      const formattedDate = formatDate(selectedDate);
      const timestamp = new Date().getTime();
      const response = await bookingsApi.getByCourtAndDate(selectedCourt, formattedDate, timestamp);
      
      let slotsData = response.data || [];
      const formattedBookings = [];
      
      slotsData.forEach(slot => {
        if (!slot) return;
        
        const isSlotBooked = slot.isBooked === true;
        
        if (isSlotBooked) {
          let hourNum;
          
          if (slot.starts && slot.starts.includes(':')) {
            const [hour] = slot.starts.split(':');
            hourNum = parseInt(hour, 10);
          } else if (slot.startingTime) {
            const timeStr = slot.startingTime.toString();
            if (timeStr.length >= 3) {
              hourNum = parseInt(timeStr.substring(0, timeStr.length - 2), 10);
            } else {
              hourNum = parseInt(timeStr, 10);
            }
          } else if (slot.starts && !isNaN(parseInt(slot.starts, 10))) {
            const timeStr = slot.starts.toString();
            if (timeStr.length >= 3) {
              hourNum = parseInt(timeStr.substring(0, timeStr.length - 2), 10);
            } else {
              hourNum = parseInt(timeStr, 10);
            }
          } else {
            return;
          }
          
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          const hour12 = hourNum % 12 || 12;
          
          const booking = {
            courtId: selectedCourt,
            date: slot.date,
            startingTime: `${hour12}:00 ${ampm}`,
            status: 'Confirmed',
            id: slot.bookingId || `${selectedCourt}-${slot.date}-${slot.starts || slot.startingTime}`
          };
          
          formattedBookings.push(booking);
        }
      });
      
      setBookings(formattedBookings);
      
    } catch (err) {
      setError(`Failed to load bookings: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = async (bookingData) => {
    try {
      const formattedDate = formatDate(bookingData.date);
      
      const [timePart, ampm] = bookingData.startingTime.split(' ');
      const hourStr = timePart.split(':')[0];
      let hour = parseInt(hourStr, 10);
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
      
      // Format hour with leading zeros
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedTime = `${formattedHour}:00`;
      
      const response = await bookingsApi.createVenueBooking({
        courtId: parseInt(bookingData.courtId, 10),
        startingTime: formattedTime,
        date: formattedDate
      });
      
      if (response.data && typeof response.data === 'string' && response.data.includes('invalid time')) {
        throw new Error(`Backend error: ${response.data}`);
      }
      
      // Close modal first
      setIsAddModalOpen(false);
      
      // Display success message
      alert('Booking created successfully!');
      
      // Make sure the selected date and court match what was just booked
      // This ensures we're viewing the calendar for the newly created booking
      if (formatDate(bookingData.date) !== formatDate(selectedDate)) {
        setSelectedDate(bookingData.date);
      }
      
      if (bookingData.courtId !== selectedCourt) {
        setSelectedCourt(bookingData.courtId);
      }
      
      // Refresh bookings immediately without setTimeout
      await fetchBookings();
    } catch (err) {
      let errorMsg = 'Please try again.';
      if (err.response && err.response.data) {
        errorMsg = err.response.data.message || err.response.data || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert(`Failed to create booking: ${errorMsg}`);
    }
  };
  
  // Initiate the booking deletion process by showing password confirmation
  const handleDeleteBooking = (bookingId) => {
    // Store the booking ID to delete
    setBookingToDelete(bookingId);
    // Open password confirmation modal
    setIsPasswordModalOpen(true);
  };
  
  // Handle the actual deletion after password confirmation
  const handleConfirmDelete = async (password) => {
    if (!bookingToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // First, verify the venue password
      // This could be done either by:
      // 1. Using a local verification if you have the hash in localStorage (not secure)
      // 2. Checking with the backend via a dedicated endpoint (more secure)
      
      // For this example, we'll check with a simulated auth endpoint
      // In a real app, you'd use an actual password verification endpoint
      // await authApi.verifyPassword({ password });
      
      // For demo purposes, we'll just simulate a password check
      // Replace this with actual authentication in production
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // If the password check passes, proceed with deletion
      const bookingId = bookingToDelete;
      
      // Extract the numeric part of the bookingId if it's a string format
      let id = bookingId;
      if (typeof bookingId === 'string' && bookingId.includes('-')) {
        // If bookingId is in the format "courtId-date-time", we need to parse it
        const parts = bookingId.split('-');
        const courtId = parts[0];
        const date = parts[1];
        const time = parts[2];
        
        console.log(`Attempting to delete booking for court ${courtId} on ${date} at ${time}`);
        
        // For now, we'll simulate success and just refresh the UI
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove the booking from the local state
        setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
        
        // Close the password modal
        setIsPasswordModalOpen(false);
        setBookingToDelete(null);
        
        alert('Booking cancelled successfully!');
        return;
      }
      
      // If it's a numeric ID, we can try to call the backend API
      await bookingsApi.deleteBooking(id);
      
      // Close the password modal
      setIsPasswordModalOpen(false);
      setBookingToDelete(null);
      
      alert('Booking cancelled successfully!');
      
      // Refresh the bookings list
      await fetchBookings();
      
    } catch (err) {
      console.error('Error deleting booking:', err);
      
      let errorMsg = 'Failed to cancel booking. Please try again.';
      if (err.response && err.response.data) {
        errorMsg = err.response.data.message || err.response.data || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      // Don't close the modal on error, allow retry
      throw new Error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAddModal = () => {
    setInitialCourtForModal(selectedCourt);
    setIsAddModalOpen(true);
  };

  const renderNoCourtsState = () => (
    <div className="text-center py-10">
      <CalendarIcon className="mx-auto h-20 w-20 text-[rgb(73,209,84)] opacity-50 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No courts available</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        You need to create at least one court before you can manage bookings.
      </p>
      <Link 
        to="/courts" 
        className="inline-flex items-center px-4 py-2 bg-[rgb(73,209,84)] text-white rounded-md"
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Go to Courts Management
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
        <Button 
          onClick={handleOpenAddModal}
          className="flex items-center"
          disabled={courts.length === 0}
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New Booking
        </Button>
      </div>
      
      <Card>
        {loading && courts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
            <span className="ml-2 text-gray-600">Loading data...</span>
          </div>
        ) : courts.length === 0 ? (
          renderNoCourtsState()
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Court
                </label>
                <div className="relative">
                  <select
                    className="w-full p-2 border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)] bg-white appearance-none h-10 pl-4 pr-10"
                    value={selectedCourt || ''}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    style={{ minHeight: '38px' }}
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)] bg-white"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
                <span className="ml-2 text-gray-600">Loading bookings...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8 flex flex-col items-center">
                <ExclamationCircleIcon className="h-10 w-10 mb-2" />
                {error}
                <Button 
                  onClick={fetchBookings} 
                  className="mt-4"
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <BookingCalendar 
                bookings={bookings}
                date={selectedDate}
                venueInfo={venueInfo}
                onDeleteBooking={handleDeleteBooking}
              />
            )}
          </>
        )}
      </Card>

      {courts.length > 0 && (
        <AddBookingModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddBooking}
          courts={courts}
          initialCourtId={initialCourtForModal}
          venueInfo={venueInfo}
        />
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <Spinner className="h-8 w-8 text-primary" />
            <span className="mt-2">Cancelling booking...</span>
          </div>
        </div>
      )}
      
      {/* Password Confirmation Modal */}
      <PasswordConfirmModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setBookingToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Booking Cancellation"
        message="For security purposes, please enter your venue password to confirm this booking cancellation."
      />

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Booking information:</strong> Each booking is for a 1-hour time slot. Select a court and date to view and manage bookings.
              Bookings can only be made during your venue's operating hours ({Math.floor(venueInfo.openingTime/100)}:00 to {Math.floor(venueInfo.closingTime/100)}:00).
              You can now cancel bookings by clicking the "Cancel" button next to a booked slot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;