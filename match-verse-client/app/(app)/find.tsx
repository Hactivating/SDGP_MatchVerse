// app/(app)/find.tsx
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { getBookings, createMatchRequest } from '@/services/match';

// Match type definition
type Booking = {
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
};

export default function FindScreen() {
    const { state } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDoubles, setIsDoubles] = useState(false);
    const [partnerId, setPartnerId] = useState('');
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());

    // Get current date in the format YYYY-MM-DDzx
    function getCurrentDate() {
        const date = new Date();
        return date.toISOString().split('T')[0];
    }

    // Format time from 24hr to 12hr format
    function formatTime(time: string) {
        const hour = parseInt(time);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:00 ${suffix}`;
    }

    // Fetch available bookings
    useEffect(() => {
        const fetchBookings = async () => {
            if (!state.user?.userId) return;

            try {
                setLoading(true);
                const data = await getBookings(selectedDate);
                setBookings(data.filter(booking => !booking.userId)); // Only show available slots
                setError(null);
            } catch (err) {
                setError('Failed to load available bookings');
                console.error('Error fetching bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [state.user?.userId, selectedDate]);

    // Handle date selection
    const handleDateChange = (offset: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + offset);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    // Handle match request creation
    const handleCreateMatchRequest = async (bookingId: number) => {
        if (!state.user?.userId) {
            Alert.alert('Error', 'You must be logged in to create a match request');
            return;
        }

        try {
            const payload = {
                bookingId,
                matchType: isDoubles ? 'double' : 'single',
                createdById: state.user.userId,
                partnerId: isDoubles ? Number(partnerId) : undefined
            };

            await createMatchRequest(payload);
            Alert.alert('Success', 'Match request created successfully');

            // Refresh bookings after creating a match request
            const data = await getBookings(selectedDate);
            setBookings(data.filter(booking => !booking.userId));
        } catch (err) {
            Alert.alert('Error', 'Failed to create match request');
            console.error('Error creating match request:', err);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#121212]">
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-[#121212]">
                <View className="flex-1 justify-center items-center p-6">
                    <Text className="text-red-500 text-center mb-6">{error}</Text>
                    <TouchableOpacity
                        className="bg-[#22c55e] py-3 px-6 rounded-lg"
                        onPress={() => setLoading(true)}
                    >
                        <Text className="text-white font-medium">Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="pt-14 px-6 pb-5 bg-[#22c55e]">
                    <Text className="text-white text-3xl font-bold">Find a Match</Text>
                    <Text className="text-white text-base opacity-80">
                        Book a court and find opponents
                    </Text>
                </View>

                {/* Date Selector */}
                <View className="bg-white m-6 p-4 rounded-xl shadow-sm flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => handleDateChange(-1)}>
                        <Text className="text-[#22c55e] font-bold text-lg">←</Text>
                    </TouchableOpacity>

                    <Text className="text-lg font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>

                    <TouchableOpacity onPress={() => handleDateChange(1)}>
                        <Text className="text-[#22c55e] font-bold text-lg">→</Text>
                    </TouchableOpacity>
                </View>

                {/* Match Type Selector */}
                <View className="bg-white mx-6 p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-800 font-bold mb-3">Match Type</Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="font-medium">{isDoubles ? "Doubles" : "Singles"}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#22c55e" }}
                            thumbColor="#f4f3f4"
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setIsDoubles}
                            value={isDoubles}
                        />
                    </View>
                    {isDoubles && (
                        <View className="mt-3">
                            <Text className="text-gray-700 mb-1">Partner ID</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-2"
                                value={partnerId}
                                onChangeText={setPartnerId}
                                placeholder="Enter your partner's user ID"
                                keyboardType="numeric"
                            />
                        </View>
                    )}
                </View>

                {/* Available Bookings */}
                <View className="mx-6 mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Available Courts</Text>

                    {bookings.length === 0 ? (
                        <View className="bg-white p-6 rounded-xl shadow-sm items-center">
                            <Text className="text-gray-500 text-center">No available courts for this date</Text>
                        </View>
                    ) : (
                        bookings.map((booking) => (
                            <View key={booking.bookingId} className="bg-white p-4 rounded-xl shadow-sm mb-3">
                                <View className="mb-3">
                                    <Text className="text-xl font-bold text-gray-800">{booking.court.venue.venueName}</Text>
                                    <Text className="text-gray-600">{booking.court.name}</Text>
                                    <Text className="text-gray-500">{booking.court.venue.location}</Text>
                                </View>

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-[#22c55e] font-bold">{formatTime(booking.startingTime)}</Text>
                                    <TouchableOpacity
                                        className="bg-[#22c55e] py-2 px-4 rounded-lg"
                                        onPress={() => handleCreateMatchRequest(booking.bookingId)}
                                    >
                                        <Text className="text-white font-medium">Request Match</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}