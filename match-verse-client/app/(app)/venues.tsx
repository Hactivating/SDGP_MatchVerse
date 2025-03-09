// app/(app)/venues.tsx
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';

export default function Venues() {
    const router = useRouter();
    const [selectedSport, setSelectedSport] = useState('badminton');

    const navigateToVenue = (venueId) => {
        // Navigate to venue details screen
        router.push(`/(app)/venues/${venueId}`);
    };

    const selectSport = (sport) => {
        console.log('Selecting sport:', sport);
        setSelectedSport(sport);
    };

    // Sport colors - matching home page
    const sportColors = {
        football: "#e11d48",
        badminton: "#15803d",
        basketball: "#f97316",
        tennis: "#facc15",
        other: "#6366f1"
    };

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

                    {/* Venue 01 */}
                    <TouchableOpacity
                        className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4"
                        onPress={() => navigateToVenue(1)}
                        activeOpacity={0.8}
                    >
                        <View className="h-40 relative">
                            <View className="absolute top-0 left-0 w-full h-full bg-gray-200 opacity-20"></View>
                            <View className="p-5">
                                <Text className="text-gray-800 text-xl font-bold mb-1">Venue 01</Text>
                                <Text className="text-[#22c55e] mb-2">Distance - 4.5km</Text>

                                <View className="flex-row mt-auto items-center justify-between">
                                    <View className="flex-row items-center bg-white px-2 py-1 rounded-lg">
                                        <Ionicons name="star" size={16} color="#22c55e" />
                                        <Text className="text-gray-800 ml-1 font-bold">5.0</Text>
                                    </View>

                                    <View className="bg-[#22c55e] px-4 py-2 rounded-lg flex-row items-center">
                                        <Text className="text-white font-bold mr-1">View Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="white" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Venue 02 */}
                    <TouchableOpacity
                        className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4"
                        onPress={() => navigateToVenue(2)}
                        activeOpacity={0.8}
                    >
                        <View className="h-40 relative">
                            <View className="absolute top-0 left-0 w-full h-full bg-gray-200 opacity-20"></View>
                            <View className="p-5">
                                <Text className="text-gray-800 text-xl font-bold mb-1">Venue 02</Text>
                                <Text className="text-[#22c55e] mb-2">Distance - 5km</Text>

                                <View className="flex-row mt-auto items-center justify-between">
                                    <View className="flex-row items-center bg-white px-2 py-1 rounded-lg">
                                        <Ionicons name="star" size={16} color="#22c55e" />
                                        <Text className="text-gray-800 ml-1 font-bold">5.0</Text>
                                    </View>

                                    <View className="bg-[#22c55e] px-4 py-2 rounded-lg flex-row items-center">
                                        <Text className="text-white font-bold mr-1">View Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="white" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Venue 03 */}
                    <TouchableOpacity
                        className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4"
                        onPress={() => navigateToVenue(3)}
                        activeOpacity={0.8}
                    >
                        <View className="h-40 relative">
                            <View className="absolute top-0 left-0 w-full h-full bg-gray-200 opacity-20"></View>
                            <View className="p-5">
                                <Text className="text-gray-800 text-xl font-bold mb-1">Venue 03</Text>
                                <Text className="text-[#22c55e] mb-2">Distance - 5km</Text>

                                <View className="flex-row mt-auto items-center justify-between">
                                    <View className="flex-row items-center bg-white px-2 py-1 rounded-lg">
                                        <Ionicons name="star" size={16} color="#22c55e" />
                                        <Text className="text-gray-800 ml-1 font-bold">5.0</Text>
                                    </View>

                                    <View className="bg-[#22c55e] px-4 py-2 rounded-lg flex-row items-center">
                                        <Text className="text-white font-bold mr-1">View Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="white" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Venue 04 */}
                    <TouchableOpacity
                        className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                        onPress={() => navigateToVenue(4)}
                        activeOpacity={0.8}
                    >
                        <View className="h-40 relative">
                            <View className="absolute top-0 left-0 w-full h-full bg-gray-200 opacity-20"></View>
                            <View className="p-5">
                                <Text className="text-gray-800 text-xl font-bold mb-1">Venue 04</Text>
                                <Text className="text-[#22c55e] mb-2">Distance - 5km</Text>

                                <View className="flex-row mt-auto items-center justify-between">
                                    <View className="flex-row items-center bg-white px-2 py-1 rounded-lg">
                                        <Ionicons name="star" size={16} color="#22c55e" />
                                        <Text className="text-gray-800 ml-1 font-bold">5.0</Text>
                                    </View>

                                    <View className="bg-[#22c55e] px-4 py-2 rounded-lg flex-row items-center">
                                        <Text className="text-white font-bold mr-1">View Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="white" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Popular Venues Section */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    <Text className="text-gray-800 text-2xl font-bold text-center">Popular Venues</Text>
                    <Text className="text-gray-600 text-lg text-center mb-5">
                        {selectedSport === 'football' && 'Football 🏈'}
                        {selectedSport === 'badminton' && 'Badminton 🏸'}
                        {selectedSport === 'basketball' && 'Basketball 🏀'}
                        {selectedSport === 'tennis' && 'Tennis 🎾'}
                        {selectedSport === 'other' && 'All Sports 🏆'}
                    </Text>

                    {/* Venues Grid - First Row */}
                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity
                            className="w-[30%]"
                            onPress={() => navigateToVenue(5)}
                        >
                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-md">
                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                    <Ionicons name="star" size={12} color="white" />
                                    <Text className="text-white text-xs ml-0.5">5.0</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-center">Venue 05</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-[30%]"
                            onPress={() => navigateToVenue(6)}
                        >
                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-sm">
                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                    <Ionicons name="star" size={12} color="white" />
                                    <Text className="text-white text-xs ml-0.5">5.0</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-center">Venue 06</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-[30%]"
                            onPress={() => navigateToVenue(7)}
                        >
                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-sm">
                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                    <Ionicons name="star" size={12} color="white" />
                                    <Text className="text-white text-xs ml-0.5">5.0</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-center">Venue 07</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Venues Grid - Second Row */}
                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            className="w-[30%]"
                            onPress={() => navigateToVenue(8)}
                        >
                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-sm">
                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                    <Ionicons name="star" size={12} color="white" />
                                    <Text className="text-white text-xs ml-0.5">5.0</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-center">Venue 08</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-[30%]"
                            onPress={() => navigateToVenue(9)}
                        >
                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-sm">
                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                    <Ionicons name="star" size={12} color="white" />
                                    <Text className="text-white text-xs ml-0.5">5.0</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-center">Venue 09</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-[30%]"
                            onPress={() => navigateToVenue(10)}
                        >
                            <View className="h-24 rounded-lg border border-gray-200 bg-gray-50 mb-1 relative shadow-sm">
                                <View className="absolute bottom-1 right-1 bg-[rgba(0,0,0,0.6)] rounded-lg px-1 py-0.5 flex-row items-center">
                                    <Ionicons name="star" size={12} color="white" />
                                    <Text className="text-white text-xs ml-0.5">5.0</Text>
                                </View>
                            </View>
                            <Text className="text-gray-700 text-center">Venue 10</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <Navbar />
        </SafeAreaView>
    );
}