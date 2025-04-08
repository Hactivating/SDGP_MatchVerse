import { api } from './api';

export interface MatchRequest {
    requestId: number;
    bookingId: number | null;
    matchType: 'single' | 'double';
    createdById: number;
    partnerId: number | null;
    status: 'pending' | 'matched';
    createdBy?: User;
    partner?: User;
    booking?: Booking;
}

export interface User {
    userId: number;
    username: string;
    email: string;
    rank: string;
    rankPoints: number;
    userImageUrl?: string;
}

export interface Booking {
    bookingId: number;
    courtId: number;
    date: string;
    startingTime: string;
    court?: Court;
    isAvailable?: boolean; // Added to indicate if booking is available for match requests
}

export interface Court {
    courtId: number;
    name: string;
    venueId: number;
    venue?: Venue;
}

export interface Venue {
    venueId: number;
    venueName: string;
    location: string;
}

export interface CreateMatchRequestDto {
    bookingId?: number;
    matchType: 'single' | 'double';
    createdById: number;
    partnerId?: number;
}

export interface JoinMatchDto {
    matchId: number;
    userId: number;
    partnerId?: number;
}

export interface MatchResultDto {
    winner1Id: number;
    winner2Id: number;
    loser1Id: number;
    loser2Id: number;
}
export interface JoinSinglesDto {
    matchId: number;
    userId: number;
}

export const getAvailableSinglesMatches = async (): Promise<MatchRequest[]> => {
    try {
        const response = await api.get('/match/available-singles');
        return response.data;
    } catch (error) {
        console.error('Error fetching available singles matches:', error);
        throw error;
    }
};

export const joinSinglesMatchRequest = async (payload: JoinSinglesDto): Promise<MatchRequest> => {
    try {
        console.log('Joining singles match request with payload:', payload);

        const response = await api.post('/match/join-singles', payload);

        // Log the response for debugging
        console.log('Join singles match response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error joining singles match request:', error.response?.data || error);
        throw error;
    }
};

export const createMatchRequest = async (payload: CreateMatchRequestDto): Promise<MatchRequest> => {
    try {
        console.log('Creating match request with payload:', payload);

        const response = await api.post('/match/request', payload);

        // Log the response for debugging
        console.log('Match request response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error creating match request:', error.response?.data || error);
        throw error;
    }
};

// Join an existing match request (new function)
export const joinMatchRequest = async (payload: JoinMatchDto): Promise<MatchRequest> => {
    try {
        console.log('Joining match request with payload:', payload);

        const response = await api.post('/match/join', payload);

        // Log the response for debugging
        console.log('Join match response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error joining match request:', error.response?.data || error);
        throw error;
    }
};

// Get pending match requests
export const getPendingMatches = async (): Promise<MatchRequest[]> => {
    try {
        const response = await api.get('/match/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending matches:', error);
        throw error;
    }
};

// Get matched requests
export const getMatchedMatches = async (): Promise<MatchRequest[]> => {
    try {
        const response = await api.get('/match/matched');
        return response.data;
    } catch (error) {
        console.error('Error fetching matched matches:', error);
        throw error;
    }
};

// Submit match result and update rankings
export const submitMatchResult = async (result: MatchResultDto): Promise<any> => {
    try {
        const response = await api.post('/ranking/update', result);
        return response.data;
    } catch (error) {
        console.error('Error submitting match result:', error);
        throw error;
    }
};


export const getUserBookingsForMatching = async (userId: number): Promise<Booking[]> => {
    try {
        console.log(`Getting bookings for user ID: ${userId}`);

        if (!userId) {
            console.log('No user ID provided, returning empty bookings array');
            return [];
        }

        // Get all user bookings
        const response = await api.get(`/bookings/${userId}`);
        console.log(`API response for bookings:`, response.data);

        // Filter for future bookings only
        const currentDate = new Date();
        const futureBookings = response.data.filter((booking: Booking) => {
            if (!booking.date) {
                return false;
            }

            // Parse the booking date
            const bookingDate = new Date(booking.date);
            const isFuture = bookingDate >= currentDate;

            // For debugging
            if (!isFuture) {
                console.log(`Booking #${booking.bookingId} filtered out - past date: ${booking.date}`);
            }

            return isFuture;
        });

        console.log(`Found ${futureBookings.length} future bookings out of ${response.data.length} total bookings`);
        return futureBookings;
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return [];
    }

};