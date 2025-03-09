import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface VenueImageProps {
    sportType?: 'badminton' | 'basketball' | 'football' | 'tennis' | 'general';
}

export default function VenueImage({ sportType = 'badminton' }: VenueImageProps) {
    return (
        <View style={styles.imageContainer}>
            <View style={[styles.imagePlaceholder,
                sportType === 'badminton' ? styles.badmintonBg :
                    sportType === 'basketball' ? styles.basketballBg :
                        sportType === 'football' ? styles.footballBg :
                            sportType === 'tennis' ? styles.tennisBg :
                                styles.generalBg
            ]} />
            <View style={styles.gradientOverlay} />
        </View>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        width: '100%',
        height: 300,
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    badmintonBg: {
        backgroundColor: '#15803d',
    },
    basketballBg: {
        backgroundColor: '#b45309',
    },
    footballBg: {
        backgroundColor: '#9f1239',
    },
    tennisBg: {
        backgroundColor: '#a16207',
    },
    generalBg: {
        backgroundColor: '#4f46e5',
    },
});