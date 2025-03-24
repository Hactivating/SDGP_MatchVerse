import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

interface BookingType {
    bookingId: number;
    courtId: number;
    date: string;
    startingTime: string;
    court?: {
        name: string;
    };
}

interface BookingSelectorProps {
    bookings: BookingType[];
    loading: boolean;
    onSelect: (bookingId: string) => void;
}

export const BookingSelector: React.FC<BookingSelectorProps> = ({ bookings, loading, onSelect }) => {
    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'No date/time';
        return `${date} at ${time}`;
    };

    const handleSelectBooking = (bookingId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(bookingId.toString());
    };

    if (!fontsLoaded) {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#10b68d" size="small" />
                <Text style={[styles.loadingText, { fontFamily: 'Poppins-Regular' }]}>
                    Loading your bookings...
                </Text>
            </View>
        );
    }

    if (bookings.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={{ marginBottom: 4 }} />
                <Text style={[styles.emptyText, { fontFamily: 'Poppins-Regular' }]}>
                    You don't have any available bookings
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontFamily: 'Poppins-Medium' }]}>Your available bookings:</Text>

            <ScrollView
                style={bookings.length > 2 ? styles.scrollContainer : undefined}
                showsVerticalScrollIndicator={false}
            >
                {bookings.map((booking) => (
                    <TouchableOpacity
                        key={booking.bookingId}
                        style={styles.bookingItem}
                        onPress={() => handleSelectBooking(booking.bookingId)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={['#f0fdf4', '#dcfce7']}
                            style={styles.bookingGradient}
                        >
                            <View style={styles.bookingHeader}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="calendar" size={16} color="#10b68d" />
                                </View>
                                <Text style={[styles.bookingText, { fontFamily: 'Poppins-Medium' }]}>
                                    {booking.court?.name || `Court ${booking.courtId}`}
                                </Text>
                            </View>

                            <Text style={[styles.dateText, { fontFamily: 'Poppins-Regular' }]}>
                                {formatDateTime(booking.date, booking.startingTime)}
                            </Text>

                            <View style={styles.idBadge}>
                                <Text style={[styles.idText, { fontFamily: 'Poppins-Medium' }]}>
                                    ID: {booking.bookingId}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
    },
    title: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    scrollContainer: {
        maxHeight: 200,
    },
    bookingItem: {
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bookingGradient: {
        padding: 12,
        borderRadius: 12,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(16, 182, 141, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    bookingText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    dateText: {
        fontSize: 14,
        color: '#4b5563',
        marginLeft: 36,
    },
    idBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(16, 182, 141, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginTop: 6,
        marginLeft: 36,
    },
    idText: {
        fontSize: 12,
        color: '#10b68d',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    loadingText: {
        color: '#6b7280',
        marginTop: 8,
    },
    emptyContainer: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#6b7280',
        textAlign: 'center',
    },
});