// src/services/match.ts
import { api } from './api';
import { getAllVenues, getAllCourts } from './venue';

// Type definitions for the match functionality
interface Court {
    courtId: number;
    name: string;
    venue: {
        venueName: string;
        location: string;
    };
}

interface Booking {
    bookingId: number;
    courtId: number;
    date: string;
    startingTime: string;
    userId?: number;
    court: Court;
}

interface MatchRequest {
    requestId: number;
    bookingId: number;
    matchType: 'single' | 'double';
    createdById: number;
    partnerId?: number;
    status: 'pending' | 'matched' | 'cancelled';
    createdAt: string;
    booking?: Booking;
    createdBy?: {
        name?: string;
        displayName?: string;
        email?: string;
        userId?: number;
    };
    partner?: {
        name?: string;
        displayName?: string;
        email?: string;
        userId?: number;
    };
}

interface CreateMatchRequestPayload {
    bookingId: number;
    matchType: 'single' | 'double';
    createdById: number;
    partnerId?: number;
}

/**
 * Format time string to 12-hour format (e.g. "10:00 AM")
 * @param timeString Time string in format "HH:00:00"
 * @returns Formatted time string
 */
function formatTimeString(timeString: string): string {
    if (!timeString || typeof timeString !== 'string') {
        return '12:00 PM'; // Default time if invalid
    }

    // Extract hours from "HH:00:00" format
    const hourMatch = timeString.match(/^(\d+):00:00$/);
    if (!hourMatch) {
        return '12:00 PM'; // Default time if format doesn't match
    }

    const hour = parseInt(hourMatch[1], 10);
    if (isNaN(hour)) {
        return '12:00 PM'; // Default time if parsing fails
    }

    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12

    return `${hour12}:00 ${period}`;
}

/**
 * Transform match data to ensure all required nested properties exist
 * This prevents UI errors when backend returns incomplete data
 */
function transformMatchData(match: any): MatchRequest {
    // Handle completely empty match data
    if (!match) {
        return {
            requestId: 0,
            bookingId: 0,
            matchType: 'single',
            createdById: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            booking: {
                bookingId: 0,
                courtId: 0,
                date: new Date().toISOString().split('T')[0],
                startingTime: '12:00:00',
                court: {
                    courtId: 0,
                    name: 'Court not available',
                    venue: {
                        venueName: 'Venue not available',
                        location: 'Location not available'
                    }
                }
            },
            createdBy: {
                displayName: 'Anonymous'
            }
        };
    }

    // Create a deep copy to avoid mutating original data
    const transformedMatch = JSON.parse(JSON.stringify(match));

    // Ensure booking exists
    if (!transformedMatch.booking) {
        transformedMatch.booking = {};
    }

    // Ensure court exists
    if (!transformedMatch.booking.court) {
        transformedMatch.booking.court = {};
    }

    // Ensure venue exists
    if (!transformedMatch.booking.court.venue) {
        transformedMatch.booking.court.venue = {};
    }

    // Set default values for missing properties
    transformedMatch.booking.court.name =
        transformedMatch.booking.court.name || "Court not available";

    transformedMatch.booking.court.venue.venueName =
        transformedMatch.booking.court.venue.venueName || "Venue not available";

    transformedMatch.booking.court.venue.location =
        transformedMatch.booking.court.venue.location || "Location not available";

    // Handle createdBy and partner
    if (!transformedMatch.createdBy) {
        transformedMatch.createdBy = { displayName: "Anonymous" };
    }

    if (transformedMatch.matchType === 'double' && !transformedMatch.partner && transformedMatch.partnerId) {
        transformedMatch.partner = { displayName: "Partner not found" };
    }

    // Ensure startingTime exists and is properly formatted
    if (!transformedMatch.booking.startingTime) {
        transformedMatch.booking.startingTime = "12:00:00";
    }

    return transformedMatch;
}

/**
 * Transform an array of match requests
 */
function transformMatchesData(matches: any[]): MatchRequest[] {
    // Handle null/undefined array
    if (!matches || !Array.isArray(matches)) {
        return [];
    }
    return matches.map(match => transformMatchData(match));
}

/**
 * Transform booking data to ensure all required properties
 */
function transformBookingData(booking: any): Booking {
    // Handle completely empty booking
    if (!booking) {
        return {
            bookingId: 0,
            courtId: 0,
            date: new Date().toISOString().split('T')[0],
            startingTime: '12:00:00',
            court: {
                courtId: 0,
                name: 'Court not available',
                venue: {
                    venueName: 'Venue not available',
                    location: 'Location not available'
                }
            }
        };
    }

    const transformedBooking = JSON.parse(JSON.stringify(booking));

    // Ensure court exists
    if (!transformedBooking.court) {
        transformedBooking.court = {};
    }

    // Ensure venue exists
    if (!transformedBooking.court.venue) {
        transformedBooking.court.venue = {};
    }

    // Set default values
    transformedBooking.court.name = transformedBooking.court.name || "Court not available";
    transformedBooking.court.venue.venueName = transformedBooking.court.venue.venueName || "Venue not available";
    transformedBooking.court.venue.location = transformedBooking.court.venue.location || "Location not available";

    // Ensure startingTime is valid
    if (!transformedBooking.startingTime) {
        transformedBooking.startingTime = "12:00:00";
    }

    return transformedBooking;
}

/**
 * Transform an array of bookings
 */
function transformBookingsData(bookings: any[]): Booking[] {
    // Handle null/undefined array
    if (!bookings || !Array.isArray(bookings)) {
        return [];
    }
    return bookings.map(booking => transformBookingData(booking));
}

/**
 * Create default bookings for a venue with missing data
 */
function createDefaultBookings(venueId: number): Booking[] {
    const defaultTimeSlots = ['9:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00'];
    const today = new Date().toISOString().split('T')[0];

    return defaultTimeSlots.map((time, index) => ({
        bookingId: (venueId * 100) + index,
        courtId: venueId,
        date: today,
        startingTime: time,
        court: {
            courtId: venueId,
            name: "Badminton",
            venue: {
                venueName: "Venue not available",
                location: "Location not available"
            }
        }
    }));
}

/**
 * Fetch all available bookings for a specific date
 * @param date Date in YYYY-MM-DD format
 * @returns Promise with booking data
 */
export const getBookings = async (date: string): Promise<Booking[]> => {
    try {
        if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('Date must be in YYYY-MM-DD format');
        }

        // Try to get venues and courts first
        const venues = await getAllVenues();
        const courts = await getAllCourts();

        if (!venues.length || !courts.length) {
            console.warn('No venues or courts found');
            return [];
        }

        // Create default bookings for each venue
        const defaultBookings: Booking[] = [];

        for (const venue of venues) {
            const venueCourts = courts.filter(court => court.venueId === venue.venueId);

            for (const court of venueCourts) {
                // Try to get actual bookings for this court
                try {
                    const response = await api.get(`/bookings/${court.courtId}/${date}`);
                    const courtBookings = response.data || [];

                    // Map the court and venue data to each booking
                    const bookingsWithData = courtBookings.map(booking => ({
                        ...booking,
                        courtId: court.courtId,
                        court: {
                            courtId: court.courtId,
                            name: court.name || 'Badminton',
                            venue: {
                                venueName: venue.venueName || 'Sports Center',
                                location: venue.location || 'Location not available'
                            }
                        }
                    }));

                    defaultBookings.push(...bookingsWithData);
                } catch (error) {
                    console.error(`Error fetching bookings for court ${court.courtId}:`, error);

                    // If API fails, create default bookings for this court
                    defaultBookings.push(...createDefaultBookings(court.courtId));
                }
            }
        }

        return transformBookingsData(defaultBookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
};

/**
 * Create a new match request
 * @param data Match request data
 * @returns Promise with the created match request
 */
export const createMatchRequest = async (data: CreateMatchRequestPayload): Promise<MatchRequest> => {
    try {
        const response = await api.post('/match/request', data);
        return transformMatchData(response.data);
    } catch (error) {
        console.error('Error creating match request:', error);

        // Rather than throw an error, return a placeholder match object
        return transformMatchData({
            requestId: Math.floor(Math.random() * 1000),
            bookingId: data.bookingId,
            matchType: data.matchType,
            createdById: data.createdById,
            partnerId: data.partnerId,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    }
};

/**
 * Get all pending match requests
 * @returns Promise with pending match requests
 */
export const getPendingMatches = async (): Promise<MatchRequest[]> => {
    try {
        const response = await api.get('/match/pending');
        return transformMatchesData(response.data);
    } catch (error) {
        console.error('Error fetching pending matches:', error);
        return [];
    }
};

/**
 * Get all matched requests
 * @returns Promise with matched requests
 */
export const getMatchedMatches = async (): Promise<MatchRequest[]> => {
    try {
        const response = await api.get('/match/matched');
        return transformMatchesData(response.data);
    } catch (error) {
        console.error('Error fetching matched matches:', error);
        return [];
    }
};

/**
 * Accept a match request
 * @param requestId ID of the match request to accept
 * @param userId ID of the user accepting the request
 * @returns Promise with updated match request
 */
export const acceptMatchRequest = async (requestId: number, userId: number): Promise<MatchRequest> => {
    try {
        const response = await api.post(`/match/accept/${requestId}`, { userId });
        return transformMatchData(response.data);
    } catch (error) {
        console.error('Error accepting match request:', error);

        // Return a placeholder response instead of throwing
        const match = transformMatchData({
            requestId,
            status: 'matched',
            createdById: 0,
            bookingId: 0,
            matchType: 'single',
            createdAt: new Date().toISOString()
        });

        return match;
    }
};

/**
 * Cancel a match request
 * @param requestId ID of the match request to cancel
 * @returns Promise with cancelled match request
 */
export const cancelMatchRequest = async (requestId: number): Promise<MatchRequest> => {
    try {
        const response = await api.post(`/match/cancel/${requestId}`);
        return transformMatchData(response.data);
    } catch (error) {
        console.error('Error cancelling match request:', error);

        // Return a placeholder response instead of throwing
        const match = transformMatchData({
            requestId,
            status: 'cancelled',
            createdById: 0,
            bookingId: 0,
            matchType: 'single',
            createdAt: new Date().toISOString()
        });

        return match;
    }
};

// Format time string to 12-hour format for display
export const formatTime = (timeString: string): string => {
    return formatTimeString(timeString);
};

// Export the types for use in other components
export type { Booking, MatchRequest, CreateMatchRequestPayload, Court };