// components/match/JoinSingles.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { joinSinglesMatchRequest } from '@/services/match';
import { MatchBadge } from './MatchBadge';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { Alert } from 'react-native';
import { useFonts } from 'expo-font';

interface JoinSinglesProps {
    availableSinglesMatches: any[];
    userId: number;
    refreshing: boolean;
    onRefresh: () => void;
}

export const JoinSingles: React.FC<JoinSinglesProps> = ({
                                                            availableSinglesMatches,
                                                            userId,
                                                            refreshing,
                                                            onRefresh
                                                        }) => {
    const [joiningMatch, setJoiningMatch] = useState(false);
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    // If no singles matches are available, return null to hide the section
    if (availableSinglesMatches.length === 0 && !refreshing) {
        return null;
    }

    // Function to handle joining a match
    const handleJoinMatch = async (matchId) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setJoiningMatch(true);

            await joinSinglesMatchRequest({
                matchId,
                userId
            });

            Alert.alert(
                'Success',
                'You have joined the singles match! You are now matched with your opponent.',
                [{ text: 'OK' }]
            );

            onRefresh(); // Refresh the data after joining
        } catch (error) {
            console.error('Error joining match:', error);

            let errorMessage = 'Failed to join the match';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setJoiningMatch(false);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.card}
            >
                <View style={styles.headerContainer}>
                    <Text style={[styles.sectionTitle, { fontFamily: 'Poppins-Bold' }]}>Join Singles Match</Text>
                    <Ionicons name="person" size={24} color="#10b68d" />
                </View>

                {refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#10b68d" />
                        <Text style={[styles.loadingText, { fontFamily: 'Poppins-Regular' }]}>Finding available matches...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={[styles.sectionDescription, { fontFamily: 'Poppins-Regular' }]}>
                            Browse available singles matches to join:
                        </Text>

                        {availableSinglesMatches.map(match => (
                            <View key={match.requestId} style={styles.matchItem}>
                                <View style={styles.matchDetails}>
                                    <View style={styles.courtHeader}>
                                        <Text style={[styles.courtName, { fontFamily: 'Poppins-Medium' }]}>
                                            {match.booking?.court?.name || 'Player Seeking Match'}
                                        </Text>
                                        <MatchBadge hasBooking={!!match.booking} type="singles" />
                                    </View>

                                    <View style={styles.timeContainer}>
                                        {match.booking ? (
                                            <>
                                                <Ionicons name="calendar-outline" size={14} color="#666" style={styles.icon} />
                                                <Text style={[styles.timeText, { fontFamily: 'Poppins-Regular' }]}>
                                                    {format(parseISO(match.booking.date), 'MMM d, yyyy')}
                                                </Text>

                                                <Ionicons name="time-outline" size={14} color="#666" style={[styles.icon, styles.timeIcon]} />
                                                <Text style={[styles.timeText, { fontFamily: 'Poppins-Regular' }]}>
                                                    {match.booking.startingTime}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text style={[styles.timeText, { fontFamily: 'Poppins-Regular', fontStyle: 'italic' }]}>
                                                Join to play at your court
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.creatorContainer}>
                                        <Text style={[styles.createdBy, { fontFamily: 'Poppins-Regular' }]}>
                                            Player: {match.createdBy?.username || 'Unknown'}
                                        </Text>
                                        {match.createdBy?.rank && (
                                            <View style={styles.rankBadge}>
                                                <Text style={[styles.rankText, { fontFamily: 'Poppins-Regular' }]}>
                                                    {match.createdBy.rank}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.joinButton}
                                    onPress={() => handleJoinMatch(match.requestId)}
                                    disabled={joiningMatch}
                                >
                                    <LinearGradient
                                        colors={['#10b68d', '#046d64']}
                                        style={styles.gradientButton}
                                    >
                                        {joiningMatch ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text style={[styles.joinButtonText, { fontFamily: 'Poppins-Medium' }]}>Join</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#333',
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
    },
    matchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    matchDetails: {
        flex: 1,
    },
    courtHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    courtName: {
        fontSize: 16,
        color: '#333',
        marginRight: 8,
        flex: 1,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    icon: {
        marginRight: 4,
    },
    timeIcon: {
        marginLeft: 12,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    creatorContainer: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    createdBy: {
        fontSize: 12,
        color: '#666',
    },
    rankBadge: {
        marginLeft: 8,
        backgroundColor: '#eef2ff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    rankText: {
        fontSize: 10,
        color: '#4f46e5',
    },
    joinButton: {
        marginLeft: 16,
    },
    gradientButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    joinButtonText: {
        color: 'white',
    },
});

export default JoinSingles;