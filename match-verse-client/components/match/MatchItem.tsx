import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { UserInfo } from './UserInfo';
import { getPendingMatches } from '@/services/match';

interface MatchItemProps {
    title: string;
    matches: any[];
    status: 'pending' | 'matched';
    emptyIconName: string;
    emptyText: string;
}

export const MatchItem: React.FC<MatchItemProps> = ({
                                                        title,
                                                        matches,
                                                        status,
                                                        emptyIconName,
                                                        emptyText,
                                                    }) => {
    const [bookingPlayers, setBookingPlayers] = useState<{[key: number]: any[]}>({});

    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    useEffect(() => {
        const fetchAllPlayersForBookings = async () => {
            if (matches.length === 0) return;

            try {
                const allPendingMatches = await getPendingMatches();

                const playersByBooking: {[key: number]: any[]} = {};

                matches.forEach(match => {
                    if (!match.bookingId) return;

                    // Find all matches for this booking
                    const bookingMatches = allPendingMatches.filter(m =>
                        m.bookingId === match.bookingId &&
                        m.matchType === match.matchType
                    );

                    const uniquePlayers = new Set<string>();
                    const allPlayers: any[] = [];

                    bookingMatches.forEach(bm => {
                        // Add creator
                        if (bm.createdBy && !uniquePlayers.has(`c-${bm.createdById}`)) {
                            uniquePlayers.add(`c-${bm.createdById}`);
                            allPlayers.push({
                                ...bm.createdBy,
                                role: 'Creator',
                                badgeColor: '#f0fdf4',
                                textColor: '#10b68d'
                            });
                        }

                        if (bm.partner && bm.partnerId && !uniquePlayers.has(`p-${bm.partnerId}`)) {
                            uniquePlayers.add(`p-${bm.partnerId}`);
                            allPlayers.push({
                                ...bm.partner,
                                role: 'Partner',
                                badgeColor: '#dbeafe',
                                textColor: '#2563eb'
                            });
                        }
                    });

                    playersByBooking[match.bookingId] = allPlayers;
                });

                setBookingPlayers(playersByBooking);
            } catch (error) {
                console.error('Error fetching all players:', error);
            }
        };

        fetchAllPlayersForBookings();
    }, [matches]);

    const formatDateTime = (date, time) => {
        if (!date || !time) return 'No date/time';
        return `${date} at ${time}`;
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)']}
                className="backdrop-blur-md rounded-2xl p-5"
            >
                <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardTitle, { fontFamily: 'Poppins-Bold' }]}>
                        {title}
                    </Text>
                    <View style={styles.countBadge}>
                        <Text style={[styles.countText, { fontFamily: 'Poppins-Bold' }]}>
                            {matches.length}
                        </Text>
                    </View>
                </View>

                {matches.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name={emptyIconName} size={36} color="#d1d5db" />
                        <Text style={[styles.emptyText, { fontFamily: 'Poppins-Regular' }]}>
                            {emptyText}
                        </Text>
                    </View>
                ) : (
                    matches.map((match) => (
                        <View key={match.requestId} style={styles.matchItem}>
                            <View style={styles.matchHeader}>
                                <View style={styles.matchTypeBadge}>
                                    <Ionicons
                                        name={match.matchType === 'single' ? 'person' : 'people'}
                                        size={12}
                                        color="#fff"
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text style={[styles.matchTypeText, { fontFamily: 'Poppins-Bold' }]}>
                                        {match.matchType.charAt(0).toUpperCase() + match.matchType.slice(1)}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        status === 'pending' ? styles.pendingBadge : styles.matchedBadge,
                                        { fontFamily: 'Poppins-Bold' }
                                    ]}
                                >
                                    {status === 'pending' ? 'Pending' : 'Matched'}
                                </Text>
                            </View>

                            <Text style={[styles.matchId, { fontFamily: 'Poppins-Medium' }]}>
                                {status === 'pending' ? 'Request' : 'Match'} #{match.requestId}
                            </Text>

                            {match.bookingId ? (
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#10b68d" />
                                    <Text style={[styles.infoText, { fontFamily: 'Poppins-Regular' }]}>
                                        Booking: {match.booking ?
                                        `${match.booking.court?.name || 'Court'} on ${formatDateTime(match.booking.date, match.booking.startingTime)}` :
                                        `#${match.bookingId}`}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.infoRow}>
                                    <Ionicons name="search-outline" size={16} color="#10b68d" />
                                    <Text style={[styles.infoText, { fontFamily: 'Poppins-Regular' }]}>
                                        Looking for someone with a booking
                                    </Text>
                                </View>
                            )}

                            <View style={styles.playersContainer}>
                                <Text style={[styles.playersTitle, { fontFamily: 'Poppins-Medium' }]}>
                                    {status === 'pending' ? 'Players' : 'Players'}:
                                    {match.bookingId && bookingPlayers[match.bookingId] && (
                                        <Text style={{ color: '#10b68d' }}> ({bookingPlayers[match.bookingId].length}/4)</Text>
                                    )}
                                </Text>

                                <View style={styles.playersList}>
                                    {match.matchType === 'double' && match.bookingId && bookingPlayers[match.bookingId] ? (
                                        bookingPlayers[match.bookingId].map((player, index) => (
                                            <View key={`${player.userId}-${index}`} style={styles.playerItem}>
                                                <View style={styles.playerBubble}>
                                                    <Text style={styles.playerInitial}>
                                                        {player.username ? player.username.charAt(0).toUpperCase() : '?'}
                                                    </Text>
                                                </View>
                                                <Text style={[styles.playerName, { fontFamily: 'Poppins-Medium' }]}>
                                                    {player.username || 'Unknown User'}
                                                </Text>
                                                <View style={[styles.roleBadge, { backgroundColor: player.badgeColor }]}>
                                                    <Text style={[styles.roleBadgeText, {
                                                        fontFamily: 'Poppins-Regular',
                                                        color: player.textColor
                                                    }]}>
                                                        {player.role || 'Player'}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        status === 'pending' ? (
                                            <>
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
                                                        <View style={styles.roleBadge}>
                                                            <Text style={[styles.roleBadgeText, { fontFamily: 'Poppins-Regular' }]}>
                                                                Creator
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}

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
                                                        <View style={[styles.roleBadge, { backgroundColor: '#dbeafe' }]}>
                                                            <Text style={[styles.roleBadgeText, {
                                                                fontFamily: 'Poppins-Regular',
                                                                color: '#2563eb'
                                                            }]}>
                                                                Partner
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </>
                                        ) : (
                                            match.allParticipants && match.allParticipants.length > 0 ? (
                                                match.allParticipants.map(user => (
                                                    <UserInfo key={user.userId} user={user} />
                                                ))
                                            ) : (
                                                <>
                                                    <Text style={[styles.playerSubtitle, { fontFamily: 'Poppins-Medium' }]}>Player 1:</Text>
                                                    <UserInfo user={match.createdBy} />

                                                    <Text style={[styles.playerSubtitle, { fontFamily: 'Poppins-Medium' }]}>Player 2:</Text>
                                                    {match.partnerId && match.partner ? (
                                                        <UserInfo user={match.partner} />
                                                    ) : (
                                                        <Text style={[styles.noOpponentText, { fontFamily: 'Poppins-Regular' }]}>
                                                            Opponent information not available
                                                        </Text>
                                                    )}
                                                </>
                                            )
                                        )
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
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
        color: '#4b5563',
        fontSize: 14,
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
        fontSize: 12,
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
        color: '#d97706',
        fontSize: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    matchedBadge: {
        backgroundColor: '#dbeafe',
        color: '#2563eb',
        fontSize: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    matchId: {
        marginBottom: 12,
        color: '#333',
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
    playersContainer: {
        marginTop: 8,
    },
    playersTitle: {
        marginBottom: 8,
        color: '#333',
    },
    playersList: {
        gap: 8,
    },
    playerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 4,
    },
    noOpponentText: {
        fontStyle: 'italic',
        color: '#9ca3af',
        paddingVertical: 8,
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
    roleBadge: {
        backgroundColor: '#f0fdf4',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    roleBadgeText: {
        color: '#10b68d',
        fontSize: 10,
    }
});