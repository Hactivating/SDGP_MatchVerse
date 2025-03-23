// app/(app)/find.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    TextInput,
    ActivityIndicator,
    Switch,
    RefreshControl,
    Image
} from 'react-native';
import { getPendingMatches, getMatchedMatches, createMatchRequest, getUserBookingsForMatching } from '../../services/match';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function MatchScreen() {
    const { state } = useAuth();
    const userId = state.user?.userId; // Correct property name // Default to 1 if no user in auth state

    const [bookingId, setBookingId] = useState('');
    const [useBooking, setUseBooking] = useState(false);
    const [matchType, setMatchType] = useState('single');
    const [loading, setLoading] = useState(false);
    const [pendingMatches, setPendingMatches] = useState([]);
    const [matchedMatches, setMatchedMatches] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userBookings, setUserBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const pendingResponse = await getPendingMatches();
            const matchedResponse = await getMatchedMatches();
            setPendingMatches(pendingResponse);
            setMatchedMatches(matchedResponse);
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
            // This now uses the updated function that filters out bookings already in match requests
            const bookings = await getUserBookingsForMatching(userId);
            setUserBookings(bookings || []);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleCreateMatchRequest = async () => {
        try {
            setLoading(true);

            const payload = {
                matchType: matchType,
                createdById: userId
            };

            // Only add bookingId if the switch is on and a booking ID is entered
            if (useBooking && bookingId.trim()) {
                const bookingIdNum = parseInt(bookingId, 10);
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

            await createMatchRequest(payload);
            Alert.alert('Success', 'Match request created successfully!');
            setBookingId('');
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

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'No date/time';
        return `${date} at ${time}`;
    };

    const getRankColor = (rank) => {
        if (!rank) return '#9CA3AF'; // Default gray

        if (rank.includes('Beginner')) return '#10B981'; // Green
        if (rank.includes('Intermediate')) return '#3B82F6'; // Blue
        if (rank.includes('Advanced')) return '#8B5CF6'; // Purple
        if (rank.includes('Expert')) return '#EF4444'; // Red

        return '#9CA3AF'; // Default gray
    };

    const renderUserInfo = (user) => {
        if (!user) return null;

        return (
            <View style={styles.userInfoContainer}>
                {user.userImageUrl ? (
                    <Image
                        source={{ uri: user.userImageUrl }}
                        style={styles.userAvatar}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.userAvatarPlaceholder}>
                        <Text style={styles.userAvatarText}>
                            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                )}
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.username || `User #${user.userId}`}</Text>
                    <View style={[styles.rankBadge, { backgroundColor: getRankColor(user.rank) }]}>
                        <Text style={styles.rankText}>{user.rank || 'Unranked'}</Text>
                    </View>
                </View>
            </View>
        );
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
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
                }
            >
                <Text style={styles.header}>Match Center</Text>

                {/* Create Match Request Form */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Create Match Request</Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    matchType === 'single' && styles.activeTypeButton
                                ]}
                                onPress={() => setMatchType('single')}
                            >
                                <Ionicons name="person" size={18} color={matchType === 'single' ? '#fff' : '#333'} />
                                <Text style={matchType === 'single' ? styles.activeButtonText : styles.buttonText}>
                                    Singles
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    matchType === 'double' && styles.activeTypeButton
                                ]}
                                onPress={() => setMatchType('double')}
                            >
                                <Ionicons name="people" size={18} color={matchType === 'double' ? '#fff' : '#333'} />
                                <Text style={matchType === 'double' ? styles.activeButtonText : styles.buttonText}>
                                    Doubles
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>I have a booking</Text>
                        <Switch
                            value={useBooking}
                            onValueChange={setUseBooking}
                            trackColor={{ false: '#e0e0e0', true: '#a7f3d0' }}
                            thumbColor={useBooking ? '#10b68d' : '#f4f3f4'}
                        />
                    </View>

                    {useBooking && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Booking ID:</Text>
                            <TextInput
                                style={styles.input}
                                value={bookingId}
                                onChangeText={setBookingId}
                                placeholder="Enter booking ID"
                                keyboardType="numeric"
                            />

                            {loadingBookings ? (
                                <ActivityIndicator color="#10b68d" style={{ marginVertical: 12 }} />
                            ) : availableBookings.length > 0 ? (
                                <View style={styles.bookingsContainer}>
                                    <Text style={styles.bookingsTitle}>Your available bookings:</Text>
                                    {availableBookings.map((booking) => (
                                        <TouchableOpacity
                                            key={booking.bookingId}
                                            style={styles.bookingItem}
                                            onPress={() => setBookingId(booking.bookingId.toString())}
                                        >
                                            <View style={styles.bookingItemRow}>
                                                <Ionicons name="calendar" size={16} color="#10b68d" />
                                                <Text style={styles.bookingItemText}>
                                                    {booking.court?.name || `Court ${booking.courtId}`} - {formatDateTime(booking.date, booking.startingTime)}
                                                </Text>
                                            </View>
                                            <Text style={styles.bookingId}>ID: {booking.bookingId}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noBookingsText}>You don't have any available bookings</Text>
                            )}
                        </View>
                    )}

                    {!useBooking && (
                        <View style={styles.infoContainer}>
                            <Ionicons name="information-circle-outline" size={18} color="#10b68d" />
                            <Text style={styles.infoText}>
                                You'll be matched with someone who has a court booking.
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleCreateMatchRequest}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>Create Match Request</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Pending Matches */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>
                            Pending Matches
                        </Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{pendingMatches.length}</Text>
                        </View>
                    </View>

                    {pendingMatches.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="hourglass-outline" size={36} color="#d1d5db" />
                            <Text style={styles.emptyText}>No pending matches found</Text>
                        </View>
                    ) : (
                        pendingMatches.map((match) => (
                            <View key={match.requestId} style={styles.matchItem}>
                                <View style={styles.matchHeader}>
                                    <View style={styles.matchTypeBadge}>
                                        <Ionicons
                                            name={match.matchType === 'single' ? 'person' : 'people'}
                                            size={12}
                                            color="#fff"
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={styles.matchTypeText}>
                                            {match.matchType.charAt(0).toUpperCase() + match.matchType.slice(1)}
                                        </Text>
                                    </View>
                                    <Text style={styles.pendingBadge}>Pending</Text>
                                </View>

                                <Text style={styles.matchId}>Request #{match.requestId}</Text>

                                {match.bookingId ? (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#10b68d" />
                                        <Text style={styles.infoText}>
                                            Booking: {match.booking ?
                                            `${match.booking.court?.name || 'Court'} on ${formatDateTime(match.booking.date, match.booking.startingTime)}` :
                                            `#${match.bookingId}`}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="search-outline" size={16} color="#10b68d" />
                                        <Text style={styles.infoText}>
                                            Looking for someone with a booking
                                        </Text>
                                    </View>
                                )}

                                {renderUserInfo(match.createdBy)}
                            </View>
                        ))
                    )}
                </View>

                {/* Matched Matches */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>
                            Matched Games
                        </Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{matchedMatches.length}</Text>
                        </View>
                    </View>

                    {matchedMatches.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="tennisball-outline" size={36} color="#d1d5db" />
                            <Text style={styles.emptyText}>No matched games found</Text>
                        </View>
                    ) : (
                        matchedMatches.map((match) => (
                            <View key={match.requestId} style={styles.matchItem}>
                                <View style={styles.matchHeader}>
                                    <View style={styles.matchTypeBadge}>
                                        <Ionicons
                                            name={match.matchType === 'single' ? 'person' : 'people'}
                                            size={12}
                                            color="#fff"
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={styles.matchTypeText}>
                                            {match.matchType.charAt(0).toUpperCase() + match.matchType.slice(1)}
                                        </Text>
                                    </View>
                                    <Text style={styles.matchedBadge}>Matched</Text>
                                </View>

                                <Text style={styles.matchId}>Match #{match.requestId}</Text>

                                {match.bookingId && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#10b68d" />
                                        <Text style={styles.infoText}>
                                            Booking: {match.booking ?
                                            `${match.booking.court?.name || 'Court'} on ${formatDateTime(match.booking.date, match.booking.startingTime)}` :
                                            `#${match.bookingId}`}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.playersContainer}>
                                    <Text style={styles.playersTitle}>Players:</Text>
                                    <View style={styles.playersList}>
                                        {renderUserInfo(match.createdBy)}
                                        {match.partnerId && renderUserInfo(match.partner)}
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
        flex: 1,
    },
    countBadge: {
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    countText: {
        fontWeight: 'bold',
        color: '#4b5563',
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    activeTypeButton: {
        backgroundColor: '#10b68d',
        borderColor: '#10b68d',
    },
    buttonText: {
        color: '#333',
        fontWeight: '500',
        marginLeft: 6,
    },
    activeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    infoText: {
        color: '#333',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#10b68d',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
        fontWeight: 'bold',
        fontSize: 12,
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
        color: '#d97706',
        fontWeight: 'bold',
        fontSize: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    matchedBadge: {
        backgroundColor: '#dbeafe',
        color: '#2563eb',
        fontWeight: 'bold',
        fontSize: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    matchId: {
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 8,
    },
    bookingsContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 12,
    },
    bookingsTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    bookingItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0fdf4',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    bookingItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookingItemText: {
        marginLeft: 8,
        color: '#333',
    },
    bookingId: {
        fontSize: 12,
        color: '#059669',
        marginTop: 4,
        fontWeight: '500',
    },
    noBookingsText: {
        textAlign: 'center',
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 12,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 8,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    userAvatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userDetails: {
        marginLeft: 8,
        flex: 1,
    },
    userName: {
        fontWeight: '500',
        fontSize: 14,
        color: '#333',
    },
    rankBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    rankText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    playersContainer: {
        marginTop: 8,
    },
    playersTitle: {
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    playersList: {
        gap: 8,
    }
});