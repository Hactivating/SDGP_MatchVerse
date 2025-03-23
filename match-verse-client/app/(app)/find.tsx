import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    TextInput,
    Alert,
    Animated,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import {
    getBookings,
    createMatchRequest,
    getPendingMatches,
    getMatchedMatches,
    acceptMatchRequest,
    cancelMatchRequest
} from '@/services/match';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// Type definitions
interface Booking {
    bookingId: number;
    courtId: number;
    date: string;
    startingTime: string;
    userId?: number;
    court: {
        name: string;
        venue: {
            venueName: string;
            location: string;
        }
    }
}

interface MatchRequest {
    requestId: number;
    bookingId: number;
    matchType: 'single' | 'double';
    createdById: number;
    partnerId?: number;
    status: 'pending' | 'matched' | 'cancelled';
    createdAt: string;
    booking?: Booking;
    createdBy?: {
        name?: string;
        displayName?: string;
        email?: string;
        userId?: number;
    };
    partner?: {
        name?: string;
        displayName?: string;
        email?: string;
        userId?: number;
    };
}

interface GradientButtonProps {
    onPress: () => void;
    text: string;
    icon?: React.ReactNode;
    small?: boolean;
    disabled?: boolean;
}

interface MatchCardProps {
    match: MatchRequest;
    onAccept: (requestId: number) => void;
    onCancel: (requestId: number) => void;
    isUserRequest: boolean;
    isUserMatch: boolean;
}

interface BookingCardProps {
    booking: Booking;
    onPress: (booking: Booking) => void;
    isUserBooking?: boolean;
}

// Format time from 24hr to 12hr format
function formatTime(time: string): string {
    const hour = parseInt(time);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${suffix}`;
}

function getCurrentDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
}

// Component definitions
const GradientButton: React.FC<GradientButtonProps> = ({ onPress, text, icon, small = false, disabled = false }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    return (
        <TouchableOpacity
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Animated.View
                style={{
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    opacity: disabled ? 0.6 : 1
                }}
            >
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    className={`flex-row ${small ? 'py-2 px-4' : 'py-3 px-5'} rounded-full items-center shadow-md`}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white mr-1.5">
                        {text}
                    </Text>
                    {icon}
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};

const MatchCard: React.FC<MatchCardProps> = ({ match, onAccept, onCancel, isUserRequest, isUserMatch }) => {
    const matchTime = match.booking?.startingTime
        ? formatTime(match.booking.startingTime)
        : "Time not available";

    const venueName = match.booking?.court?.venue?.venueName || "Venue not available";
    const courtName = match.booking?.court?.name || "Court not available";
    const location = match.booking?.court?.venue?.location || "Location not available";

    const creatorName = match.createdBy?.displayName || match.createdBy?.name || "Anonymous";
    const partnerName = match.partnerId
        ? (match.partner?.displayName || match.partner?.name || "Partner not found")
        : "No partner";

    return (
        <Animated.View className="mb-4">
            <View className={`rounded-xl overflow-hidden border ${
                match.status === 'matched'
                    ? 'bg-[rgba(16,182,141,0.15)] border-[rgba(16,182,141,0.3)]'
                    : 'bg-[rgba(16,182,141,0.05)] border-[rgba(16,182,141,0.2)]'
            }`}>
                <View className="p-4">
                    <View className="mb-2 flex-row justify-between">
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800">
                            {match.matchType === 'single' ? 'Singles Match' : 'Doubles Match'}
                            {match.status === 'matched' && ' (Matched)'}
                        </Text>
                        <View className="flex-row items-center">
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1 text-sm">Badminton</Text>
                            <Text style={{ fontSize: 14 }}>🏸</Text>
                        </View>
                    </View>

                    <View className="mb-3">
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800">{venueName}</Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">{courtName}</Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-sm">{location}</Text>
                    </View>

                    <View className="bg-gray-100 rounded-lg p-3 mb-3">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700">Created by:</Text>
                            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">{creatorName}</Text>
                        </View>
                        {match.matchType === 'double' && (
                            <View className="flex-row justify-between items-center">
                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700">Partner:</Text>
                                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">{partnerName}</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={18} color="#10b68d" />
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] ml-1">{matchTime}</Text>
                        </View>

                        {!isUserRequest && !isUserMatch && match.status === 'pending' && (
                            <GradientButton
                                onPress={() => onAccept(match.requestId)}
                                text="Join Match"
                                icon={<Ionicons name="checkmark" size={16} color="white" />}
                                small={true}
                            />
                        )}

                        {isUserRequest && match.status === 'pending' && (
                            <GradientButton
                                onPress={() => onCancel(match.requestId)}
                                text="Cancel"
                                icon={<Ionicons name="close" size={16} color="white" />}
                                small={true}
                            />
                        )}

                        {match.status === 'matched' && (
                            <View className="bg-[rgba(16,182,141,0.2)] px-3 py-1.5 rounded-lg">
                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d]">Confirmed</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress, isUserBooking = false }) => {
    return (
        <Animated.View className="mb-4">
            <View className={`rounded-xl overflow-hidden border ${
                isUserBooking
                    ? 'bg-[rgba(16,182,141,0.1)] border-[rgba(16,182,141,0.25)]'
                    : 'bg-[rgba(16,182,141,0.05)] border-[rgba(16,182,141,0.2)]'
            }`}>
                <View className="p-4">
                    <View className="mb-3">
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800">
                            {booking.court.venue.venueName}
                            {isUserBooking && ' (Your Booking)'}
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">{booking.court.name}</Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-sm">{booking.court.venue.location}</Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={18} color="#10b68d" />
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] ml-1">{formatTime(booking.startingTime)}</Text>
                        </View>
                        <GradientButton
                            onPress={() => onPress(booking)}
                            text={isUserBooking ? "Find Players" : "Create Match"}
                            icon={<Ionicons name="people" size={16} color="white" />}
                            small={true}
                        />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};
// Continue from Part 1
const FindScreen: React.FC = () => {
    const { state } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [pendingMatches, setPendingMatches] = useState<MatchRequest[]>([]);
    const [matchedMatches, setMatchedMatches] = useState<MatchRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDoubles, setIsDoubles] = useState(false);
    const [partnerId, setPartnerId] = useState('');
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const [scrollY] = useState(new Animated.Value(0));
    const [activeTab, setActiveTab] = useState('courts');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const headerTitleAnim = useRef(new Animated.Value(0)).current;

    // Card animations
    const cardAnimations = useRef({
        date: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        tabs: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        content: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) }
    }).current;

    // Create animation values for cards
    const itemCardAnimations = useRef(Array(20).fill(0).map(() => ({
        translateY: new Animated.Value(15),
        opacity: new Animated.Value(0)
    }))).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

    const headerTitleStyle = {
        opacity: headerTitleAnim,
        transform: [
            {
                translateY: headerTitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                }),
            },
        ],
    };

    // Fetch available bookings
    const fetchBookings = async (): Promise<void> => {
        if (!state.user?.userId) return;

        try {
            setLoading(true);
            const data = await getBookings(selectedDate);

            const available = data.filter((booking: Booking) => !booking.userId);
            const userOwned = data.filter((booking: Booking) => booking.userId === state.user?.userId);

            setBookings(available);
            setUserBookings(userOwned);
            setError(null);

            // Animate booking cards once data is loaded
            itemCardAnimations.forEach((anim, index) => {
                Animated.parallel([
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 500,
                        delay: 400 + (index * 80),
                        useNativeDriver: true
                    }),
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        delay: 400 + (index * 80),
                        useNativeDriver: true
                    })
                ]).start();
            });
        } catch (err) {
            setError('Failed to load available bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch match requests
    const fetchMatches = async (): Promise<void> => {
        if (!state.user?.userId) return;

        try {
            setMatchesLoading(true);
            const [pendingData, matchedData] = await Promise.all([
                getPendingMatches(),
                getMatchedMatches()
            ]);

            setPendingMatches(pendingData);
            setMatchedMatches(matchedData);

            // Animate match cards
            itemCardAnimations.forEach((anim, index) => {
                Animated.parallel([
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 500,
                        delay: 400 + (index * 80),
                        useNativeDriver: true
                    }),
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        delay: 400 + (index * 80),
                        useNativeDriver: true
                    })
                ]).start();
            });
        } catch (err) {
            console.error('Error fetching matches:', err);
        } finally {
            setMatchesLoading(false);
        }
    };

    // Refresh all data
    const refreshData = async (): Promise<void> => {
        await fetchBookings();
        await fetchMatches();
    };

    // Start animations and fetch data
    useEffect(() => {
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
            Animated.timing(headerTitleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered animations for cards
        const animateCards = () => {
            const delays = {
                date: 100,
                tabs: 200,
                content: 300
            };

            Object.entries(cardAnimations).forEach(([key, anim]) => {
                const delayKey = key as keyof typeof delays;
                Animated.parallel([
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        delay: delays[delayKey],
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 500,
                        delay: delays[delayKey],
                        useNativeDriver: true,
                    })
                ]).start();
            });
        };

        animateCards();
        refreshData();
    }, [state.user?.userId]);

    // Refresh when date changes
    useEffect(() => {
        fetchBookings();
    }, [selectedDate]);

    // Handle date selection
    const handleDateChange = (offset: number): void => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + offset);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    // Open match creation modal
    const openCreateMatchModal = (booking: Booking): void => {
        setSelectedBooking(booking);
        setModalVisible(true);
    };

    // Handle match request creation
    const handleCreateMatchRequest = async (): Promise<void> => {
        if (!state.user?.userId || !selectedBooking) {
            Alert.alert('Error', 'You must be logged in to create a match request');
            return;
        }

        try {
            setModalVisible(false);
            const payload = {
                bookingId: selectedBooking.bookingId,
                matchType: isDoubles ? 'double' : 'single',
                createdById: state.user.userId,
                partnerId: isDoubles && partnerId ? Number(partnerId) : undefined
            };

            await createMatchRequest(payload);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Match request created successfully');

            refreshData();
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to create match request');
            console.error('Error creating match request:', err);
        }
    };

    // Handle accepting a match request
    const handleAcceptMatchRequest = async (requestId: number): Promise<void> => {
        if (!state.user?.userId) {
            Alert.alert('Error', 'You must be logged in to join a match');
            return;
        }

        try {
            await acceptMatchRequest(requestId, state.user.userId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'You have joined the match!');

            refreshData();
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to join the match');
            console.error('Error accepting match request:', err);
        }
    };

    // Handle canceling a match request
    const handleCancelMatchRequest = async (requestId: number): Promise<void> => {
        try {
            await cancelMatchRequest(requestId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Match request canceled');

            refreshData();
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to cancel match request');
            console.error('Error canceling match request:', err);
        }
    };

    // Check if a match request was created by the current user
    const isUserRequest = (match: MatchRequest): boolean => {
        return match.createdById === state.user?.userId;
    };

    // Check if a match involves the current user
    const isUserMatch = (match: MatchRequest): boolean => {
        return match.createdById === state.user?.userId || match.partnerId === state.user?.userId;
    };

    // Frosted glass style
    const frostedGlassStyle = {
        colors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)'],
        className: "backdrop-blur-md rounded-2xl shadow-lg"
    };

    // Loading state
    if (loading && bookings.length === 0 && activeTab === 'courts') {
        return (
            <View className="flex-1 justify-center items-center">
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 12 }} className="text-white text-base">Loading available courts...</Text>
            </View>
        );
    }

    // Error state
    if (error && bookings.length === 0 && activeTab === 'courts') {
        return (
            <SafeAreaView className="flex-1">
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="cloud-offline" size={64} color="#ffffff" />
                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 16, marginBottom: 24 }} className="text-white text-center text-lg">{error}</Text>
                    <GradientButton
                        onPress={() => fetchBookings()}
                        text="Try Again"
                        small={false}
                    />
                </View>
            </SafeAreaView>
        );

    }
    // Main UI
    return (
        <View className="flex-1">
            <StatusBar style="light" />

            <LinearGradient
                colors={['#10b68d', '#0a8d6d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView className="flex-1">
                <Animated.View style={[{ opacity: headerOpacity }, headerTitleStyle]} className="pt-8 px-6 pb-5">
                    <View className="flex-1">
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 28, lineHeight: 34 }} className="text-white">
                            Find a Match
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }} className="text-white text-base opacity-90">
                            Book a court and find opponents
                        </Text>
                    </View>
                </Animated.View>

                <Animated.ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }}
                    >
                        <Animated.View
                            className="mx-6 overflow-hidden rounded-2xl shadow-lg"
                            style={{
                                opacity: cardAnimations.date.opacity,
                                transform: [{ translateY: cardAnimations.date.translateY }]
                            }}
                        >
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="p-4 backdrop-blur-md"
                            >
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }} className="text-gray-800 mb-4 text-center">Select Date</Text>
                                <View className="flex-row justify-between items-center">
                                    <TouchableOpacity
                                        className="w-10 h-10 rounded-full bg-[rgba(16,182,141,0.15)] items-center justify-center"
                                        onPress={() => handleDateChange(-1)}
                                    >
                                        <Ionicons name="chevron-back" size={20} color="#10b68d" />
                                    </TouchableOpacity>

                                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16 }} className="text-gray-800">
                                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </Text>

                                    <TouchableOpacity
                                        className="w-10 h-10 rounded-full bg-[rgba(16,182,141,0.15)] items-center justify-center"
                                        onPress={() => handleDateChange(1)}
                                    >
                                        <Ionicons name="chevron-forward" size={20} color="#10b68d" />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        <Animated.View
                            className="mx-6 mt-7 overflow-hidden rounded-2xl shadow-lg"
                            style={{
                                opacity: cardAnimations.tabs.opacity,
                                transform: [{ translateY: cardAnimations.tabs.translateY }]
                            }}
                        >
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="backdrop-blur-md"
                            >
                                <View className="flex-row">
                                    <TouchableOpacity
                                        className={`flex-1 py-4 px-2 ${activeTab === 'courts' ? 'border-b-2 border-[#10b68d]' : ''}`}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setActiveTab('courts');
                                        }}
                                    >
                                        <Text
                                            style={{ fontFamily: 'Poppins-Medium', textAlign: 'center' }}
                                            className={activeTab === 'courts' ? 'text-[#10b68d]' : 'text-gray-500'}
                                        >
                                            Courts
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className={`flex-1 py-4 px-2 ${activeTab === 'pending' ? 'border-b-2 border-[#10b68d]' : ''}`}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setActiveTab('pending');
                                            fetchMatches();
                                        }}
                                    >
                                        <Text
                                            style={{ fontFamily: 'Poppins-Medium', textAlign: 'center' }}
                                            className={activeTab === 'pending' ? 'text-[#10b68d]' : 'text-gray-500'}
                                        >
                                            Open Matches
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className={`flex-1 py-4 px-2 ${activeTab === 'matches' ? 'border-b-2 border-[#10b68d]' : ''}`}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setActiveTab('matches');
                                            fetchMatches();
                                        }}
                                    >
                                        <Text
                                            style={{ fontFamily: 'Poppins-Medium', textAlign: 'center' }}
                                            className={activeTab === 'matches' ? 'text-[#10b68d]' : 'text-gray-500'}
                                        >
                                            My Matches
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        <Animated.View
                            className="mx-6 mt-7 mb-4 overflow-hidden rounded-2xl shadow-lg"
                            style={{
                                opacity: cardAnimations.content.opacity,
                                transform: [{ translateY: cardAnimations.content.translateY }]
                            }}
                        >
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="p-5 backdrop-blur-md"
                            >
                                {activeTab === 'courts' && (
                                    <>
                                        <View className="flex-row justify-between items-center mb-4">
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800">Available Courts</Text>
                                            <View className="flex-row items-center">
                                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">Badminton</Text>
                                                <Text style={{ fontSize: 18 }}>🏸</Text>
                                            </View>
                                        </View>

                                        {userBookings.length > 0 && (
                                            <View className="mb-5">
                                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }} className="text-gray-800 mb-3">Your Bookings</Text>
                                                {userBookings.map((booking, index) => (
                                                    <Animated.View
                                                        key={booking.bookingId}
                                                        style={{
                                                            opacity: itemCardAnimations[index % 20].opacity,
                                                            transform: [
                                                                { translateY: itemCardAnimations[index % 20].translateY }
                                                            ],
                                                            marginBottom: 16
                                                        }}
                                                    >
                                                        <BookingCard
                                                            booking={booking}
                                                            onPress={openCreateMatchModal}
                                                            isUserBooking={true}
                                                        />
                                                    </Animated.View>
                                                ))}
                                            </View>
                                        )}

                                        {loading ? (
                                            <View className="items-center justify-center py-8">
                                                <ActivityIndicator size="large" color="#10b68d" />
                                                <Text style={{ fontFamily: 'Poppins-Regular', marginTop: 8 }} className="text-gray-500">Refreshing available courts...</Text>
                                            </View>
                                        ) : error ? (
                                            <View className="items-center justify-center py-8">
                                                <Ionicons name="cloud-offline" size={48} color="#f43f5e" />
                                                <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-red-500 text-center mb-2">{error}</Text>
                                                <GradientButton
                                                    onPress={() => fetchBookings()}
                                                    text="Try Again"
                                                    small={true}
                                                />
                                            </View>
                                        ) : bookings.length === 0 ? (
                                            <View className="items-center justify-center py-8">
                                                <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                                                <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-gray-500 text-center">No available courts for this date</Text>
                                                <TouchableOpacity
                                                    className="mt-4 flex-row items-center"
                                                    onPress={() => handleDateChange(1)}
                                                >
                                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">Try next day</Text>
                                                    <Ionicons name="chevron-forward" size={16} color="#10b68d" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    className="flex-row items-center justify-center mb-5 bg-[rgba(16,182,141,0.1)] p-3 rounded-lg"
                                                    onPress={() => router.push('/(app)/venues')}
                                                >
                                                    <Ionicons name="search" size={18} color="#10b68d" />
                                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] ml-2">Browse All Venues</Text>
                                                </TouchableOpacity>

                                                {bookings.map((booking, index) => (
                                                    <Animated.View
                                                        key={booking.bookingId}
                                                        style={{
                                                            opacity: itemCardAnimations[index % 20].opacity,
                                                            transform: [
                                                                { translateY: itemCardAnimations[index % 20].translateY }
                                                            ],
                                                            marginBottom: 16
                                                        }}
                                                    >
                                                        <BookingCard
                                                            booking={booking}
                                                            onPress={openCreateMatchModal}
                                                            isUserBooking={false}
                                                        />
                                                    </Animated.View>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}

                                {activeTab === 'pending' && (
                                    <>
                                        <View className="flex-row justify-between items-center mb-4">
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800">Open Matches</Text>
                                            <TouchableOpacity
                                                className="flex-row items-center"
                                                onPress={() => fetchMatches()}
                                            >
                                                <Ionicons name="refresh" size={18} color="#10b68d" />
                                                <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14 }} className="text-[#10b68d] ml-1">Refresh</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {matchesLoading ? (
                                            <View className="items-center justify-center py-8">
                                                <ActivityIndicator size="large" color="#10b68d" />
                                                <Text style={{ fontFamily: 'Poppins-Regular', marginTop: 8 }} className="text-gray-500">Loading available matches...</Text>
                                            </View>
                                        ) : pendingMatches.length === 0 ? (
                                            <View className="items-center justify-center py-8">
                                                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                                                <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-gray-500 text-center">No open matches available</Text>
                                                <TouchableOpacity
                                                    className="mt-4 flex-row items-center"
                                                    onPress={() => setActiveTab('courts')}
                                                >
                                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">Create a new match</Text>
                                                    <Ionicons name="chevron-forward" size={16} color="#10b68d" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <>
                                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700 mb-4">
                                                    Join an existing match or wait for players to join yours.
                                                </Text>

                                                {pendingMatches
                                                    .filter(match => !isUserRequest(match))
                                                    .map((match, index) => (
                                                        <Animated.View
                                                            key={match.requestId}
                                                            style={{
                                                                opacity: itemCardAnimations[index % 20].opacity,
                                                                transform: [{ translateY: itemCardAnimations[index % 20].translateY }]
                                                            }}
                                                        >
                                                            <MatchCard
                                                                match={match}
                                                                onAccept={handleAcceptMatchRequest}
                                                                onCancel={handleCancelMatchRequest}
                                                                isUserRequest={isUserRequest(match)}
                                                                isUserMatch={isUserMatch(match)}
                                                            />
                                                        </Animated.View>
                                                    ))
                                                }

                                                {pendingMatches.some(match => isUserRequest(match)) && (
                                                    <>
                                                        <View className="my-6 h-px bg-gray-200" />
                                                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800 mb-4">
                                                            Your Open Requests
                                                        </Text>

                                                        {pendingMatches
                                                            .filter(match => isUserRequest(match))
                                                            .map((match, index) => (
                                                                <Animated.View
                                                                    key={match.requestId}
                                                                    style={{
                                                                        opacity: itemCardAnimations[(index + 10) % 20].opacity,
                                                                        transform: [{ translateY: itemCardAnimations[(index + 10) % 20].translateY }]
                                                                    }}
                                                                >
                                                                    <MatchCard
                                                                        match={match}
                                                                        onAccept={handleAcceptMatchRequest}
                                                                        onCancel={handleCancelMatchRequest}
                                                                        isUserRequest={true}
                                                                        isUserMatch={true}
                                                                    />
                                                                </Animated.View>
                                                            ))
                                                        }
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {activeTab === 'matches' && (
                                    <>
                                        <View className="flex-row justify-between items-center mb-4">
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800">My Matches</Text>
                                            <TouchableOpacity
                                                className="flex-row items-center"
                                                onPress={() => fetchMatches()}
                                            >
                                                <Ionicons name="refresh" size={18} color="#10b68d" />
                                                <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14 }} className="text-[#10b68d] ml-1">Refresh</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {matchesLoading ? (
                                            <View className="items-center justify-center py-8">
                                                <ActivityIndicator size="large" color="#10b68d" />
                                                <Text style={{ fontFamily: 'Poppins-Regular', marginTop: 8 }} className="text-gray-500">Loading your matches...</Text>
                                            </View>
                                        ) : !matchedMatches.some(match => isUserMatch(match)) && !pendingMatches.some(match => isUserRequest(match)) ? (
                                            <View className="items-center justify-center py-8">
                                                <Ionicons name="tennisball-outline" size={48} color="#9ca3af" />
                                                <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-gray-500 text-center">You don't have any matches yet</Text>
                                                <TouchableOpacity
                                                    className="mt-4 flex-row items-center"
                                                    onPress={() => setActiveTab('courts')}
                                                >
                                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">Find a match</Text>
                                                    <Ionicons name="chevron-forward" size={16} color="#10b68d" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <>
                                                {matchedMatches.some(match => isUserMatch(match)) && (
                                                    <>
                                                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800 mb-4">
                                                            Confirmed Matches
                                                        </Text>

                                                        {matchedMatches
                                                            .filter(match => isUserMatch(match))
                                                            .map((match, index) => (
                                                                <Animated.View
                                                                    key={match.requestId}
                                                                    style={{
                                                                        opacity: itemCardAnimations[index % 20].opacity,
                                                                        transform: [{ translateY: itemCardAnimations[index % 20].translateY }]
                                                                    }}
                                                                >
                                                                    <MatchCard
                                                                        match={match}
                                                                        onAccept={handleAcceptMatchRequest}
                                                                        onCancel={handleCancelMatchRequest}
                                                                        isUserRequest={isUserRequest(match)}
                                                                        isUserMatch={true}
                                                                    />
                                                                </Animated.View>
                                                            ))
                                                        }
                                                    </>
                                                )}

                                                {pendingMatches.some(match => isUserRequest(match)) && (
                                                    <>
                                                        <View className="my-6 h-px bg-gray-200" />
                                                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800 mb-4">
                                                            Your Pending Requests
                                                        </Text>

                                                        {pendingMatches
                                                            .filter(match => isUserRequest(match))
                                                            .map((match, index) => (
                                                                <Animated.View
                                                                    key={match.requestId}
                                                                    style={{
                                                                        opacity: itemCardAnimations[(index + 10) % 20].opacity,
                                                                        transform: [{ translateY: itemCardAnimations[(index + 10) % 20].translateY }]
                                                                    }}
                                                                >
                                                                    <MatchCard
                                                                        match={match}
                                                                        onAccept={handleAcceptMatchRequest}
                                                                        onCancel={handleCancelMatchRequest}
                                                                        isUserRequest={true}
                                                                        isUserMatch={true}
                                                                    />
                                                                </Animated.View>
                                                            ))
                                                        }
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </LinearGradient>
                        </Animated.View>
                    </Animated.View>
                </Animated.ScrollView>
            </SafeAreaView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 mb-6 text-center">
                            Create a Match
                        </Text>

                        {selectedBooking && (
                            <View className="bg-[rgba(16,182,141,0.05)] rounded-xl p-4 mb-6 border border-[rgba(16,182,141,0.2)]">
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800 mb-1">
                                    {selectedBooking.court.venue.venueName}
                                </Text>
                                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600 mb-1">
                                    {selectedBooking.court.name}
                                </Text>
                                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-sm mb-2">
                                    {selectedBooking.court.venue.location}
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={16} color="#10b68d" />
                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] ml-1">
                                        {formatTime(selectedBooking.startingTime)} - {new Date(selectedBooking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-gray-800 mb-3">Match Type</Text>
                        <View className="flex-row items-center justify-between mb-6">
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700">{isDoubles ? "Doubles" : "Singles"}</Text>
                            <Switch
                                trackColor={{ false: "#d1d5db", true: "rgba(16,182,141,0.4)" }}
                                thumbColor={isDoubles ? "#10b68d" : "#f4f3f4"}
                                ios_backgroundColor="#d1d5db"
                                onValueChange={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setIsDoubles(!isDoubles);
                                }}
                                value={isDoubles}
                            />
                        </View>

                        {isDoubles && (
                            <View className="mb-6">
                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700 mb-2">Partner ID</Text>
                                <TextInput
                                    className="bg-[rgba(16,182,141,0.05)] border border-[rgba(16,182,141,0.2)] rounded-lg p-3"
                                    value={partnerId}
                                    onChangeText={setPartnerId}
                                    placeholder="Enter your partner's user ID"
                                    keyboardType="numeric"
                                    style={{ fontFamily: 'Poppins-Regular' }}
                                />
                                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }} className="text-gray-500 mt-1">
                                    Your partner needs to have an account and share their user ID with you.
                                </Text>
                            </View>
                        )}

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                className="flex-1 py-3 bg-gray-100 rounded-full"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={{ fontFamily: 'Poppins-Medium', textAlign: 'center' }} className="text-gray-700">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 py-3 rounded-full"
                                onPress={handleCreateMatchRequest}
                                disabled={isDoubles && !partnerId}
                            >
                                <LinearGradient
                                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                                    className="absolute inset-0 rounded-full"
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                                <Text style={{ fontFamily: 'Poppins-Bold', textAlign: 'center' }} className="text-white">Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FindScreen;


