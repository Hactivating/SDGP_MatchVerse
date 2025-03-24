// app/(app)/find.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    RefreshControl,
    Animated,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getPendingMatches, getMatchedMatches, createMatchRequest, getUserBookingsForMatching } from '../../services/match';
import { useAuth } from '@/hooks/useAuth';
import { MatchHeader } from '@/components/match/MatchHeader';
import { MatchCreationForm } from '@/components/match/MatchCreationForm';
import { MatchItem } from '@/components/match/MatchItem';
import { JoinDoublesSection } from '@/components/match/JoinDoublesSection'; // Import the new component
import { LinearGradient } from 'expo-linear-gradient';
import { validateMatchRequest, isMatchComplete } from '@/components/match/helpers';

export default function MatchScreen() {
    const { state } = useAuth();
    const userId = state.user?.userId;

    const [matchType, setMatchType] = useState('single');
    const [bookingId, setBookingId] = useState('');
    const [useBooking, setUseBooking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingMatches, setPendingMatches] = useState([]);
    const [matchedMatches, setMatchedMatches] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userBookings, setUserBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

    // Card animations with staggered effect
    const cardAnimations = React.useRef({
        form: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        join: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
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
                join: 200,
                pending: 300,
                matched: 400
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

            // Process doubles matches separately
            if (doubleMatches.length > 0) {
                // Use the first match as the base for doubles
                const baseMatch = doubleMatches[0];
                const allParticipants = [];
                const teams = [];

                // First collect all participants and their partners
                doubleMatches.forEach(match => {
                    // Add creator
                    if (match.createdBy && !allParticipants.some(p => p.userId === match.createdBy.userId)) {
                        allParticipants.push(match.createdBy);

                        // If this player has a partner, add them as a team
                        if (match.partnerId && match.partner) {
                            // Check if partner is already in participants
                            if (!allParticipants.some(p => p.userId === match.partner.userId)) {
                                allParticipants.push(match.partner);
                            }

                            // Add them as a team
                            teams.push({
                                player1: match.createdBy,
                                player2: match.partner
                            });
                        }
                    }

                    // If we already have the partner from another entry, add them
                    else if (match.partnerId && match.partner &&
                        !allParticipants.some(p => p.userId === match.partner.userId)) {
                        allParticipants.push(match.partner);
                    }
                });

                // Limit to maximum 4 players for doubles
                const limitedParticipants = allParticipants.slice(0, 4);

                // Create consolidated doubles match
                consolidatedMatches.push({
                    ...baseMatch,
                    allParticipants: limitedParticipants,
                    teams: teams,
                    matchType: 'double'
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
                const bookingExists = userBookings.some(booking => booking.bookingId === bookingIdNum);
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
            fetchData(); // Refresh data after successful creation
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

    // Get the IDs of bookings that are already in pending or matched requests
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

            {/* Enhanced Gradient Background similar to home screen */}
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
                        </Animated.View>

                        {/* Join Doubles Section - NEW */}
                        <Animated.View
                            style={{
                                opacity: cardAnimations.join.opacity,
                                transform: [{ translateY: cardAnimations.join.translateY }]
                            }}
                        >
                            <JoinDoublesSection
                                userId={userId || 0}
                                onRefresh={fetchData}
                            />
                        </Animated.View>

                        {/* Pending Matches */}
                        <Animated.View
                            style={{
                                opacity: cardAnimations.pending.opacity,
                                transform: [{ translateY: cardAnimations.pending.translateY }]
                            }}
                        >
                            <MatchItem
                                title="Pending Matches"
                                matches={pendingMatches.map(match => ({
                                    ...match,
                                    isComplete: isMatchComplete(match.matchType, match.allParticipants?.length || 1)
                                }))}
                                status="pending"
                                emptyIconName="hourglass-outline"
                                emptyText="No pending matches found"
                            />
                        </Animated.View>

                        {/* Matched Matches */}
                        <Animated.View
                            style={{
                                opacity: cardAnimations.matched.opacity,
                                transform: [{ translateY: cardAnimations.matched.translateY }]
                            }}
                        >
                            <MatchItem
                                title="Matched Games"
                                matches={matchedMatches.map(match => ({
                                    ...match,
                                    isComplete: isMatchComplete(match.matchType, match.allParticipants?.length || 1)
                                }))}
                                status="matched"
                                emptyIconName="tennisball-outline"
                                emptyText="No matched games found"
                            />
                        </Animated.View>
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
    },
});