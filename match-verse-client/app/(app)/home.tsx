import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllVenues, Venue } from '@/services/venue';

export default function Home() {
    const { state } = useAuth();
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
        router.push(`/(app)/venues/${venueId}`);
    };

    const joinMatch = () => {
        console.log('Joining match...');
    };

    const findMatch = () => {
        router.push('/(app)/find');
    };

    const selectSport = (sport) => {
        console.log('Selecting sport:', sport);
        setSelectedSport(sport);
    };

    const sportColors = {
        football: "#e11d48",
        badminton: "#15803d",
        basketball: "#f97316",
        tennis: "#facc15",
        other: "#6366f1"
    };

    const isAvailableSport = selectedSport === 'badminton';

    return (
        <SafeAreaView className="flex-1 bg-gray-50 relative">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="pt-14 px-6 pb-5 bg-[#22c55e]">
                    <Text className="text-white text-3xl font-bold">MatchVerse</Text>
                    <Text className="text-white text-base opacity-80">Your sports booking platform</Text>
                </View>

                <View className="flex-row justify-evenly py-4 mx-2 bg-white rounded-xl -mt-3 shadow-md">
                    <TouchableOpacity
                        className="items-center"
                        onPress={() => selectSport('badminton')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-12 h-12 rounded-full border border-[#22c55e] items-center justify-center ${selectedSport === 'badminton' ? 'bg-[rgba(34,197,94,0.1)]' : ''}`}>
                            <Ionicons name="ellipse-outline" size={32} color={sportColors.badminton} />
                        </View>
                        <View className={`h-1 w-5 rounded-full mt-1 ${selectedSport === 'badminton' ? 'bg-[#22c55e]' : 'bg-transparent'}`} />
                    </TouchableOpacity>

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

                {isAvailableSport ? (
                    <>
                        <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                            <Text className="text-gray-800 text-2xl font-bold text-center mb-2">Match Starting Soon...</Text>
                            <Text className="text-gray-600 text-lg text-center mb-5">
                                Badminton - Doubles 🏸
                            </Text>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-500 text-base">3/4 players found</Text>
                                <TouchableOpacity
                                    className="flex-row bg-[#22c55e] py-2 px-4 rounded-full items-center"
                                    onPress={joinMatch}
                                >
                                    <Text className="text-white font-bold mr-1">Join Now</Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md flex-row justify-between items-center">
                            <Text className="text-gray-800 text-2xl font-bold">Find a Match</Text>
                            <TouchableOpacity
                                className="flex-row bg-[#22c55e] py-2 px-4 rounded-full items-center"
                                onPress={findMatch}
                            >
                                <Text className="text-white font-bold mr-1">Find Now</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                            <Text className="text-gray-800 text-2xl font-bold text-center">Popular Venues</Text>
                            <Text className="text-gray-600 text-lg text-center mb-5">
                                Badminton 🏸
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
                            ) : venues.length > 0 ? (
                                <>
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
                                                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
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
                                                <Text className="text-gray-700 text-center">
                                                    Venue {venue.venueId}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {venues.length > 3 && (
                                        <View className="flex-row justify-between mb-4">
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
                                                                style={{ width: '100%', height: '100%', borderRadius: 8 }}
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
                                                    <Text className="text-gray-700 text-center">
                                                        Venue {venue.venueId}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View className="items-center justify-center py-8">
                                    <Text className="text-gray-500 text-center">No venues found</Text>
                                </View>
                            )}
                        </View>
                    </>
                ) : (
                    <View className="mx-6 my-10 p-8 rounded-xl border border-gray-200 bg-white shadow-md items-center">
                        <Ionicons name="hourglass-outline" size={80} color="#22c55e" />
                        <Text className="text-gray-800 text-3xl font-bold text-center mt-6 mb-2">Coming Soon!</Text>
                        <Text className="text-gray-600 text-lg text-center mb-4">
                            We're working hard to bring {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} to MatchVerse.
                        </Text>
                        <Text className="text-gray-500 text-base text-center">
                            In the meantime, try Badminton to find your perfect match.
                        </Text>
                        <TouchableOpacity
                            className="mt-6 bg-[#22c55e] py-3 px-6 rounded-full"
                            onPress={() => selectSport('badminton')}
                        >
                            <Text className="text-white font-bold">Try Badminton</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}