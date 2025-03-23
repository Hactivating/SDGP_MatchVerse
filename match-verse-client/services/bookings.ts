// Remove the mock DELETE functionality from bookingsApi service
// and update the handleCancelBooking function to only use AsyncStorage:

const handleCancelBooking = (bookingId) => {
    Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking?',
        [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setCancellingBookingId(bookingId);

                        // Store the cancelled booking ID in AsyncStorage
                        await storeCancelledBookingId(bookingId);

                        // Update UI
                        setBookings(prevBookings =>
                            prevBookings.filter(booking => booking.bookingId !== bookingId)
                        );

                        // Provide feedback
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Success', 'Your booking has been hidden from your list.');

                    } catch (err) {
                        console.error('Error cancelling booking:', err);
                        Alert.alert('Error', 'Failed to remove the booking. Please try again later.');
                    } finally {
                        setCancellingBookingId(null);
                    }
                },
            }
        ]
    );
};

// And in your bookingsApi service, remove the cancelBooking method entirely.
// Just keep the other methods:

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
    }
};