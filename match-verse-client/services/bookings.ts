import { api } from './api';

export interface Booking {
    bookingId: number;
    courtId: number;
    date: string;
    startingTime: string;
    userId: number | null;
}

export interface BookingSlot {
    date: string;
    starts: string;
    isBooked: boolean;
}

export interface CreateBookingData {
    userId: number;
    courtId: number;
    date: string;
    startingTime: string;
}

export const bookingsApi = {
    getByCourtAndDate: (courtId: number, date: string) => {
        if (!courtId) {
            throw new Error('Court ID is required');
        }

        if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('Date must be in YYYY-MM-DD format');
        }

        return api.get(`/bookings/${courtId}/${date}`);
    },

    getUserBookings: (userId: number) => {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return api.get(`/bookings/${userId}`);
    },

    createUserBooking: (bookingData: CreateBookingData) => {
        if (!bookingData.userId || !bookingData.courtId || !bookingData.date || !bookingData.startingTime) {
            throw new Error('All booking data is required: userId, courtId, date, startingTime');
        }

        return api.post('/bookings/user', bookingData);
    },

    cancelBooking: (bookingId: number) => {
        if (!bookingId) {
            throw new Error('Booking ID is required');
        }

        return api.delete(`/bookings/${bookingId}`);
    }
};

export default bookingsApi;