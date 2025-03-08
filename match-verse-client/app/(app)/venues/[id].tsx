// app/(app)/venues/[id].tsx
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Navbar from '@/components/Navbar';

export default function VenueDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // This would normally come from an API or database
    // Using a switch statement to show different data based on venue ID
    let venueData;

    switch(id) {
        case '1':
            venueData = {
                id,
                name: "Sporta Fusion",
                location: "2nd lane, Colombo, Sri Lanka",
                rating: "5.0",
                reviews: "6324",
                phone: "+94 11 123 4567",
                availableCourts: [
                    { id: 1, name: "Futsal", icon: "football" },
                    { id: 2, name: "Badminton", icon: "tennisball" },
                    { id: 3, name: "Basketball", icon: "basketball" }
                ]
            };
            break;
        case '2':
            venueData = {
                id,
                name: "Stadium Arena",
                location: "Main Street, Colombo, Sri Lanka",
                rating: "4.8",
                reviews: "4562",
                phone: "+94 11 234 5678",
                availableCourts: [
                    { id: 1, name: "Football", icon: "football" },
                    { id: 2, name: "Basketball", icon: "basketball" }
                ]
            };
            break;
        case '3':
            venueData = {
                id,
                name: "Central Courts",
                location: "Park Road, Colombo, Sri Lanka",
                rating: "4.9",
                reviews: "3219",
                phone: "+94 11 345 6789",
                availableCourts: [
                    { id: 1, name: "Tennis", icon: "tennisball" },
                    { id: 2, name: "Badminton", icon: "tennisball" }
                ]
            };
            break;
        case '4':
            venueData = {
                id,
                name: "Fitness Hub",
                location: "Beach Road, Colombo, Sri Lanka",
                rating: "4.7",
                reviews: "2867",
                phone: "+94 11 456 7890",
                availableCourts: [
                    { id: 1, name: "Basketball", icon: "basketball" },
                    { id: 2, name: "Badminton", icon: "tennisball" },
                    { id: 3, name: "Futsal", icon: "football" }
                ]
            };
            break;
        case '5':
            venueData = {
                id,
                name: "Green Field",
                location: "Hill Street, Colombo, Sri Lanka",
                rating: "4.6",
                reviews: "1942",
                phone: "+94 11 567 8901",
                availableCourts: [
                    { id: 1, name: "Football", icon: "football" }
                ]
            };
            break;
        case '6':
            venueData = {
                id,
                name: "Elite Sports Complex",
                location: "Central Avenue, Colombo, Sri Lanka",
                rating: "5.0",
                reviews: "3578",
                phone: "+94 11 678 9012",
                availableCourts: [
                    { id: 1, name: "Tennis", icon: "tennisball" },
                    { id: 2, name: "Basketball", icon: "basketball" },
                    { id: 3, name: "Badminton", icon: "tennisball" }
                ]
            };
            break;
        case '7':
            venueData = {
                id,
                name: "Victory Arena",
                location: "Stadium Road, Colombo, Sri Lanka",
                rating: "4.9",
                reviews: "2741",
                phone: "+94 11 789 0123",
                availableCourts: [
                    { id: 1, name: "Basketball", icon: "basketball" },
                    { id: 2, name: "Futsal", icon: "football" }
                ]
            };
            break;
        case '8':
            venueData = {
                id,
                name: "Premier Sports Club",
                location: "Club Road, Colombo, Sri Lanka",
                rating: "4.8",
                reviews: "1863",
                phone: "+94 11 890 1234",
                availableCourts: [
                    { id: 1, name: "Tennis", icon: "tennisball" },
                    { id: 2, name: "Badminton", icon: "tennisball" }
                ]
            };
            break;
        case '9':
            venueData = {
                id,
                name: "Urban Sports Center",
                location: "City Center, Colombo, Sri Lanka",
                rating: "4.7",
                reviews: "2195",
                phone: "+94 11 901 2345",
                availableCourts: [
                    { id: 1, name: "Basketball", icon: "basketball" },
                    { id: 2, name: "Futsal", icon: "football" }
                ]
            };
            break;
        case '10':
            venueData = {
                id,
                name: "Champion Courts",
                location: "Victory Road, Colombo, Sri Lanka",
                rating: "4.9",
                reviews: "3124",
                phone: "+94 11 012 3456",
                availableCourts: [
                    { id: 1, name: "Tennis", icon: "tennisball" },
                    { id: 2, name: "Basketball", icon: "basketball" },
                    { id: 3, name: "Badminton", icon: "tennisball" }
                ]
            };
            break;
        default:
            // Default fallback data
            venueData = {
                id,
                name: "Sports Venue",
                location: "Colombo, Sri Lanka",
                rating: "5.0",
                reviews: "1000+",
                phone: "+94 11 123 4567",
                availableCourts: [
                    { id: 1, name: "Badminton", icon: "tennisball" },
                    { id: 2, name: "Basketball", icon: "basketball" }
                ]
            };
    }

    // Sport colors - matching home and venues pages
    const sportColors = {
        football: "#e11d48",
        badminton: "#15803d",
        basketball: "#f97316",
        tennis: "#facc15",
        other: "#6366f1"
    };

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
                        {/* If you have actual images, you would use Image component here */}
                        {/* Example:
                        <Image
                            source={require('@/assets/images/venue-badminton.jpg')}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        */}
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
                            <Text className="text-white text-3xl font-bold">{venueData.name}</Text>
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
                        <Text className="text-gray-800 ml-2 flex-1">{venueData.location}</Text>
                    </TouchableOpacity>
                </View>

                {/* Venue Info Card */}
                <View className="mx-6 mb-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    {/* Rating */}
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="star" size={22} color="#22c55e" />
                        <Text className="text-gray-800 ml-2 text-base font-bold">{venueData.rating}</Text>
                        <Text className="text-gray-500 ml-1 text-base">({venueData.reviews} reviews)</Text>
                    </View>

                    {/* Phone */}
                    <View className="flex-row items-center">
                        <Ionicons name="call-outline" size={22} color="#22c55e" />
                        <Text className="text-gray-800 ml-2 text-base">{venueData.phone}</Text>
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

                    <View className="flex-row justify-evenly">
                        {venueData.availableCourts.map((court) => (
                            <TouchableOpacity
                                key={court.id}
                                className="items-center"
                                activeOpacity={0.7}
                            >
                                <View className="w-24 h-24 rounded-lg border border-[#22c55e] items-center justify-center mb-2 bg-gray-50">
                                    <Ionicons
                                        name={court.icon}
                                        size={32}
                                        color={
                                            court.name === "Futsal" ? sportColors.football :
                                                court.name === "Badminton" ? sportColors.badminton :
                                                    court.name === "Basketball" ? sportColors.basketball :
                                                        sportColors.other
                                        }
                                    />
                                </View>
                                <Text className="text-gray-700 text-center">{court.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Court Availability Section */}
                <View className="mx-6 my-4 p-5 rounded-xl border border-gray-200 bg-white shadow-md">
                    <Text className="text-gray-800 text-2xl font-bold text-center mb-6">Court Availability</Text>

                    {/* Date Selection */}
                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity className="bg-[#22c55e] px-4 py-2 rounded-lg">
                            <Text className="text-white font-bold">Today</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <Text className="text-gray-800">Tomorrow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <Text className="text-gray-800">Saturday</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Time Slots */}
                    <View className="mt-4">
                        <Text className="text-gray-800 text-lg mb-4">Available Time Slots:</Text>

                        <View className="flex-row flex-wrap justify-between">
                            {['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM', '7:30 PM'].map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`px-4 py-2 rounded-lg mb-3 ${index === 0 ? 'bg-[#22c55e]' : 'bg-gray-50 border border-gray-200'}`}
                                    style={{ width: '48%' }}
                                >
                                    <Text className={`${index === 0 ? 'text-white font-bold' : 'text-gray-800'} text-center`}>{time}</Text>
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

                    {/* Review Card */}
                    <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                            <View>
                                <Text className="text-gray-800 font-bold">John Doe</Text>
                                <View className="flex-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons key={star} name="star" size={14} color="#22c55e" />
                                    ))}
                                    <Text className="text-gray-500 ml-2 text-xs">2 days ago</Text>
                                </View>
                            </View>
                        </View>
                        <Text className="text-gray-700">Great facilities and friendly staff. Courts are well maintained and the pricing is reasonable. Highly recommend for badminton enthusiasts!</Text>
                    </View>

                    {/* Review Card */}
                    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                            <View>
                                <Text className="text-gray-800 font-bold">Jane Smith</Text>
                                <View className="flex-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons key={star} name="star" size={14} color="#22c55e" />
                                    ))}
                                    <Text className="text-gray-500 ml-2 text-xs">1 week ago</Text>
                                </View>
                            </View>
                        </View>
                        <Text className="text-gray-700">Perfect location with excellent basketball courts. The staff is very helpful and the booking system is seamless. Will definitely come back again!</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <Navbar />
        </SafeAreaView>
    );
}