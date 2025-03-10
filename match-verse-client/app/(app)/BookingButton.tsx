// components/BookingButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingButtonProps {
    text: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
    onPress: () => void;
    isPrimary?: boolean;
}

export default function BookingButton({
                                          text,
                                          icon,
                                          iconPosition = 'right',
                                          onPress,
                                          isPrimary = true
                                      }: BookingButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary ? styles.primaryButton : styles.secondaryButton
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {icon && iconPosition === 'left' && (
                <Ionicons
                    name={icon as any}
                    size={20}
                    color={isPrimary ? 'white' : '#22c55e'}
                    style={styles.leftIcon}
                />
            )}

            <Text
                style={[
                    styles.buttonText,
                    isPrimary ? styles.primaryText : styles.secondaryText
                ]}
            >
                {text}
            </Text>

            {icon && iconPosition === 'right' && (
                <Ionicons
                    name={icon as any}
                    size={20}
                    color={isPrimary ? 'white' : '#22c55e'}
                    style={styles.rightIcon}
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    primaryButton: {
        backgroundColor: '#22c55e',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    buttonText: {
        fontWeight: 'bold',
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: '#22c55e',
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
});