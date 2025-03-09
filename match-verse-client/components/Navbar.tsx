// components/Navbar.tsx
import { View, TouchableOpacity } from 'react-native';
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
        // Check if we're already exactly on that route
        // This prevents re-navigation to the same route
        const currentMainRoute = pathname.split('/').pop();
        const targetRoute = route.split('/').pop();

        if (currentMainRoute !== targetRoute) {
            router.push(route);
        }
    };

    // Define colors for active and inactive states
    const activeColor = "#22c55e";
    const inactiveColor = "#737373";

    return (
        <View className="bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0 z-10 shadow-lg py-4 pb-6" style={{ shadowOffset: { width: 0, height: -3 }, shadowRadius: 5, shadowOpacity: 0.1, elevation: 5 }}>
            <View className="flex-row mx-auto" style={{ width: '100%', maxWidth: 500 }}>
                {/* HOME */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-14 h-16"
                        onPress={() => navigate('/(app)/home')}
                        activeOpacity={0.7}
                    >
                        <View className="items-center">
                            {isActive('/home') && (
                                <View className="h-2 w-2 bg-[#22c55e] rounded-full mb-1" />
                            )}
                            {!isActive('/home') && (
                                <View className="h-2 w-2 bg-transparent mb-1" />
                            )}
                            <View className="w-12 h-12 rounded-full items-center justify-center">
                                <Ionicons
                                    name="home"
                                    size={26}
                                    color={isActive('/home') ? activeColor : inactiveColor}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* VENUES */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-14 h-16"
                        onPress={() => navigate('/(app)/venues')}
                        activeOpacity={0.7}
                    >
                        <View className="items-center">
                            {isActive('/venues') && (
                                <View className="h-2 w-2 bg-[#22c55e] rounded-full mb-1" />
                            )}
                            {!isActive('/venues') && (
                                <View className="h-2 w-2 bg-transparent mb-1" />
                            )}
                            <View className="w-12 h-12 rounded-full items-center justify-center">
                                <Ionicons
                                    name="location"
                                    size={26}
                                    color={isActive('/venues') ? activeColor : inactiveColor}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* FIND */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-14 h-16"
                        onPress={() => navigate('/(app)/find')}
                        activeOpacity={0.7}
                    >
                        <View className="items-center">
                            {isActive('/find') && (
                                <View className="h-2 w-2 bg-[#22c55e] rounded-full mb-1" />
                            )}
                            {!isActive('/find') && (
                                <View className="h-2 w-2 bg-transparent mb-1" />
                            )}
                            <View className="w-12 h-12 rounded-full justify-center items-center bg-white border-2 border-[#22c55e] shadow-md">
                                <Ionicons
                                    name="add"
                                    size={26}
                                    color={activeColor} // Always green for emphasis
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* LEADERBOARD */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-14 h-16"
                        onPress={() => navigate('/(app)/leaderboard')}
                        activeOpacity={0.7}
                    >
                        <View className="items-center">
                            {isActive('/leaderboard') && (
                                <View className="h-2 w-2 bg-[#22c55e] rounded-full mb-1" />
                            )}
                            {!isActive('/leaderboard') && (
                                <View className="h-2 w-2 bg-transparent mb-1" />
                            )}
                            <View className="w-12 h-12 rounded-full items-center justify-center">
                                <Ionicons
                                    name="trophy"
                                    size={26}
                                    color={isActive('/leaderboard') ? activeColor : inactiveColor}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* PROFILE */}
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity
                        className="items-center justify-center w-14 h-16"
                        onPress={() => navigate('/(app)/profile')}
                        activeOpacity={0.7}
                    >
                        <View className="items-center">
                            {isActive('/profile') && (
                                <View className="h-2 w-2 bg-[#22c55e] rounded-full mb-1" />
                            )}
                            {!isActive('/profile') && (
                                <View className="h-2 w-2 bg-transparent mb-1" />
                            )}
                            <View className="w-12 h-12 rounded-full items-center justify-center">
                                <Ionicons
                                    name="person"
                                    size={26}
                                    color={isActive('/profile') ? activeColor : inactiveColor}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}