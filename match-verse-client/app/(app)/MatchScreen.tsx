// app/(app)/find.tsx (Updated)
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    RefreshControl,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
    getPendingMatches,
    getMatchedMatches,
    getUserBookingsForMatching,
    getAvailableSinglesMatches,
} from '../../services/match';
import { useAuth } from '@/hooks/useAuth';
import { MatchHeader } from '@/components/match/MatchHeader';
import { MatchCreation } from '@/components/match/MatchCreation';
import { JoinDoubles } from '@/components/match/JoinDoublesSection';
import { JoinSingles } from '@/components/match/JoinSingles';
import { MatchList } from '@/components/match/MatchList';
import { LinearGradient } from 'expo-linear-gradient';

export default function MatchScreen() {
    const { state } = useAuth();
    const userId = state.user?.userId;

    const [pendingMatches, setPendingMatches] = useState([]);
    const [matchedMatches, setMatchedMatches] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userBookings, setUserBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [availableDoublesMatches, setAvailableDoublesMatches] = useState([]);
    const [availableSinglesMatches, setAvailableSinglesMatches] = useState([]);

    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

    // Card animations with staggered effect
    const cardAnimations = React.useRef({
        form: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        joinSingles: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        joinDoubles: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        pending: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        matched: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
    }).current;

    useEffect(() => {
        fetchData();

        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered animations for cards
        const animateCards = () => {
            const delays = {
                form: 100,
                joinSingles: 200,
                joinDoubles: 300,
                pending: 400,
                matched: 500
            };

            Object.entries(cardAnimations).forEach(([key, anim]) => {
                Animated.parallel([
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        delay: delays[key],
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 500,
                        delay: delays[key],
                        useNativeDriver: true,
                    })
                ]).start();
            });
        };

        animateCards();
    }, []);

    // Improved consolidation function that handles finding opponents between matches
    const consolidateMatchedMatches = (matches) => {
        console.log('===== DETAILED MATCH INFO =====');
        matches.forEach((match, index) => {
            console.log(`Match ${index + 1} ID: ${match.requestId} (BookingID: ${match.bookingId})`);
            console.log(`Match Type: ${match.matchType}`);
            console.log(`Creator: ${match.createdBy?.username || 'Unknown'} (ID: ${match.createdBy?.userId || 'Unknown'})`);
            console.log(`Partner: ${match.partner?.username || 'None'} (ID: ${match.partnerId || 'None'})`);
            console.log('------------------------');
        });

        // Group matches by bookingId to find opponents
        const matchesByBookingId = {};

        // First, group all matches by booking ID
        matches.forEach(match => {
            if (!match.bookingId) return;

            const key = `${match.bookingId}`;

            if (!matchesByBookingId[key]) {
                matchesByBookingId[key] = [];
            }

            matchesByBookingId[key].push(match);
        });

        // Now create consolidated match objects with all players included
        const consolidatedMatches = [];

        Object.keys(matchesByBookingId).forEach(bookingId => {
            const matchesForThisBooking = matchesByBookingId[bookingId];

            // Separate singles and doubles matches for the same booking
            const singleMatches = matchesForThisBooking.filter(m => m.matchType === 'single');
            const doubleMatches = matchesForThisBooking.filter(m => m.matchType === 'double');

            // Process singles matches
            if (singleMatches.length > 0) {
                // Use the first match as the base for singles
                const baseMatch = singleMatches[0];
                const allParticipants = [];

                // Collect all unique players (max 2 for singles)
                singleMatches.forEach(match => {
                    if (match.createdBy && !allParticipants.some(p => p.userId === match.createdBy.userId) && allParticipants.length < 2) {
                        allParticipants.push(match.createdBy);
                    }

                    if (match.partnerId && match.partner &&
                        !allParticipants.some(p => p.userId === match.partner.userId) &&
                        allParticipants.length < 2) {
                        allParticipants.push(match.partner);
                    }
                });

                // Create consolidated singles match
                consolidatedMatches.push({
                    ...baseMatch,
                    allParticipants,
                    matchType: 'single'
                });
            }

            // Process doubles matches with improved handling
            if (doubleMatches.length > 0) {
                // Use the first match as the base for doubles
                const baseMatch = doubleMatches[0];
                const allParticipants = [];
                const teams = [];

                // Enhanced logging to help debug participant tracking
                console.log('Doubles match participants before consolidation:');
                doubleMatches.forEach(match => {
                    console.log(`Match ${match.requestId}: Created by ${match.createdBy?.username || 'Unknown'}`);
                    console.log(`Has partner: ${match.partner ? 'Yes - ' + match.partner.username : 'No'}`);
                });

                // Make sure to collect ALL participants across all related match requests
                doubleMatches.forEach(match => {
                    // Add creator if not already in the list
                    if (match.createdBy && !allParticipants.some(p => p.userId === match.createdBy.userId)) {
                        allParticipants.push(match.createdBy);
                    }

                    // Add partner if there is one and not already in the list
                    if (match.partner && !allParticipants.some(p => p.userId === match.partner.userId)) {
                        allParticipants.push(match.partner);
                    }
                });

                // Enhanced team formation logic
                // If we have clear teams (where partners are specified), add them first
                doubleMatches.forEach(match => {
                    if (match.createdBy && match.partner) {
                        // Only add if both players exist and we don't already have this team
                        const teamExists = teams.some(team =>
                            (team.player1.userId === match.createdBy.userId && team.player2.userId === match.partner.userId) ||
                            (team.player1.userId === match.partner.userId && team.player2.userId === match.createdBy.userId)
                        );

                        if (!teamExists) {
                            teams.push({
                                player1: match.createdBy,
                                player2: match.partner
                            });
                        }
                    }
                });

                // For players without explicit teams, form ad-hoc teams
                const unassignedPlayers = allParticipants.filter(player =>
                    !teams.some(team =>
                        team.player1.userId === player.userId ||
                        team.player2.userId === player.userId
                    )
                );

                // Create teams from unassigned players if possible
                for (let i = 0; i < unassignedPlayers.length; i += 2) {
                    if (i + 1 < unassignedPlayers.length) {
                        teams.push({
                            player1: unassignedPlayers[i],
                            player2: unassignedPlayers[i + 1]
                        });
                    }
                }

                // Log the final consolidated data
                console.log(`Final doubles match has ${allParticipants.length} participants and ${teams.length} teams`);

                // Limit to maximum 4 players for doubles
                const limitedParticipants = allParticipants.slice(0, 4);

                // Create consolidated doubles match with teams information
                consolidatedMatches.push({
                    ...baseMatch,
                    allParticipants: limitedParticipants,
                    teams: teams,
                    matchType: 'double',
                    isComplete: limitedParticipants.length === 4
                });
            }
        });

        // Log the final consolidation results
        console.log('===== CONSOLIDATION RESULTS =====');
        console.log(`Original matches: ${matches.length}, Consolidated: ${consolidatedMatches.length}`);

        consolidatedMatches.forEach((match, index) => {
            console.log(`Consolidated Match ${index + 1} (ID: ${match.requestId})`);
            console.log(`Match Type: ${match.matchType}`);
            console.log(`Total participants: ${match.allParticipants.length}`);
            console.log(`Required participants: ${match.matchType === 'single' ? 2 : 4}`);
            match.allParticipants.forEach((player, idx) => {
                console.log(`  Player ${idx + 1}: ${player.username} (ID: ${player.userId})`);
            });

            if (match.teams && match.teams.length > 0) {
                console.log(`Teams identified: ${match.teams.length}`);
                match.teams.forEach((team, teamIdx) => {
                    console.log(`  Team ${teamIdx + 1}: ${team.player1.username} & ${team.player2.username}`);
                });
            }

            console.log(`Match status: ${match.allParticipants.length === (match.matchType === 'single' ? 2 : 4) ? 'COMPLETE' : 'INCOMPLETE'}`);
        });

        return consolidatedMatches;
    };

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const pendingResponse = await getPendingMatches();
            const matchedResponse = await getMatchedMatches();

            setPendingMatches(pendingResponse);

            // Get available singles matches to join
            const availableSingles = await getAvailableSinglesMatches();
            setAvailableSinglesMatches(availableSingles.filter(match =>
                // Don't show the user's own matches in the join list
                match.createdById !== userId
            ));

            // Extract available doubles matches that are not full yet
            const availableDoubles = pendingResponse.filter(match => {
                // Only include doubles matches
                if (match.matchType !== 'double' || match.status !== 'pending') {
                    return false;
                }

                // Count players in this match
                let playerCount = 0;
                if (match.createdById) playerCount++;
                if (match.partnerId) playerCount++;

                // Find other match requests for the same booking
                const relatedMatches = pendingResponse.filter(m =>
                    m.bookingId === match.bookingId &&
                    m.matchType === 'double' &&
                    m.requestId !== match.requestId
                );

                // Count players from related matches
                relatedMatches.forEach(m => {
                    if (m.createdById) playerCount++;
                    if (m.partnerId) playerCount++;
                });

                // Only show matches that need more players (less than 4)
                return playerCount < 4;
            });

            setAvailableDoublesMatches(availableDoubles);

            // Consolidate matched matches to display as a single entry
            const consolidatedMatches = consolidateMatchedMatches(matchedResponse);
            setMatchedMatches(consolidatedMatches);

            await fetchUserBookings();
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to fetch match data');
        } finally {
            setRefreshing(false);
        }
    };

    const fetchUserBookings = async () => {
        try {
            setLoadingBookings(true);
            console.log("Fetching bookings for user ID:", userId);

            // Only proceed if we have a valid userId
            if (!userId) {
                console.error("Missing userId in auth state");
                setUserBookings([]);
                return;
            }

            // This now uses the updated function that filters out bookings already in match requests
            const bookings = await getUserBookingsForMatching(userId);
            console.log("Received bookings:", bookings);
            setUserBookings(bookings || []);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    };

    // Get the IDs of bookings that are already in use
    const getBookingsInUse = () => {
        const bookingIdsInUse = new Set();

        // Check pending matches
        pendingMatches.forEach(match => {
            if (match.bookingId) {
                bookingIdsInUse.add(match.bookingId);
            }
        });

        // Check matched matches
        matchedMatches.forEach(match => {
            if (match.bookingId) {
                bookingIdsInUse.add(match.bookingId);
            }
        });

        return bookingIdsInUse;
    };

    // Filter out bookings that are already in use
    const availableBookings = userBookings.filter(booking =>
        !getBookingsInUse().has(booking.bookingId)
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Enhanced Gradient Background */}
            <LinearGradient
                colors={['#10b68d', '#0a8d6d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
                    }
                >
                    <MatchHeader title="Match Center" />

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }}
                    >
                        {/* Create Match Request Form */}
                        <Animated.View
                            style={{
                                opacity: cardAnimations.form.opacity,
                                transform: [{ translateY: cardAnimations.form.translateY }]
                            }}
                        >
                            <MatchCreation
                                userId={userId}
                                availableBookings={availableBookings}
                                refreshData={fetchData}
                                loadingBookings={loadingBookings}
                            />
                        </Animated.View>

                        {/* Join Singles Section */}
                        <Animated.View
                            style={{
                                opacity: cardAnimations.joinSingles.opacity,
                                transform: [{ translateY: cardAnimations.joinSingles.translateY }]
                            }}
                        >
                            <JoinSingles
                                availableSinglesMatches={availableSinglesMatches}
                                userId={userId}
                                refreshing={refreshing}
                                onRefresh={fetchData}
                            />
                        </Animated.View>

                        {/* Join Doubles Section */}
                        <Animated.View
                            style={{
                                opacity: cardAnimations.joinDoubles.opacity,
                                transform: [{ translateY: cardAnimations.joinDoubles.translateY }]
                            }}
                        >
                            <JoinDoubles
                                availableDoublesMatches={availableDoublesMatches}
                                userId={userId}
                                refreshing={refreshing}
                                onRefresh={fetchData}
                            />
                        </Animated.View>

                        {/* Match Lists (Pending and Matched) */}
                        <MatchList
                            pendingMatches={pendingMatches}
                            matchedMatches={matchedMatches}
                            animations={{
                                pending: cardAnimations.pending,
                                matched: cardAnimations.matched
                            }}
                            onRefresh={fetchData}
                            currentUserId={userId}
                        />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    }
});