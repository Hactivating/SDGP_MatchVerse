// services/venue.ts
import { api } from './api';

export interface Venue {
    venueId: number;
    name: string;
    description?: string;
    address: string;
    contactNumber: string;
    email: string;
    venueImageUrl?: string;
    rating: number;
    totalRating: number;
    createdAt: string;
    updatedAt: string;
}

export interface Court {
    courtId: number;
    venueid: number;
    sportType: string;
    courtNumber: number;
    status: string;
    hourlyRate: number;
    createdAt: string;
    updatedAt: string;
}

export interface CourtImage {
    courtImageId: number;
    courtId: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
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

// Get courts by venue ID
export const getCourtsByVenueId = async (venueId: number): Promise<Court[]> => {
    try {
        const response = await api.get(`/courts?venueId=${venueId}`);
        return response.data;
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
    const sportMap = {
        'football': 'football',
        'futsal': 'football',
        'soccer': 'football',
        'badminton': 'tennisball',
        'tennis': 'tennisball',
        'basketball': 'basketball',
        'volleyball': 'volleyball',
        'table-tennis': 'ellipse',
        'squash': 'ellipse',
        'cricket': 'baseball',
    };

    return sportMap[sportType.toLowerCase()] || 'grid';
};

export const getSportColor = (sportType: string): string => {
    const colorMap = {
        'football': "#e11d48",
        'futsal': "#e11d48",
        'soccer': "#e11d48",
        'badminton': "#15803d",
        'tennis': "#facc15",
        'basketball': "#f97316",
        'volleyball': "#6366f1",
        'table-tennis': "#0ea5e9",
        'squash': "#d946ef",
        'cricket': "#64748b",
    };

    return colorMap[sportType.toLowerCase()] || "#6366f1";
};