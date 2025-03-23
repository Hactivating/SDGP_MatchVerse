// components/Navbar.tsx
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    });

    // Animation values for each tab
    const homeAnim = useRef(new Animated.Value(isActive('/home') ? 1 : 0)).current;
    const venuesAnim = useRef(new Animated.Value(isActive('/venues') ? 1 : 0)).current;
    const findAnim = useRef(new Animated.Value(isActive('/find') ? 1 : 0)).current;
    const leaderboardAnim = useRef(new Animated.Value(isActive('/leaderboard') ? 1 : 0)).current;
    const profileAnim = useRef(new Animated.Value(isActive('/profile') ? 1 : 0)).current;

    // Helper function to determine if a route is active
    function isActive(path: string): boolean {
        return pathname.includes(path);
    }

    // Update animations when route changes
    useEffect(() => {
        Animated.parallel([
            Animated.timing(homeAnim, {
                toValue: isActive('/home') ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(venuesAnim, {
                toValue: isActive('/venues') ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(findAnim, {
                toValue: isActive('/find') ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(leaderboardAnim, {
                toValue: isActive('/leaderboard') ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(profileAnim, {
                toValue: isActive('/profile') ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, [pathname]);

    const navigate = (route: string): void => {
        // Check if we're already exactly on that route
        // This prevents re-navigation to the same route
        const currentMainRoute = pathname.split('/').pop();
        const targetRoute = route.split('/').pop();

        if (currentMainRoute !== targetRoute) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(route);
        }
    };

    // Define colors for active and inactive states
    const activeColor = "#10b68d";
    const inactiveColor = "#94a3b8";

    // Size and opacity interpolations
    const getScaleInterpolation = (anim) => {
        return anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
        });
    };

    const getOpacityInterpolation = (anim) => {
        return anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });
    };

    const getColorInterpolation = (anim) => {
        return anim.interpolate({
            inputRange: [0, 1],
            outputRange: [inactiveColor, activeColor],
        });
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View className="absolute bottom-0 left-0 right-0 z-10">
            <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(240,245,255,0.97)']}
                className="pt-3 pb-10 shadow-lg"
                style={{
                    shadowOffset: { width: 0, height: -3 },
                    shadowRadius: 5,
                    shadowOpacity: 0.1,
                    elevation: 10,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }}>
                <View className="flex-row mx-auto px-2" style={{ width: '100%', maxWidth: 500 }}>
                    {/* HOME */}
                    <View className="flex-1 items-center justify-center">
                        <TouchableOpacity
                            className="items-center justify-end w-16 h-16 pt-4"
                            onPress={() => navigate('/(app)/home')}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                className="items-center justify-end"
                                style={{ transform: [{ scale: getScaleInterpolation(homeAnim) }] }}
                            >
                                <Animated.View
                                    className="h-2 w-10 rounded-full mb-1"
                                    style={{
                                        backgroundColor: activeColor,
                                        opacity: getOpacityInterpolation(homeAnim),
                                    }}
                                />
                                <Animated.View className="w-12 h-8 items-center justify-center">
                                    <Ionicons
                                        name="home"
                                        size={26}
                                        color={isActive('/home') ? activeColor : inactiveColor}
                                    />
                                </Animated.View>
                                <Animated.Text
                                    style={{
                                        fontFamily: 'Poppins-Medium',
                                        fontSize: 12,
                                        color: getColorInterpolation(homeAnim),
                                        marginTop: 5
                                    }}
                                >
                                    Home
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* VENUES */}
                    <View className="flex-1 items-center justify-center">
                        <TouchableOpacity
                            className="items-center justify-end w-16 h-16 pt-4"
                            onPress={() => navigate('/(app)/venues')}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                className="items-center justify-end"
                                style={{ transform: [{ scale: getScaleInterpolation(venuesAnim) }] }}
                            >
                                <Animated.View
                                    className="h-2 w-10 rounded-full mb-1"
                                    style={{
                                        backgroundColor: activeColor,
                                        opacity: getOpacityInterpolation(venuesAnim),
                                    }}
                                />
                                <Animated.View className="w-12 h-8 items-center justify-center">
                                    <Ionicons
                                        name="location"
                                        size={26}
                                        color={isActive('/venues') ? activeColor : inactiveColor}
                                    />
                                </Animated.View>
                                <Animated.Text
                                    style={{
                                        fontFamily: 'Poppins-Medium',
                                        fontSize: 12,
                                        color: getColorInterpolation(venuesAnim),
                                        marginTop: 5
                                    }}
                                >
                                    Courts
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* FIND - Modified to align with other icons */}
                    <View className="flex-1 items-center justify-center">
                        <TouchableOpacity
                            className="items-center justify-end w-16 h-16 pt-4"
                            onPress={() => navigate('/(app)/MatchScreen')}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                className="items-center justify-end"
                                style={{ transform: [{ scale: getScaleInterpolation(findAnim) }] }}
                            >
                                <Animated.View
                                    className="h-2 w-10 rounded-full mb-1"
                                    style={{
                                        backgroundColor: activeColor,
                                        opacity: getOpacityInterpolation(findAnim),
                                    }}
                                />
                                <LinearGradient
                                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{
                                        shadowColor: '#10b68d',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 3,
                                        elevation: 4,
                                    }}
                                >
                                    <Ionicons
                                        name="search"
                                        size={22}
                                        color="white"
                                    />
                                </LinearGradient>
                                <Animated.Text
                                    style={{
                                        fontFamily: 'Poppins-Medium',
                                        fontSize: 12,
                                        color: getColorInterpolation(findAnim),
                                        marginTop: 5
                                    }}
                                >
                                    Matches
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* LEADERBOARD */}
                    <View className="flex-1 items-center justify-center">
                        <TouchableOpacity
                            className="items-center justify-end w-16 h-16 pt-4"
                            onPress={() => navigate('/(app)/leaderboard')}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                className="items-center justify-end"
                                style={{ transform: [{ scale: getScaleInterpolation(leaderboardAnim) }] }}
                            >
                                <Animated.View
                                    className="h-2 w-10 rounded-full mb-1"
                                    style={{
                                        backgroundColor: activeColor,
                                        opacity: getOpacityInterpolation(leaderboardAnim),
                                    }}
                                />
                                <Animated.View className="w-12 h-8 items-center justify-center">
                                    <Ionicons
                                        name="trophy"
                                        size={26}
                                        color={isActive('/leaderboard') ? activeColor : inactiveColor}
                                    />
                                </Animated.View>
                                <Animated.Text
                                    style={{
                                        fontFamily: 'Poppins-Medium',
                                        fontSize: 12,
                                        color: getColorInterpolation(leaderboardAnim),
                                        marginTop: 5
                                    }}
                                >
                                    Rankings
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* PROFILE */}
                    <View className="flex-1 items-center justify-center">
                        <TouchableOpacity
                            className="items-center justify-end w-16 h-16 pt-4"
                            onPress={() => navigate('/(app)/profile')}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                className="items-center justify-end"
                                style={{ transform: [{ scale: getScaleInterpolation(profileAnim) }] }}
                            >
                                <Animated.View
                                    className="h-2 w-10 rounded-full mb-1"
                                    style={{
                                        backgroundColor: activeColor,
                                        opacity: getOpacityInterpolation(profileAnim),
                                    }}
                                />
                                <Animated.View className="w-12 h-8 items-center justify-center">
                                    <Ionicons
                                        name="person"
                                        size={26}
                                        color={isActive('/profile') ? activeColor : inactiveColor}
                                    />
                                </Animated.View>
                                <Animated.Text
                                    style={{
                                        fontFamily: 'Poppins-Medium',
                                        fontSize: 12,
                                        color: getColorInterpolation(profileAnim),
                                        marginTop: 5
                                    }}
                                >
                                    Profile
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}
