// app/(app)/venues.tsx
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllVenues, getSportIcon, getSportColor, Venue } from '@/services/venue';

export default function Venues() {
    const router = useRouter();
    const [selectedSport, setSelectedSport] = useState('badminton');
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const data = await getAllVenues();
            setVenues(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching venues:', err);
            setError('Failed to load venues. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToVenue = (venueId) => {
        // Navigate to venue details screen
        router.push(`/(app)/venues/${venueId}`);
    };

    const selectSport = (sport) => {
        console.log('Selecting sport:', sport);
        setSelectedSport(sport);
    };

    // Sport colors
    const sportColors = {
        football: "#e11d48",
        badminton: "#15803d",
        basketball: "#f97316",
        tennis: "#facc15",
        other: "#6366f1"
    };

    // Filter venues based on selected sport (in a real app, you'd filter based on venue properties)
    // Here we're just simulating it since we don't have that data from the backend yet
    const filteredVenues = venues;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 relative">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header */}
                <View className="pt-14 px-6 pb-5 bg-[#22c55e]">
                    <Text className="text-white text-3xl font-bold">Venues</Text>
                    <Text className="text-white text-base opacity-80">Find your perfect match location</Text>
                </View>

                {/* Sport Icons */}
                <View className="flex-row justify-evenly py-4 mx-2 bg-white rounded-xl -mt-3 shadow-md">
                    <TouchableOpacity
                        className="items-center"
                        onPress={() => selectSport('football')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-12 h-12 rounded-full border border-[#22c55e] items-center justify-center ${selectedSport === 'football' ? 'bg-[rgba(34,197,94,0.1)]' : ''}`}>
                            <Ionicons name="football" size={32} color={sportColors.football} />
                        </View>
                        <View className={`h-1 w-5 rounded-full mt-1 ${selectedSport === 'football' ? 'bg-[#22c55e]' : 'bg-transparent'}`} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="items-center"
                        onPress={() => selectSport('badminton')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-12 h-12 rounded-full border border-[#22c55e] items-center justify-center ${selectedSport === 'badminton' ? 'bg-[rgba(34,197,94,0.1)]' : ''}`}>
                            <Ionicons name="tennisball" size={32} color={sportColors.badminton} />
                        </View>
                        <View className={`h-1 w-5 rounded-full mt-1 ${selectedSport === 'badminton' ? 'bg-[#22c55e]' : 'bg-transparent'}`} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="items-center"
                        onPress={() => selectSport('basketball')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-12 h-12 rounded-full border border-[#22c55e] items-center justify-center ${selectedSport === 'basketball' ? 'bg-[rgba(34,197,94,0.1)]' : ''}`}>
                            <Ionicons name="basketball" size={32} color={sportColors.basketball} />
                        </View>
                        <View className={`h-1 w-5 rounded-full mt-1 ${selectedSport === 'basketball' ? 'bg-[#22c55e]' : 'bg-transparent'}`} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="items-center"
                        onPress={() => selectSport('tennis')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-12 h-12 rounded-full border border-[#22c55e] items-center justify-center ${selectedSport === 'tennis' ? 'bg-[rgba(34,197,94,0.1)]' : ''}`}>
                            <Ionicons name="tennisball" size={32} color={sportColors.tennis} />
                        </View>
                        <View className={`h-1 w-5 rounded-full mt-1 ${selectedSport === 'tennis' ? 'bg-[#22c55e]' : 'bg-transparent'}`} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="items-center"
                        onPress={() => selectSport('other')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-12 h-12 rounded-full border border-[#22c55e] items-center justify-center ${selectedSport === 'other' ? 'bg-[rgba(34,197,94,0.1)]' : ''}`}>
                            <Ionicons name="grid" size={32} color={sportColors.other} />
                        </View>
                        <View className={`h-1 w-5 rounded-full mt-1 ${selectedSport === 'other' ? 'bg-[#22c55e]' : 'bg-transparent'}`} />
                    </TouchableOpacity>
                </View>

                {/* Location Card */}
                <View className="mx-6 my-4">
                    <TouchableOpacity
                        className="flex-row items-center p-3 bg-white rounded-full border border-gray-200 shadow-sm"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location" size={24} color="#22c55e" />
                        <Text className="text-gray-800 ml-2 flex-1">Your Location - 2nd lane, Colombo, Sri Lanka</Text>
                    </TouchableOpacity>
                </View>

                {/* Venue Cards */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    <Text className="text-gray-800 text-2xl font-bold text-center mb-2">Available Venues</Text>
                    <Text className="text-gray-600 text-lg text-center mb-5">
                        {selectedSport === 'football' && 'Football Venues 🏈'}
                        {selectedSport === 'badminton' && 'Badminton Courts 🏸'}
                        {selectedSport === 'basketball' && 'Basketball Courts 🏀'}
                        {selectedSport === 'tennis' && 'Tennis Courts 🎾'}
                        {selectedSport === 'other' && 'Multi-Sports Facilities 🏆'}
                    </Text>

                    {loading ? (
                        <View className="items-center justify-center py-8">
                            <ActivityIndicator size="large" color="#22c55e" />
                        </View>
                    ) : error ? (
                        <View className="items-center justify-center py-8">
                            <Text className="text-red-500 text-center">{error}</Text>
                            <TouchableOpacity
                                className="mt-4 bg-[#22c55e] px-4 py-2 rounded-lg"
                                onPress={fetchVenues}
                            >
                                <Text className="text-white font-bold">Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredVenues.length === 0 ? (
                        <View className="items-center justify-center py-8">
                            <Text className="text-gray-500 text-center">No venues found</Text>
                        </View>
                    ) : (
                        // List of venues
                        filteredVenues.map((venue) => (
                            <TouchableOpacity
                                key={venue.venueId}
                                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4"
                                onPress={() => navigateToVenue(venue.venueId)}
                                activeOpacity={0.8}
                            >
                                <View className="h-40 relative">
                                    <View className="absolute top-0 left-0 w-full h-full bg-gray-200 opacity-20"></View>
                                    <View className="p-5">
                                        <Text className="text-gray-800 text-xl font-bold mb-1">{venue.name}</Text>
                                        <Text className="text-[#22c55e] mb-2">
                                            {venue.address.split(',')[0]} {/* Display first part of address */}
                                        </Text>

                                        <View className="flex-row mt-auto items-center justify-between">
                                            <View className="flex-row items-center bg-white px-2 py-1 rounded-lg">
                                                <Ionicons name="star" size={16} color="#22c55e" />
                                                <Text className="text-gray-800 ml-1 font-bold">
                                                    {venue.rating ? venue.rating.toFixed(1) : "New"}
                                                </Text>
                                            </View>

                                            <View className="bg-[#22c55e] px-4 py-2 rounded-lg flex-row items-center">
                                                <Text className="text-white font-bold mr-1">View Now</Text>
                                                <Ionicons name="arrow-forward" size={16} color="white" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Popular Venues Section - Keep this as a showcase for now */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    <Text className="text-gray-800 text-2xl font-bold text-center">Popular Venues</Text>
                    <Text className="text-gray-600 text-lg text-center mb-5">
                        {selectedSport === 'football' && 'Football 🏈'}
                        {selectedSport === 'badminton' && 'Badminton 🏸'}
                        {selectedSport === 'basketball' && 'Basketball 🏀'}
                        {selectedSport === 'tennis' && 'Tennis 🎾'}
                        {selectedSport === 'other' && 'All Sports 🏆'}
                    </Text>

                    {loading ? (
                        <View className="items-center justify-center py-8">
                            <ActivityIndicator size="large" color="#22c55e" />
                        </View>
                    ) : venues.length > 0 ? (
                        <>
                            {/* Venues Grid - First Row */}
                            <View className="flex-row justify-between mb-4">
                                {venues.slice(0, 3).map((venue) => (
                                    <TouchableOpacity
                                        key={venue.venueId}
                                        className="w-[30%]"
                                        onPress={() => navigateToVenue(venue.venueId)}
                                    >
                                        <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-md">
                                            {venue.venueImageUrl && (
                                                <Image
                                                    source={{ uri: venue.venueImageUrl }}
                                                    className="w-full h-full rounded-lg"
                                                    resizeMode="cover"
                                                />
                                            )}
                                            <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                                <Ionicons name="star" size={12} color="white" />
                                                <Text className="text-white text-xs ml-0.5">
                                                    {venue.rating ? venue.rating.toFixed(1) : "New"}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-700 text-center">{venue.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Venues Grid - Second Row (if enough venues) */}
                            {venues.length > 3 && (
                                <View className="flex-row justify-between">
                                    {venues.slice(3, 6).map((venue) => (
                                        <TouchableOpacity
                                            key={venue.venueId}
                                            className="w-[30%]"
                                            onPress={() => navigateToVenue(venue.venueId)}
                                        >
                                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-sm">
                                                {venue.venueImageUrl && (
                                                    <Image
                                                        source={{ uri: venue.venueImageUrl }}
                                                        className="w-full h-full rounded-lg"
                                                        resizeMode="cover"
                                                    />
                                                )}
                                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                                    <Ionicons name="star" size={12} color="white" />
                                                    <Text className="text-white text-xs ml-0.5">
                                                        {venue.rating ? venue.rating.toFixed(1) : "New"}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-gray-700 text-center">{venue.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View className="items-center justify-center py-8">
                            <Text className="text-gray-500 text-center">No popular venues found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}