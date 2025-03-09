// app/(app)/venues/[id].tsx
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { getVenueById, getCourtsByVenueId, Venue, Court, getSportIcon, getSportColor } from '@/services/venue';

export default function VenueDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(0);
    const [selectedDate, setSelectedDate] = useState<string>('today');

    // Time slots for booking
    const timeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM', '7:30 PM'];

    // Date options for booking
    const dateOptions = [
        { id: 'today', label: 'Today' },
        { id: 'tomorrow', label: 'Tomorrow' },
        { id: 'saturday', label: 'Saturday' }
    ];

    useEffect(() => {
        fetchVenueData();
    }, [id]);

    const fetchVenueData = async () => {
        try {
            setLoading(true);
            // Parse the ID to ensure it's a number
            const venueId = parseInt(id as string, 10);

            // Fetch venue details
            const venueData = await getVenueById(venueId);
            setVenue(venueData);

            // Fetch courts for this venue
            const courtsData = await getCourtsByVenueId(venueId);
            setCourts(courtsData);

            setError(null);
        } catch (err) {
            console.error(`Error fetching venue data for ID ${id}:`, err);
            setError('Failed to load venue details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to group courts by sport type
    const getUniqueSportTypes = () => {
        if (!courts || courts.length === 0) return [];

        const uniqueSportTypes = [...new Set(courts.map(court => court.sportType))];
        return uniqueSportTypes.map(type => ({
            id: type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            icon: getSportIcon(type)
        }));
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

    const sportTypes = getUniqueSportTypes();

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
                {/* Header with Back Button */}
                {/* Venue Image with Header Overlay */}
                <View className="w-full h-72 relative">
                    {/* Background Image */}
                    <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray-300">
                        {venue.venueImageUrl ? (
                            <Image
                                source={{ uri: venue.venueImageUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            // Placeholder color if no image
                            <View className="w-full h-full bg-[#22c55e]" />
                        )}
                    </View>

                    {/* Gradient overlay for better text readability */}
                    <View className="absolute top-0 left-0 right-0 h-40 bg-black opacity-30" />

                    {/* Header */}
                    <View className="pt-14 px-6 pb-5">
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mr-2"
                            >
                                <Ionicons name="chevron-back" size={28} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-3xl font-bold">{venue.name}</Text>
                        </View>
                        <Text className="text-white text-base opacity-80 ml-10">Sports & Fitness Center</Text>
                    </View>
                </View>

                {/* Venue Info */}
                {/* Location Card */}
                <View className="mx-6 my-4">
                    <TouchableOpacity
                        className="flex-row items-center p-3 bg-white rounded-full border border-gray-200 shadow-sm"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location" size={24} color="#22c55e" />
                        <Text className="text-gray-800 ml-2 flex-1">{venue.address}</Text>
                    </TouchableOpacity>
                </View>

                {/* Venue Info Card */}
                <View className="mx-6 mb-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    {/* Rating */}
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="star" size={22} color="#22c55e" />
                        <Text className="text-gray-800 ml-2 text-base font-bold">
                            {venue.rating ? venue.rating.toFixed(1) : "New"}
                        </Text>
                        <Text className="text-gray-500 ml-1 text-base">
                            ({venue.totalRating || 0} reviews)
                        </Text>
                    </View>

                    {/* Phone */}
                    <View className="flex-row items-center">
                        <Ionicons name="call-outline" size={22} color="#22c55e" />
                        <Text className="text-gray-800 ml-2 text-base">{venue.contactNumber}</Text>
                    </View>
                </View>

                {/* Call and Book Buttons */}
                <View className="mx-6 mb-4 flex-row justify-between">
                    <TouchableOpacity
                        className="bg-[#22c55e] px-8 py-3 rounded-lg flex-row items-center justify-center flex-1 mr-3"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="call-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold">Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-[#22c55e] px-8 py-3 rounded-lg flex-row items-center justify-center flex-1"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold mr-2">Book Now</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Available Courts Section */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    <Text className="text-gray-800 text-2xl font-bold text-center mb-6">Available Courts</Text>

                    {sportTypes.length === 0 ? (
                        <Text className="text-gray-500 text-center py-4">No courts available</Text>
                    ) : (
                        <View className="flex-row justify-evenly flex-wrap">
                            {sportTypes.map((sport) => (
                                <TouchableOpacity
                                    key={sport.id}
                                    className="items-center mb-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-24 h-24 rounded-lg border border-[#22c55e] items-center justify-center mb-2 bg-gray-50">
                                        <Ionicons
                                            name={sport.icon}
                                            size={32}
                                            color={getSportColor(sport.id)}
                                        />
                                    </View>
                                    <Text className="text-gray-700 text-center">{sport.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Court Availability Section */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    <Text className="text-gray-800 text-2xl font-bold text-center mb-6">Court Availability</Text>

                    {/* Date Selection */}
                    <View className="flex-row justify-between mb-4">
                        {dateOptions.map(date => (
                            <TouchableOpacity
                                key={date.id}
                                className={`${selectedDate === date.id ? 'bg-[#22c55e]' : 'bg-gray-50 border border-gray-200'} px-4 py-2 rounded-lg`}
                                onPress={() => setSelectedDate(date.id)}
                            >
                                <Text className={`${selectedDate === date.id ? 'text-white font-bold' : 'text-gray-800'}`}>
                                    {date.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Time Slots */}
                    <View className="mt-4">
                        <Text className="text-gray-800 text-lg mb-4">Available Time Slots:</Text>

                        <View className="flex-row flex-wrap justify-between">
                            {timeSlots.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`px-4 py-2 rounded-lg mb-3 ${selectedTimeSlot === index ? 'bg-[#22c55e]' : 'bg-gray-50 border border-gray-200'}`}
                                    style={{ width: '48%' }}
                                    onPress={() => setSelectedTimeSlot(index)}
                                >
                                    <Text
                                        className={`${selectedTimeSlot === index ? 'text-white font-bold' : 'text-gray-800'} text-center`}
                                    >
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Reviews Section */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md mb-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-gray-800 text-2xl font-bold">Reviews</Text>
                        <TouchableOpacity>
                            <Text className="text-[#22c55e]">See All</Text>
                        </TouchableOpacity>
                    </View>

                    {venue.totalRating > 0 ? (
                        <>
                            {/* Review Card */}
                            <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                                    <View>
                                        <Text className="text-gray-800 font-bold">User Review</Text>
                                        <View className="flex-row">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Ionicons
                                                    key={star}
                                                    name="star"
                                                    size={14}
                                                    color={star <= Math.round(venue.rating) ? "#22c55e" : "#d1d5db"}
                                                />
                                            ))}
                                            <Text className="text-gray-500 ml-2 text-xs">Recent</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-gray-700">
                                    Great facilities and friendly staff. Courts are well maintained and the pricing is reasonable.
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 items-center">
                            <Text className="text-gray-500 text-center">
                                No reviews yet. Be the first to rate this venue!
                            </Text>
                            <TouchableOpacity
                                className="mt-4 bg-[#22c55e] px-6 py-2 rounded-lg"
                            >
                                <Text className="text-white font-bold">Write a Review</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}