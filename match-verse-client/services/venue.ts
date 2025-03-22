// services/venue.ts
import { api } from './api';

export interface Venue {
    venueId: number;
    name?: string;
    description?: string;
    address?: string;
    location?: string;
    contactNumber?: string;
    email: string;
    password?: string;
    venueImageUrl?: string;
    rating: number;
    totalRating: number;
    openingTime?: number;
    closingTime?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Court {
    courtId: number;
    name?: string;
    venueId: number;
    sportType?: string;
    courtNumber?: number;
    status?: string;
    hourlyRate?: number;
    createdAt?: string;
    updatedAt?: string;
    pricePerBooking: number;
}

export interface CourtImage {
    courtImageId: number;
    courtId: number;
    imageUrl: string;
    createdAt?: string;
    updatedAt?: string;
}

// Get all venues
export const getAllVenues = async (): Promise<Venue[]> => {
    try {
        const response = await api.get('/venues');
        return response.data;
    } catch (error) {
        console.error('Error fetching venues:', error);
        throw error;
    }
};

// Get venue by ID
export const getVenueById = async (id: number): Promise<Venue> => {
    try {
        const response = await api.get(`/venues/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching venue with id ${id}:`, error);
        throw error;
    }
};

// Get all courts
export const getAllCourts = async (): Promise<Court[]> => {
    try {
        const response = await api.get('/courts');
        return response.data;
    } catch (error) {
        console.error('Error fetching courts:', error);
        throw error;
    }
};

// Get courts by venue ID
export const getCourtsByVenueId = async (venueId: number): Promise<Court[]> => {
    try {
        // First try the ideal endpoint (if it exists)
        try {
            const response = await api.get(`/courts?venueId=${venueId}`);
            return response.data;
        } catch (err) {
            // If that fails, get all courts and filter for this venue
            const allCourts = await getAllCourts();
            return allCourts.filter(court => court.venueId === venueId);
        }
    } catch (error) {
        console.error(`Error fetching courts for venue ${venueId}:`, error);
        throw error;
    }
};

// Rate a venue
export const rateVenue = async (venueId: number, userId: number, rating: number) => {
    try {
        const response = await api.post(`/venues/rate/${venueId}`, {
            userId,
            rating
        });
        return response.data;
    } catch (error) {
        console.error(`Error rating venue ${venueId}:`, error);
        throw error;
    }
};

// Map backend sport types to icon names and colors
export const getSportIcon = (sportType: string): string => {
    const sportTypeLC = sportType.toLowerCase();

    if (sportTypeLC.includes('football') || sportTypeLC.includes('futsal') || sportTypeLC.includes('soccer')) {
        return 'football';
    }

    if (sportTypeLC.includes('badminton') || sportTypeLC.includes('tennis')) {
        return 'tennisball';
    }

    if (sportTypeLC.includes('basketball')) {
        return 'basketball';
    }

    if (sportTypeLC.includes('volleyball')) {
        return 'volleyball';
    }

    return 'grid';
};

export const getSportColor = (sportType: string): string => {
    const sportTypeLC = sportType.toLowerCase();

    if (sportTypeLC.includes('football') || sportTypeLC.includes('futsal') || sportTypeLC.includes('soccer')) {
        return "#e11d48";
    }

    if (sportTypeLC.includes('badminton')) {
        return "#15803d";
    }

    if (sportTypeLC.includes('tennis')) {
        return "#facc15";
    }

    if (sportTypeLC.includes('basketball')) {
        return "#f97316";
    }

    if (sportTypeLC.includes('volleyball')) {
        return "#6366f1";
    }

    return "#6366f1"; // Default color
};