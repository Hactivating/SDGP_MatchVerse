// components/CourtTimeSlot.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CourtTimeSlotProps {
    time: string;
    isSelected: boolean;
    isAvailable: boolean;
    onSelect: () => void;
}

export default function CourtTimeSlot({
                                          time,
                                          isSelected,
                                          isAvailable,
                                          onSelect
                                      }: CourtTimeSlotProps) {
    return (
        <TouchableOpacity
            style={[
                styles.slotContainer,
                isSelected ? styles.selectedSlot :
                    isAvailable ? styles.availableSlot : styles.unavailableSlot
            ]}
            onPress={onSelect}
            disabled={!isAvailable}
            activeOpacity={0.7}
        >
            <Text
                style={[
                    styles.slotText,
                    isSelected ? styles.selectedText :
                        isAvailable ? styles.availableText : styles.unavailableText
                ]}
            >
                {time}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    slotContainer: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedSlot: {
        backgroundColor: '#22c55e',
    },
    availableSlot: {
        backgroundColor: '#2d2d2d',
        borderWidth: 1,
        borderColor: '#3d3d3d',
    },
    unavailableSlot: {
        backgroundColor: 'rgba(45, 45, 45, 0.5)',
        borderWidth: 1,
        borderColor: '#3d3d3d',
    },
    slotText: {
        fontSize: 14,
    },
    selectedText: {
        color: 'white',
        fontWeight: 'bold',
    },
    availableText: {
        color: '#e5e5e5',
    },
    unavailableText: {
        color: '#666666',
    },
});