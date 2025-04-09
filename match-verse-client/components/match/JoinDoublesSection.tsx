// components/match/JoinDoubles.tsx
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
import { joinMatchRequest } from '@/services/match';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { Alert } from 'react-native';

interface JoinDoublesProps {
    availableDoublesMatches: any[];
    userId: number;
    refreshing: boolean;
    onRefresh: () => void;
}

export const JoinDoubles: React.FC<JoinDoublesProps> = ({
                                                            availableDoublesMatches,
                                                            userId,
                                                            refreshing,
                                                            onRefresh
                                                        }) => {
    const [joiningMatch, setJoiningMatch] = useState(false);

    // If no doubles matches are available, return null to hide the section
    if (availableDoublesMatches.length === 0 && !refreshing) {
        return null;
    }

    // Function to handle joining a match
    const handleJoinMatch = async (matchId) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setJoiningMatch(true);

            await joinMatchRequest({
                matchId,
                userId
            });

            Alert.alert(
                'Success',
                'You have joined the doubles match! You will be matched when the match is full.',
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

    return (
        <View style={styles.sectionContainer}>
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.card}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.sectionTitle}>Join Doubles Match</Text>
                    <Ionicons name="people" size={24} color="#10b68d" />
                </View>

                {refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#10b68d" />
                        <Text style={styles.loadingText}>Finding available matches...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.sectionDescription}>
                            Find doubles matches that need more players to join:
                        </Text>

                        {availableDoublesMatches.map(match => (
                            <View key={match.requestId} style={styles.matchItem}>
                                <View style={styles.matchDetails}>
                                    <Text style={styles.courtName}>
                                        {match.booking?.court?.name || 'Court'}
                                    </Text>

                                    <View style={styles.timeContainer}>
                                        <Ionicons name="calendar-outline" size={14} color="#666" style={styles.icon} />
                                        <Text style={styles.timeText}>
                                            {match.booking ? format(parseISO(match.booking.date), 'MMM d, yyyy') : 'Date TBD'}
                                        </Text>

                                        <Ionicons name="time-outline" size={14} color="#666" style={[styles.icon, styles.timeIcon]} />
                                        <Text style={styles.timeText}>
                                            {match.booking?.startingTime || 'Time TBD'}
                                        </Text>
                                    </View>

                                    <View style={styles.creatorContainer}>
                                        <Text style={styles.createdBy}>
                                            Created by: {match.createdBy?.username || 'Unknown'}
                                        </Text>
                                        {match.partner && (
                                            <Text style={styles.partner}>
                                                Partner: {match.partner.username}
                                            </Text>
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
                                            <Text style={styles.joinButtonText}>Join</Text>
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
        fontWeight: 'bold',
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
    courtName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    createdBy: {
        fontSize: 12,
        color: '#666',
    },
    partner: {
        fontSize: 12,
        color: '#666',
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
        fontWeight: '600',
    },
});

export default JoinDoubles;