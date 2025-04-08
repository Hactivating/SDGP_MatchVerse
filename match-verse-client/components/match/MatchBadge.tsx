// components/match/MatchBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

interface MatchBadgeProps {
    hasBooking: boolean;
    type?: 'singles' | 'doubles';
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
                                                          hasBooking,
                                                          type = 'singles'
                                                      }) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={[
            styles.badge,
            hasBooking ? styles.hasBookingBadge : styles.noBookingBadge
        ]}>
            <Ionicons
                name={hasBooking ? "checkmark-circle" : "information-circle"}
                size={12}
                color={hasBooking ? "#047857" : "#6366f1"}
                style={styles.icon}
            />
            <Text style={[
                styles.badgeText,
                { fontFamily: 'Poppins-Medium' },
                hasBooking ? styles.hasBookingText : styles.noBookingText
            ]}>
                {hasBooking
                    ? `Court Provided`
                    : `No Court`}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    hasBookingBadge: {
        backgroundColor: '#ecfdf5',
    },
    noBookingBadge: {
        backgroundColor: '#eef2ff',
    },
    icon: {
        marginRight: 4,
    },
    badgeText: {
        fontSize: 10,
    },
    hasBookingText: {
        color: '#047857',
    },
    noBookingText: {
        color: '#6366f1',
    },
});

export default MatchBadge;