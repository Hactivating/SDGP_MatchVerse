import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { getAllVenues, getAllCourts, Venue, Court, getSportIcon, getSportColor } from '@/services/venue';
import { format, addDays } from 'date-fns';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { initPaymentSheet, usePaymentSheet, StripeProvider, presentPaymentSheet } from '@stripe/stripe-react-native';

//change 2
const App = () => {
    const [ready, setReady] = useState(false);
    const { initPaymentSheet, presentPaymentSheet, loading } = usePaymentSheet();

    useEffect(() => {
        initialisePaymentSheet();
    }, []);
}

const initialisePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customer } =
        await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Test Venue',
        allowsDelayedPaymentMethods: true,
        returnURL: 'stripe-example://stripe-redirect',

    });

    if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
        setReady(true);
    }
};

const fetchPaymentSheetParams = async () => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const { paymentIntent, ephemeralKey, customer } = await response.json

    return {
        paymentIntent,
        ephemeralKey,
        customer,
    };
};

async function buy() {
    const { error } = await presentPaymentSheet();

    if (error) {
        Alert.alert(`Error code : ${error.code}`, error.message);

    } else {
        Alert.alert('Success', 'The payment was confirmed successfully');
        setReady(false);
    }
}


//----------------------------------------------------------------------------
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



    const initializePaymentSheet = async (amount: number, courtId: number) => {
        try {
            const paymentData = {
                amount: amount,
                courtId: courtId,
                date: format(selectedDate, 'yyyy-MM-dd'),
                timeSlot: selectedTimeSlot
            };

            const response = await api.post('payment/create-payment-intent', paymentData);


            if (!response.data.clientSecret) {
                throw new Error('Failed to create payment intent')
            }

            const { error } = await initPaymentSheet({
                merchantDisplayName: 'Sports Court Booking',
                paymentIntentClientSecret: response.data.clientSecret,
            });

            if (error) {
                throw new Error(error.message);

            }

            return true;
        } catch (err) {
            console.error('Payment initialization error : ', err);
            return false;

        }

    };

    const handlePayment = async () => {
        try {
            const { error } = await presentPaymentSheet();

            if (error) {
                throw new Error(error.message);
            }

            return true;
        } catch (err) {
            console.error('Payment error', err);
            return false;
        }
    };



    const initializePaymentSheet = async (amount: number, courtId: number) => {
        try {
            const paymentData = {
                amount: amount,
                courtId: courtId,
                date: format(selectedDate, 'yyyy-MM-dd'),
                timeSlot: selectedTimeSlot
            };

            const response = await api.post('payment/create-payment-intent', paymentData);


            if (!response.data.clientSecret) {
                throw new Error('Failed to create payment intent')
            }

            const { error } = await initPaymentSheet({
                merchantDisplayName: 'Sports Court Booking',
                paymentIntentClientSecret: response.data.clientSecret,
            });

            if (error) {
                throw new Error(error.message);

            }

            return true;
        } catch (err) {
            console.error('Payment initialization error : ', err);
            return false;

        }

    };

    const handlePayment = async () => {
        try {
            const { error } = await presentPaymentSheet();

            if (error) {
                throw new Error(error.message);
            }

            return true;
        } catch (err) {
            console.error('Payment error', err);
            return false;
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

            const isPaymentinitialized = await initializePaymentSheet(
                selectedCourt.pricePerBooking ?? 0,
                selectedCourt.courtId
            );

            if (!isPaymentinitialized) {
                throw new Error('Failed to initialize payment')
            }

            const isPaymentSuccessful = await handlePayment();

            if (!isPaymentSuccessful) {
                throw new Error('Payment failed');
            }

            if (isPaymentSuccessful) {
                const bookingData = {
                    userId: state.user?.id || 1,
                    courtId: selectedCourt.courtId,
                    startingTime: selectedBooking.starts,
                    date: format(selectedDate, 'yyyy-MM-dd')
                };
                const isPaymentinitialized = await initializePaymentSheet(
                    selectedCourt.pricePerBooking ?? 0,
                    selectedCourt.courtId
                );

                if (!isPaymentinitialized) {
                    throw new Error('Failed to initialize payment')
                }

                const isPaymentSuccessful = await handlePayment();

                if (!isPaymentSuccessful) {
                    throw new Error('Payment failed');
                }

                if (isPaymentSuccessful) {
                    const bookingData = {
                        userId: state.user?.id || 1,
                        courtId: selectedCourt.courtId,
                        startingTime: selectedBooking.starts,
                        date: format(selectedDate, 'yyyy-MM-dd')
                    };

                    const bookingResponse = await bookingsApi.createUserBooking(bookingData);

                    await api.patch(`/bookings/${bookingResponse.data.bookingId}/payment-status`, {
                        isPaid: true
                    });

                }
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


        if (loading) {
            return (
                <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text className="text-gray-600 mt-4">Loading venue details...</Text>
                </SafeAreaView>
            );
        }

        if (error || !venue) {
            return (
                <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-6">
                    <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
                    <Text className="text-red-500 text-lg text-center mt-4 mb-6">{error || 'Venue not found'}</Text>
                    <TouchableOpacity
                        className="bg-[#22c55e] px-6 py-3 rounded-lg"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView className="flex-1 bg-gray-50 relative">
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="w-full h-72 relative">
                        <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#22c55e]">
                            {venue.venueImageUrl && (
                                <Image
                                    source={{ uri: venue.venueImageUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            )}
                        </View>

                        <View className="absolute top-0 left-0 right-0 h-40 bg-black opacity-30" />

                        <View className="pt-14 px-6 pb-5">
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    className="mr-2"
                                >
                                    <Ionicons name="chevron-back" size={28} color="white" />
                                </TouchableOpacity>
                                <Text className="text-white text-3xl font-bold">Venue {venue.venueId}</Text>
                            </View>
                            {venue.location && (
                                <Text className="text-white text-base opacity-80 ml-10">{venue.location}</Text>
                            )}
                        </View>
                    </View>

                    {venue.location && (
                        <View className="mx-6 my-4">
                            <TouchableOpacity
                                className="flex-row items-center p-3 bg-white rounded-full border border-gray-200 shadow-sm"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="location" size={24} color="#22c55e" />
                                <Text className="text-gray-800 ml-2 flex-1">{venue.location}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="mx-6 mb-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="star" size={22} color="#22c55e" />
                            <Text className="text-gray-800 ml-2 text-base font-bold">
                                {venue.rating ? venue.rating.toFixed(1) : "No ratings yet"}
                            </Text>
                            {venue.totalRating > 0 && (
                                <Text className="text-gray-500 ml-1 text-base">
                                    ({venue.totalRating} reviews)
                                </Text>
                            )}
                        </View>

                        {venue.openingTime && venue.closingTime && (
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={22} color="#22c55e" />
                                <Text className="text-gray-800 ml-2 text-base">
                                    Open: {Math.floor(venue.openingTime / 100)}:
                                    {venue.openingTime % 100 === 0 ? '00' : venue.openingTime % 100} -
                                    {Math.floor(venue.closingTime / 100)}:
                                    {venue.closingTime % 100 === 0 ? '00' : venue.closingTime % 100}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                        <Text className="text-gray-800 text-2xl font-bold text-center mb-6">Select a Court</Text>

                        {courts.length === 0 ? (
                            <Text className="text-gray-500 text-center py-4">No courts available</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                                {courts.map((court) => (
                                    <TouchableOpacity
                                        key={court.courtId}
                                        className={`mr-4 items-center ${selectedCourt?.courtId === court.courtId ? 'opacity-100' : 'opacity-70'}`}
                                        onPress={() => setSelectedCourt(court)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className={`w-28 h-28 rounded-lg items-center justify-center mb-2 
                                            ${selectedCourt?.courtId === court.courtId ?
                                                    'border-2 border-[#22c55e] bg-[rgba(34,197,94,0.1)]' :
                                                    'border border-gray-200 bg-gray-50'}`}
                                        >
                                            <Ionicons
                                                name={getSportIcon(court.name || '')}
                                                size={40}
                                                color={getSportColor(court.name || '')}
                                            />
                                        </View>
                                        <Text
                                            className={`text-center ${selectedCourt?.courtId === court.courtId ?
                                                'text-[#22c55e] font-bold' : 'text-gray-700'}`}
                                        >
                                            {court.name || `Court ${court.courtId}`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                        <Text className="text-gray-800 text-2xl font-bold text-center mb-6">Select a Date</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                            {nextSevenDays.map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`mx-2 w-16 h-20 items-center justify-center rounded-lg
                                    ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                            'bg-[#22c55e]' : 'bg-gray-50 border border-gray-200'}`}
                                    onPress={() => setSelectedDate(day)}
                                >
                                    <Text
                                        className={`font-medium ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                            'text-white' : 'text-gray-500'}`}
                                    >
                                        {format(day, 'EEE')}
                                    </Text>
                                    <Text
                                        className={`text-xl font-bold ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                            'text-white' : 'text-gray-800'}`}
                                    >
                                        {format(day, 'd')}
                                    </Text>
                                    <Text
                                        className={`text-xs ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ?
                                            'text-white' : 'text-gray-500'}`}
                                    >
                                        {format(day, 'MMM')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {selectedCourt && (
                        <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                            <Text className="text-gray-800 text-2xl font-bold text-center mb-2">
                                Available Time Slots
                            </Text>
                            <Text className="text-gray-600 text-center mb-6">
                                {format(selectedDate, 'MMMM d, yyyy')}
                            </Text>

                            {bookingsLoading ? (
                                <View className="items-center justify-center py-4">
                                    <ActivityIndicator size="small" color="#22c55e" />
                                    <Text className="text-gray-500 mt-2">Loading available times...</Text>
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
                                                className={`px-4 py-3 rounded-lg mb-3 ${selectedTimeSlot === index ? 'bg-[#22c55e]' :
                                                    isAvailable ?
                                                        'bg-gray-50 border border-gray-200' :
                                                        'bg-gray-100 border border-gray-200 opacity-50'
                                                    }`}
                                                style={{ width: '48%' }}
                                                onPress={() => setSelectedTimeSlot(index)}
                                            >
                                                <Text
                                                    className={`text-center ${selectedTimeSlot === index ? 'text-white font-bold' :
                                                        isAvailable ?
                                                            'text-gray-800' : 'text-gray-400'
                                                        }`}
                                                >
                                                    {time}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            <TouchableOpacity
                                className={`mt-6 py-3 px-6 rounded-lg items-center ${selectedTimeSlot !== null && !bookingInProgress ? 'bg-[#22c55e]' : 'bg-gray-300'
                                    }`}
                                disabled={selectedTimeSlot === null || bookingInProgress}
                                onPress={bookCourt}
                            >
                                {bookingInProgress ? (
                                    <View className="flex-row items-center">
                                        <ActivityIndicator size="small" color="white" />
                                        <Text className="text-white font-bold ml-2">Processing...</Text>
                                    </View>
                                ) : (
                                    <Text className="text-white font-bold">Book Now</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {venue.totalRating > 0 && (
                        <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md mb-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-gray-800 text-2xl font-bold">Reviews</Text>
                                <TouchableOpacity>
                                    <Text className="text-[#22c55e]">See All</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 items-center">
                                <Text className="text-gray-500 text-center">
                                    This venue has {venue.totalRating} reviews with an average rating of {venue.rating.toFixed(1)}.
                                </Text>
                                <TouchableOpacity
                                    className="mt-4 bg-[#22c55e] px-6 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-bold">Write a Review</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }
}