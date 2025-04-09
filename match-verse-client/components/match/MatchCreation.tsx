// components/match/MatchCreation.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { createMatchRequest } from '@/services/match';
import { MatchCreationForm } from './MatchCreationForm';
import { validateMatchRequest } from './helpers';

interface MatchCreationProps {
    userId: number;
    availableBookings: any[];
    refreshData: () => void;
    loadingBookings: boolean;
}

export const MatchCreation: React.FC<MatchCreationProps> = ({
                                                                userId,
                                                                availableBookings,
                                                                refreshData,
                                                                loadingBookings
                                                            }) => {
    const [matchType, setMatchType] = useState('single');
    const [bookingId, setBookingId] = useState('');
    const [useBooking, setUseBooking] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle creating match requests
    const handleCreateMatchRequest = async (data) => {
        try {
            // Validate the request before proceeding
            if (!validateMatchRequest(data.matchType, data.useBooking)) {
                return;
            }

            setLoading(true);

            const payload = {
                matchType: data.matchType,
                createdById: userId
            };

            // Only add bookingId if the switch is on and a booking ID is entered
            if (data.useBooking && data.bookingId.trim()) {
                const bookingIdNum = parseInt(data.bookingId, 10);
                if (isNaN(bookingIdNum)) {
                    Alert.alert('Error', 'Booking ID must be a number');
                    setLoading(false);
                    return;
                }

                // Check if the booking ID exists in available bookings
                const bookingExists = availableBookings.some(booking => booking.bookingId === bookingIdNum);
                if (!bookingExists) {
                    Alert.alert('Error', 'This booking is not available or does not exist');
                    setLoading(false);
                    return;
                }

                payload.bookingId = bookingIdNum;
            }

            // Additional validation specifically for doubles
            if (data.matchType === 'double') {
                if (!payload.bookingId) {
                    Alert.alert('Error', 'A booking is required for doubles matches');
                    setLoading(false);
                    return;
                }

                // Add partnerId for doubles matches
                if (data.partnerId) {
                    payload.partnerId = data.partnerId;
                } else {
                    Alert.alert('Error', 'A partner is required for doubles matches');
                    setLoading(false);
                    return;
                }
            }

            console.log('Sending match request payload:', payload);
            await createMatchRequest(payload);

            // Show different success messages based on match type
            if (data.matchType === 'double') {
                Alert.alert(
                    'Success',
                    'Doubles match request created with your partner! Your team will be matched with another team.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Success', 'Match request created successfully!');
            }

            // Reset form fields
            setBookingId('');
            setMatchType('single');
            setUseBooking(false);
            refreshData(); // Refresh data after successful creation
        } catch (error) {
            console.error('Error creating match request:', error);

            let errorMessage = 'Failed to create match request';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <MatchCreationForm
                matchType={matchType}
                setMatchType={setMatchType}
                bookingId={bookingId}
                setBookingId={setBookingId}
                useBooking={useBooking}
                setUseBooking={setUseBooking}
                loading={loading}
                loadingBookings={loadingBookings}
                availableBookings={availableBookings}
                currentUserId={userId || 0}
                onSubmit={handleCreateMatchRequest}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16
    }
});

export default MatchCreation;