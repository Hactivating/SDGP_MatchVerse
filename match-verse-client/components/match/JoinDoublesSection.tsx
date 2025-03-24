import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { getPendingMatches, createMatchRequest } from '@/services/match';
import { Alert } from 'react-native';

interface AvailableDoubleMatch {
    requestId: number;
    bookingId: number;
    matchType: string;
    createdById: number;
    createdBy: {
        userId: number;
        username: string;
        rank?: string;
    };
    partnerId?: number;
    partner?: {
        userId: number;
        username: string;
        rank?: string;
    };
    booking?: {
        date: string;
        startingTime: string;
        court?: {
            name: string;
        }
    }
}

interface MatchAnalysis {
    playerCount: number;
    joinPosition: number;
    joinText: string;
    players: number[];
}

interface JoinDoublesSectionProps {
    userId: number;
    onRefresh: () => void;
}

export const JoinDoublesSection: React.FC<JoinDoublesSectionProps> = ({ userId, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [availableMatches, setAvailableMatches] = useState<AvailableDoubleMatch[]>([]);
    const [matchAnalysis, setMatchAnalysis] = useState<{[key: number]: MatchAnalysis}>({});

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    useEffect(() => {
        fetchAvailableDoubleMatches();
    }, []);


    const analyzeMatch = async (match: AvailableDoubleMatch): Promise<MatchAnalysis> => {
        try {
            // Get all pending matches for this booking
            const allMatches = await getPendingMatches();
            const bookingMatches = allMatches.filter(m =>
                m.bookingId === match.bookingId &&
                m.matchType === 'double' &&
                m.status === 'pending'
            );

            console.log(`Found ${bookingMatches.length} matches for booking ${match.bookingId}`);

            // Count unique players across all matches for this booking
            const playerIds = new Set<number>();

            bookingMatches.forEach(m => {
                if (m.createdById) playerIds.add(m.createdById);
                if (m.partnerId) playerIds.add(m.partnerId);
            });

            const playerCount = playerIds.size;
            console.log(`Total players for booking ${match.bookingId}: ${playerCount}`);

            const joinPosition = playerCount + 1;

            return {
                playerCount,
                joinPosition,
                joinText: `Join as the ${joinPosition}${getOrdinalSuffix(joinPosition)} player`,
                players: Array.from(playerIds)
            };
        } catch (error) {
            console.error('Error analyzing match:', error);
            // Fallback to basic analysis if API call fails
            return {
                playerCount: match.partnerId ? 2 : 1,
                joinPosition: match.partnerId ? 3 : 2,
                joinText: `Join as the ${match.partnerId ? '3rd' : '2nd'} player`,
                players: [match.createdById, match.partnerId].filter(Boolean) as number[]
            };
        }
    };

    const fetchAvailableDoubleMatches = async () => {
        try {
            setLoading(true);
            const pendingMatches = await getPendingMatches();

            console.log("DETAILED PENDING MATCHES:", JSON.stringify(pendingMatches, null, 2));

            const availableDoubles = pendingMatches.filter(match =>
                match.matchType === 'double' &&
                match.createdById !== userId &&
                !match.players?.includes(userId) && // Make sure user isn't already in this match
                match.bookingId // Must have a booking
            );

            console.log("Available doubles matches:", availableDoubles.length);

            setAvailableMatches(availableDoubles);

            // Analyze each match to get accurate player counts
            const analysisResults: {[key: number]: MatchAnalysis} = {};

            for (const match of availableDoubles) {
                analysisResults[match.requestId] = await analyzeMatch(match);
            }

            console.log("Match analysis results:", analysisResults);
            setMatchAnalysis(analysisResults);
        } catch (error) {
            console.error('Error fetching available matches:', error);
            Alert.alert('Error', 'Failed to load available matches');
        } finally {
            setLoading(false);
        }
    };

    const joinMatch = async (match: AvailableDoubleMatch) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setLoading(true);


            const payload = {
                matchType: 'double',
                createdById: userId,
                bookingId: match.bookingId,
            };

            console.log("Joining match with payload:", payload);
            await createMatchRequest(payload);

            Alert.alert(
                'Success',
                'You have joined the doubles match!',
                [{ text: 'OK', onPress: onRefresh }]
            );
        } catch (error) {
            console.error('Error joining match:', error);
            let errorMessage = 'Failed to join the match';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'No date/time';
        return `${date} at ${time}`;
    };

    const getOrdinalSuffix = (num: number) => {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) {
            return 'st';
        }
        if (j === 2 && k !== 12) {
            return 'nd';
        }
        if (j === 3 && k !== 13) {
            return 'rd';
        }
        return 'th';
    };

    if (!fontsLoaded) {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b68d" />
                <Text style={[styles.loadingText, { fontFamily: 'Poppins-Regular' }]}>
                    Loading available matches...
                </Text>
            </View>
        );
    }

    if (availableMatches.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)']}
                className="backdrop-blur-md rounded-2xl p-5"
            >
                <Text style={[styles.title, { fontFamily: 'Poppins-Bold' }]}>
                    Available Doubles Matches
                </Text>
                <Text style={[styles.subtitle, { fontFamily: 'Poppins-Regular' }]}>
                    Join an existing doubles match without creating a booking
                </Text>

                {availableMatches.map((match) => {
                    const analysis = matchAnalysis[match.requestId] || {
                        playerCount: match.partnerId ? 2 : 1,
                        joinPosition: match.partnerId ? 3 : 2,
                        joinText: `Join as the ${match.partnerId ? '3rd' : '2nd'} player`,
                    };

                    return (
                        <View key={match.requestId} style={styles.matchItem}>
                            <View style={styles.matchHeader}>
                                <View style={styles.matchTypeBadge}>
                                    <Ionicons name="people" size={12} color="#fff" style={{ marginRight: 4 }} />
                                    <Text style={[styles.matchTypeText, { fontFamily: 'Poppins-Bold' }]}>
                                        Doubles
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.joinButton}
                                    onPress={() => joinMatch(match)}
                                >
                                    <Text style={[styles.joinButtonText, { fontFamily: 'Poppins-Medium' }]}>
                                        Join Match
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {match.booking && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#10b68d" />
                                    <Text style={[styles.infoText, { fontFamily: 'Poppins-Regular' }]}>
                                        {match.booking.court?.name || 'Court'} on {formatDateTime(match.booking.date, match.booking.startingTime)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.playersContainer}>
                                <Text style={[styles.playersTitle, { fontFamily: 'Poppins-Medium' }]}>
                                    Current Players ({analysis.playerCount}/4):
                                </Text>

                                {/* Creator */}
                                {match.createdBy && (
                                    <View style={styles.playerItem}>
                                        <View style={styles.playerBubble}>
                                            <Text style={styles.playerInitial}>
                                                {match.createdBy.username ? match.createdBy.username.charAt(0).toUpperCase() : '?'}
                                            </Text>
                                        </View>
                                        <Text style={[styles.playerName, { fontFamily: 'Poppins-Medium' }]}>
                                            {match.createdBy.username || 'Unknown User'}
                                        </Text>
                                        <View style={styles.creatorBadge}>
                                            <Text style={[styles.creatorBadgeText, { fontFamily: 'Poppins-Regular' }]}>
                                                Creator
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Partner if available */}
                                {match.partnerId && match.partner && (
                                    <View style={styles.playerItem}>
                                        <View style={styles.playerBubble}>
                                            <Text style={styles.playerInitial}>
                                                {match.partner.username ? match.partner.username.charAt(0).toUpperCase() : '?'}
                                            </Text>
                                        </View>
                                        <Text style={[styles.playerName, { fontFamily: 'Poppins-Medium' }]}>
                                            {match.partner.username || 'Unknown Partner'}
                                        </Text>
                                        <View style={[styles.creatorBadge, {backgroundColor: '#dbeafe'}]}>
                                            <Text style={[styles.creatorBadgeText, { fontFamily: 'Poppins-Regular', color: '#2563eb' }]}>
                                                Partner
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {analysis.playerCount > 2 && (
                                    <View style={styles.additionalPlayers}>
                                        <Text style={[styles.additionalPlayersText, { fontFamily: 'Poppins-Regular' }]}>
                                            +{analysis.playerCount - 2} more player{analysis.playerCount - 2 > 1 ? 's' : ''} have joined
                                        </Text>
                                    </View>
                                )}

                                <Text style={[styles.joinPrompt, { fontFamily: 'Poppins-Regular' }]}>
                                    {analysis.joinText}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchAvailableDoubleMatches}
                >
                    <Ionicons name="refresh" size={16} color="#10b68d" />
                    <Text style={[styles.refreshText, { fontFamily: 'Poppins-Medium' }]}>
                        Refresh Available Matches
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    matchItem: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    matchTypeBadge: {
        backgroundColor: '#10b68d',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    matchTypeText: {
        color: '#fff',
        fontSize: 12,
    },
    joinButton: {
        backgroundColor: '#10b68d',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        color: '#333',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    playersContainer: {
        marginTop: 8,
    },
    playersTitle: {
        marginBottom: 8,
        color: '#333',
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 8,
    },
    playerBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#10b68d',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    playerInitial: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    playerName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    creatorBadge: {
        backgroundColor: '#f0fdf4',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    creatorBadgeText: {
        color: '#10b68d',
        fontSize: 10,
    },
    additionalPlayers: {
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    additionalPlayersText: {
        color: '#4b5563',
        fontSize: 14,
    },
    joinPrompt: {
        textAlign: 'center',
        marginTop: 8,
        color: '#666',
        fontStyle: 'italic',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 8,
    },
    refreshText: {
        color: '#10b68d',
        marginLeft: 4,
    },
    loadingContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
    }
});