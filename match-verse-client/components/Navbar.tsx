// components/Navbar.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    // Helper function to determine if a route is active
    const isActive = (path: string): boolean => {
        return pathname.includes(path);
    };

    const navigate = (route: string): void => {
        // Prevent navigation if we're already on that route
        if (!pathname.includes(route)) {
            router.push(route);
        }
    };

    return (
        <View className="bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0 z-10 shadow-lg py-2 pt-4" style={{ shadowOffset: { width: 0, height: -3 }, shadowRadius: 5, shadowOpacity: 0.1, elevation: 5 }}>
            <View className="flex-row mx-auto" style={{ width: '100%', maxWidth: 500 }}>
                {/* HOME */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-16 h-18"
                        onPress={() => navigate('/(app)/home')}
                        activeOpacity={0.7}
                    >
                        <View className="relative items-center justify-center">
                            {isActive('/home') && (
                                <View className="w-12 h-12 bg-[rgba(34,197,94,0.2)] rounded-full absolute" />
                            )}
                            <View className="w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="home" size={24} color="#22c55e" />
                            </View>
                        </View>
                        <Text className={`text-[#22c55e] text-xs mt-2 ${isActive('/home') ? 'font-bold' : ''}`}>
                            Home
                        </Text>
                        {isActive('/home') && (
                            <View className="h-1 w-5 bg-[#22c55e] rounded-full mt-1" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* VENUES */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-16 h-18"
                        onPress={() => navigate('/(app)/venues')}
                        activeOpacity={0.7}
                    >
                        <View className="relative items-center justify-center">
                            {isActive('/venues') && (
                                <View className="w-12 h-12 bg-[rgba(34,197,94,0.2)] rounded-full absolute" />
                            )}
                            <View className="w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="location" size={24} color="#22c55e" />
                            </View>
                        </View>
                        <Text className={`text-[#22c55e] text-xs mt-2 ${isActive('/venues') ? 'font-bold' : ''}`}>
                            Venues
                        </Text>
                        {isActive('/venues') && (
                            <View className="h-1 w-5 bg-[#22c55e] rounded-full mt-1" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* FIND */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-16 h-18"
                        onPress={() => navigate('/(app)/find')}
                        activeOpacity={0.7}
                    >
                        <View className="relative items-center justify-center">
                            {isActive('/find') && (
                                <View className="w-14 h-14 bg-[rgba(34,197,94,0.2)] rounded-full absolute" />
                            )}
                            <View className="w-12 h-12 rounded-full justify-center items-center bg-white border-2 border-[#22c55e] shadow-md">
                                <Ionicons name="add" size={30} color="#22c55e" />
                            </View>
                        </View>
                        <Text className={`text-[#22c55e] text-xs mt-2 ${isActive('/find') ? 'font-bold' : ''}`}>
                            Find
                        </Text>
                        {isActive('/find') && (
                            <View className="h-1 w-5 bg-[#22c55e] rounded-full mt-1" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* LEADERBOARD */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-16 h-18"
                        onPress={() => navigate('/(app)/leaderboard')}
                        activeOpacity={0.7}
                    >
                        <View className="relative items-center justify-center">
                            {isActive('/leaderboard') && (
                                <View className="w-12 h-12 bg-[rgba(34,197,94,0.2)] rounded-full absolute" />
                            )}
                            <View className="w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="trophy" size={24} color="#22c55e" />
                            </View>
                        </View>
                        <Text className={`text-[#22c55e] text-xs mt-2 ${isActive('/leaderboard') ? 'font-bold' : ''}`}>
                            Leaderboard
                        </Text>
                        {isActive('/leaderboard') && (
                            <View className="h-1 w-5 bg-[#22c55e] rounded-full mt-1" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* PROFILE */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-16 h-18"
                        onPress={() => navigate('/(app)/profile')}
                        activeOpacity={0.7}
                    >
                        <View className="relative items-center justify-center">
                            {isActive('/profile') && (
                                <View className="w-12 h-12 bg-[rgba(34,197,94,0.2)] rounded-full absolute" />
                            )}
                            <View className="w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="person" size={24} color="#22c55e" />
                            </View>
                        </View>
                        <Text className={`text-[#22c55e] text-xs mt-2 ${isActive('/profile') ? 'font-bold' : ''}`}>
                            Profile
                        </Text>
                        {isActive('/profile') && (
                            <View className="h-1 w-5 bg-[#22c55e] rounded-full mt-1" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}