import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { getAllVenues, getAllCourts, Venue, Court, getSportIcon, getSportColor } from '@/services/venue';
import { format, addDays } from 'date-fns';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

const bookingsApi = {
    getByCourtAndDate: (courtId, date) => {
        if (!courtId) {
            throw new Error('Court ID is required');
        }

        if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('Date must be in YYYY-MM-DD format');
        }

        return api.get(`/bookings/${courtId}/${date}`);
    },
    createUserBooking: (bookingData) => {
        return api.post('/bookings/user', bookingData);
    }
};

interface Booking {
    date: string;
    starts: string;
    isBooked: boolean;
}

// Enhanced Button Component
const GradientButton = ({ onPress, text, icon, small, disabled = false, loading = false }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        if (!disabled && !loading) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={disabled || loading}
        >
            <Animated.View
                style={{
                    opacity: disabled ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                }}
            >
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    className={`flex-row ${small ? 'py-2 px-4' : 'py-3 px-5'} rounded-lg items-center justify-center shadow-md`}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-center">
                                {text}
                            </Text>
                            {icon && <View className="ml-1.5">{icon}</View>}
                        </>
                    )}
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function VenueDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { state } = useAuth();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<number[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false);

    // Animation references
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    const generateNextSevenDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(new Date(), i));
        }
        return days;
    };

    const nextSevenDays = generateNextSevenDays();

    useEffect(() => {
        fetchVenueData();

        // Start animations
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
    }, [id]);

    useEffect(() => {
        if (selectedCourt && selectedDate) {
            fetchBookings();
        }
    }, [selectedCourt, selectedDate]);

    const generateTimeSlots = (openingTime: number, closingTime: number) => {
        const slots = [];
        const timeValues = [];

        const formatTime = (time: number) => {
            const hour = Math.floor(time / 100);
            const minute = time % 100;

            let formattedHour = hour % 12;
            if (formattedHour === 0) formattedHour = 12;

            const period = hour < 12 ? 'AM' : 'PM';

            return `${formattedHour}:${minute === 0 ? '00' : minute} ${period}`;
        };

        const startHour = Math.floor(openingTime / 100);
        const endHour = Math.floor(closingTime / 100);

        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(formatTime(hour * 100));
            timeValues.push(hour * 100);
        }

        return { formattedSlots: slots, timeValues };
    };

    const fetchBookings = async () => {
        if (!selectedCourt || !selectedDate) return;

        try {
            setBookingsLoading(true);
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const response = await bookingsApi.getByCourtAndDate(selectedCourt.courtId, formattedDate);
            setBookings(response.data || []);

            const available = [];

            if (response.data && response.data.length > 0) {
                response.data.forEach((slot, index) => {
                    if (!slot.isBooked) {
                        available.push(index);
                    }
                });
            }

            setAvailableTimeSlots(available);

            if (response.data && response.data.length > 0) {
                const formattedSlots = response.data.map(slot => {
                    const [hour] = slot.starts.split(':');
                    const hourNum = parseInt(hour);
                    const period = hourNum >= 12 ? 'PM' : 'AM';
                    const hour12 = hourNum % 12 || 12;
                    return `${hour12}:00 ${period}`;
                });
                setTimeSlots(formattedSlots);
            }
        } catch (err) {
            if (venue?.openingTime && venue?.closingTime) {
                const { formattedSlots, timeValues } = generateTimeSlots(venue.openingTime, venue.closingTime);
                setTimeSlots(formattedSlots);
                setAvailableTimeSlots(timeValues.map((_, index) => index));
            } else {
                const defaultSlots = [
                    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
                    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
                    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
                    '8:00 PM'
                ];
                setTimeSlots(defaultSlots);
                setAvailableTimeSlots(Array.from({ length: defaultSlots.length }, (_, i) => i));
            }
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchVenueData = async () => {
        try {
            setLoading(true);
            const venueId = parseInt(id as string, 10);

            const [allVenues, allCourts] = await Promise.all([
                getAllVenues(),
                getAllCourts()
            ]);

            const venueData = allVenues.find(v => v.venueId === venueId);
            if (!venueData) {
                throw new Error(`Venue with ID ${venueId} not found`);
            }

            const venueCourts = allCourts.filter(c => c.venueId === venueId);

            setVenue(venueData);
            setCourts(venueCourts);

            if (venueCourts.length > 0) {
                setSelectedCourt(venueCourts[0]);
            }

            if (venueData.openingTime && venueData.closingTime) {
                const { formattedSlots } = generateTimeSlots(venueData.openingTime, venueData.closingTime);
                setTimeSlots(formattedSlots);
            } else {
                setTimeSlots([
                    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
                    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
                    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
                    '8:00 PM'
                ]);
            }

            setError(null);
        } catch (err) {
            setError('Failed to load venue details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const bookCourt = async () => {
        if (!selectedCourt || selectedTimeSlot === null) {
            Alert.alert('Selection Required', 'Please select a court and time slot');
            return;
        }

        try {
            setBookingInProgress(true);
            const selectedBooking = bookings[selectedTimeSlot];

            if (!selectedBooking) {
                throw new Error('Selected time slot not found');
            }

            const bookingData = {
                userId: state.user?.id || 1,
                courtId: selectedCourt.courtId,
                startingTime: selectedBooking.starts,
                date: format(selectedDate, 'yyyy-MM-dd')
            };

            const response = await bookingsApi.createUserBooking(bookingData);

            Alert.alert(
                'Booking Successful',
                `You have successfully booked ${selectedCourt.name || `Court ${selectedCourt.courtId}`} at ${timeSlots[selectedTimeSlot]} on ${format(selectedDate, 'MMMM d, yyyy')}`,
                [
                    {
                        text: 'View My Bookings',
                        onPress: () => router.push('/(app)/profile/bookings'),
                    },
                    {
                        text: 'OK',
                        onPress: () => {
                            fetchBookings();
                        },
                    },
                ]
            );

            setSelectedTimeSlot(null);

        } catch (err) {
            Alert.alert(
                'Booking Failed',
                'There was an error processing your booking. Please try again later.'
            );
        } finally {
            setBookingInProgress(false);
        }
    };

    // Consistent frosted glass effect style
    const frostedGlassStyle = {
        colors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)'],
        className: "backdrop-blur-md rounded-2xl shadow-lg"
    };

    if (loading || !fontsLoaded) {
        return (
            <View className="flex-1">
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <SafeAreaView className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="white" />
                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 12 }} className="text-white">Loading venue details...</Text>
                </SafeAreaView>
            </View>
        );
    }

    if (error || !venue) {
        return (
            <View className="flex-1">
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <SafeAreaView className="flex-1 justify-center items-center p-6">
                    <Ionicons name="alert-circle-outline" size={80} color="white" />
                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 12, marginBottom: 24 }} className="text-white text-center text-lg">{error || 'Venue not found'}</Text>
                    <GradientButton
                        onPress={() => router.back()}
                        text="Go Back"
                    />
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <StatusBar style="light" />
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <LinearGradient
                colors={['#10b68d', '#0a8d6d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="pt-8 px-6 pb-5">
                        <View className="flex-row items-center mb-2">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4"
                            >
                                <Ionicons name="chevron-back" size={24} color="white" />
                            </TouchableOpacity>
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 24, lineHeight: 32 }} className="text-white">
                                    {venue.venueName || `Venue ${venue.venueId}`}
                                </Text>
                                {venue.location && (
                                    <Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 20 }} className="text-white text-base opacity-80">
                                        {venue.location}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }}
                    >
                        {/* Venue Header Image */}
                        <View className="mx-6 rounded-xl overflow-hidden shadow-lg h-56 mb-6">
                            {venue.venueImageUrl ? (
                                <Image
                                    source={{ uri: venue.venueImageUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={['rgba(16,182,141,0.5)', 'rgba(4,109,100,0.3)']}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            )}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' }}
                            />
                            <View className="absolute bottom-4 left-4 right-4">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="star" size={18} color="#FFD700" />
                                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white ml-1 text-base">
                                        {venue.rating ? venue.rating.toFixed(1) : "New"}
                                    </Text>
                                    {venue.totalRating > 0 && (
                                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/80 ml-1">
                                            ({venue.totalRating} reviews)
                                        </Text>
                                    )}
                                </View>
                                {venue.openingTime && venue.closingTime && (
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={16} color="white" />
                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white/90 ml-1">
                                            {Math.floor(venue.openingTime/100)}:
                                            {venue.openingTime % 100 === 0 ? '00' : venue.openingTime % 100} -
                                            {Math.floor(venue.closingTime/100)}:
                                            {venue.closingTime % 100 === 0 ? '00' : venue.closingTime % 100}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Court Selection */}
                        <View className="mx-6 overflow-hidden rounded-2xl shadow-lg mb-6">
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="p-5 backdrop-blur-md"
                            >
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 text-center mb-5">Select a Court</Text>

                                {courts.length === 0 ? (
                                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-center py-4">No courts available</Text>
                                ) : (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                                        {courts.map((court) => (
                                            <TouchableOpacity
                                                key={court.courtId}
                                                className={`mr-4 items-center ${selectedCourt?.courtId === court.courtId ? 'opacity-100' : 'opacity-80'}`}
                                                onPress={() => setSelectedCourt(court)}
                                                activeOpacity={0.7}
                                            >
                                                <View
                                                    className={`w-28 h-28 rounded-xl items-center justify-center mb-2 
                                                        ${selectedCourt?.courtId === court.courtId ?
                                                        'border-2 border-[#10b68d] bg-[rgba(16,182,141,0.1)]' :
                                                        'border border-gray-200 bg-white/50'}`}
                                                >
                                                    <Ionicons
                                                        name={getSportIcon(court.name || '')}
                                                        size={40}
                                                        color={selectedCourt?.courtId === court.courtId ? '#10b68d' : getSportColor(court.name || '')}
                                                    />
                                                </View>
                                                <Text
                                                    style={{ fontFamily: selectedCourt?.courtId === court.courtId ? 'Poppins-Bold' : 'Poppins-Medium' }}
                                                    className={`${selectedCourt?.courtId === court.courtId ? 'text-[#10b68d]' : 'text-gray-700'}`}
                                                >
                                                    {court.name || `Court ${court.courtId}`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </LinearGradient>
                        </View>

                        {/* Date Selection */}
                        <View className="mx-6 overflow-hidden rounded-2xl shadow-lg mb-6">
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="p-5 backdrop-blur-md"
                            >
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 text-center mb-5">Select a Date</Text>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                                    {nextSevenDays.map((day, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            className="mx-2"
                                            onPress={() => setSelectedDate(day)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                className={`w-16 h-20 items-center justify-center rounded-xl
                                                    ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                                    'bg-[#10b68d]' : 'bg-white/50 border border-gray-200'}`}
                                            >
                                                <Text
                                                    style={{ fontFamily: 'Poppins-Medium' }}
                                                    className={`${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                                        'text-white' : 'text-gray-500'}`}
                                                >
                                                    {format(day, 'EEE')}
                                                </Text>
                                                <Text
                                                    style={{ fontFamily: 'Poppins-Bold' }}
                                                    className={`text-xl ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                                        'text-white' : 'text-gray-800'}`}
                                                >
                                                    {format(day, 'd')}
                                                </Text>
                                                <Text
                                                    style={{ fontFamily: 'Poppins-Regular' }}
                                                    className={`text-xs ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                                        'text-white' : 'text-gray-500'}`}
                                                >
                                                    {format(day, 'MMM')}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </LinearGradient>
                        </View>

                        {/* Time Slots */}
                        {selectedCourt && (
                            <View className="mx-6 overflow-hidden rounded-2xl shadow-lg mb-6">
                                <LinearGradient
                                    colors={frostedGlassStyle.colors}
                                    className="p-5 backdrop-blur-md"
                                >
                                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 text-center mb-2">
                                        Available Time Slots
                                    </Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600 text-center mb-5">
                                        {format(selectedDate, 'MMMM d, yyyy')}
                                    </Text>

                                    {bookingsLoading ? (
                                        <View className="items-center justify-center py-6">
                                            <ActivityIndicator size="small" color="#10b68d" />
                                            <Text style={{ fontFamily: 'Poppins-Regular', marginTop: 8 }} className="text-gray-500">Loading available times...</Text>
                                        </View>
                                    ) : (
                                        <View className="flex-row flex-wrap justify-between">
                                            {timeSlots.map((time, index) => {
                                                const isAvailable = bookings.length > 0
                                                    ? !bookings[index]?.isBooked
                                                    : availableTimeSlots.includes(index);

                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        disabled={!isAvailable}
                                                        className={`mb-3 ${
                                                            selectedTimeSlot === index ? 'opacity-100' : isAvailable ? 'opacity-90' : 'opacity-50'
                                                        }`}
                                                        style={{ width: '48%' }}
                                                        onPress={() => setSelectedTimeSlot(index)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <LinearGradient
                                                            colors={
                                                                selectedTimeSlot === index
                                                                    ? ['#10b68d', '#0a8d6d', '#046d64']
                                                                    : isAvailable
                                                                        ? ['rgba(255,255,255,0.9)', 'rgba(240,240,240,0.7)']
                                                                        : ['rgba(220,220,220,0.7)', 'rgba(200,200,200,0.5)']
                                                            }
                                                            className="py-3 px-4 rounded-xl items-center justify-center"
                                                        >
                                                            <Text
                                                                style={{ fontFamily: selectedTimeSlot === index ? 'Poppins-Bold' : 'Poppins-Medium' }}
                                                                className={`${
                                                                    selectedTimeSlot === index
                                                                        ? 'text-white'
                                                                        : isAvailable
                                                                            ? 'text-gray-800'
                                                                            : 'text-gray-400'
                                                                }`}
                                                            >
                                                                {time}
                                                            </Text>
                                                        </LinearGradient>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}

                                    <View className="mt-6">
                                        <GradientButton
                                            onPress={bookCourt}
                                            text="Book Now"
                                            disabled={selectedTimeSlot === null}
                                            loading={bookingInProgress}
                                        />
                                    </View>
                                </LinearGradient>
                            </View>
                        )}

                        {/* Reviews Section */}
                        {venue.totalRating > 0 && (
                            <View className="mx-6 overflow-hidden rounded-2xl shadow-lg mb-6">
                                <LinearGradient
                                    colors={frostedGlassStyle.colors}
                                    className="p-5 backdrop-blur-md"
                                >
                                    <View className="flex-row justify-between items-center mb-5">
                                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800">Reviews</Text>
                                        <TouchableOpacity>
                                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d]">See All</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className="bg-[rgba(16,182,141,0.05)] rounded-xl p-4 border border-[rgba(16,182,141,0.2)] items-center">
                                        <Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }} className="text-gray-700 text-center mb-4">
                                            This venue has {venue.totalRating} reviews with an average rating of {venue.rating.toFixed(1)}.
                                        </Text>
                                        <GradientButton
                                            text="Write a Review"
                                            small={true}
                                            onPress={() => {}}
                                        />
                                    </View>
                                </LinearGradient>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}