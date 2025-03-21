import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllVenues, Venue } from '@/services/venue';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';

// Venue Card Component - same as in Home page
const VenueCard = ({ venue, onPress }) => {
    const [pressed, setPressed] = useState(false);

    return (
        <TouchableWithoutFeedback
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={onPress}
        >
            <Animated.View
                className="w-[30%]"
                style={{
                    transform: [{ scale: pressed ? 0.97 : 1 }]
                }}
            >
                <View className="h-28 rounded-xl overflow-hidden mb-1.5 relative shadow-md">
                    {venue.venueImageUrl ? (
                        <Image
                            source={{ uri: venue.venueImageUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={['rgba(16,182,141,0.5)', 'rgba(4,109,100,0.3)']}
                            style={{ width: '100%', height: '100%' }}
                        />
                    )}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
                    />
                    <View className="absolute bottom-1.5 right-1.5 bg-[rgba(0,0,0,0.7)] rounded-lg px-1.5 py-0.5 flex-row items-center">
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-xs ml-0.5">
                            {venue.rating ? venue.rating.toFixed(1) : "New"}
                        </Text>
                    </View>
                </View>
                <Text style={{ fontFamily: 'Poppins-Medium', lineHeight: 18 }} className="text-gray-700 text-center">
                    {venue.venueName || venue.name || `Venue ${venue.venueId}`}
                </Text>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

// Enhanced Button Component - same as in Home page
const GradientButton = ({ onPress, text, icon, small }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={handlePress}
        >
            <Animated.View
                style={{
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                }}
            >
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    className={`flex-row ${small ? 'py-2 px-4' : 'py-3 px-5'} rounded-full items-center shadow-md`}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white mr-1.5">
                        {text}
                    </Text>
                    {icon && icon}
                </LinearGradient>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

// Main Component
export default function Venues() {
    const router = useRouter();
    const [selectedSport, setSelectedSport] = useState('badminton');
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY] = useState(new Animated.Value(0));
    const sportAnimation = useRef(new Animated.Value(0)).current;

    // Animation values - similar to profile screen
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const headerTitleAnim = useRef(new Animated.Value(0)).current;

    // Card animations with staggered effect
    const cardAnimations = useRef({
        sports: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        location: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        available: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        popular: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) }
    }).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    useEffect(() => {
        fetchVenues();

        // Start animations when component mounts - similar to profile screen
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(headerTitleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered animations for cards
        const animateCards = () => {
            const delays = {
                sports: 100,
                location: 200,
                available: 300,
                popular: 400
            };

            Object.entries(cardAnimations).forEach(([key, anim]) => {
                Animated.parallel([
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        delay: delays[key],
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 500,
                        delay: delays[key],
                        useNativeDriver: true,
                    })
                ]).start();
            });
        };

        animateCards();
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

    const selectSport = (sport) => {
        if (selectedSport === sport) return;

        // Trigger haptic feedback when changing sports
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Animate sport change
        Animated.sequence([
            Animated.timing(sportAnimation, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(sportAnimation, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start();

        setSelectedSport(sport);
    };

    const sportColors = {
        football: "#e11d48",
        badminton: "#10b68d",
        basketball: "#f97316",
        tennis: "#facc15",
        other: "#6366f1"
    };

    const isAvailableSport = selectedSport === 'badminton';

    // Consistent frosted glass effect style
    const frostedGlassStyle = {
        colors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)'],
        className: "backdrop-blur-md rounded-2xl shadow-lg"
    };

    const headerTitleStyle = {
        opacity: headerTitleAnim,
        transform: [
            {
                translateY: headerTitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                }),
            },
        ],
    };

    if (!fontsLoaded) {
        return null; // Return null or a loading indicator while fonts load
    }

    const fadeInOut = {
        opacity: sportAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.5, 1],
        }),
    };

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            {/* Enhanced Gradient Background */}
            <LinearGradient
                colors={['#10b68d', '#0a8d6d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView className="flex-1">
                <Animated.View style={[{ opacity: headerOpacity }, headerTitleStyle]} className="pt-8 px-6 pb-5">
                    <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-1">
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 28, lineHeight: 34 }} className="text-white">
                                Find Courts
                            </Text>
                            <Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }} className="text-white text-base opacity-90">
                                Discover your perfect match location
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/profile')}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                            }}
                        >
                            <Ionicons name="search" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }}
                    >
                        {/* Sports selection with frosted effect - Updated with animations */}
                        <Animated.View
                            className="mx-6 overflow-hidden rounded-2xl shadow-lg"
                            style={{
                                opacity: cardAnimations.sports.opacity,
                                transform: [{ translateY: cardAnimations.sports.translateY }]
                            }}
                        >
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="py-4 px-2 backdrop-blur-md"
                            >
                                <View className="flex-row justify-between py-2 px-4">
                                    {['badminton', 'football', 'basketball', 'tennis', 'other'].map((sport) => (
                                        <TouchableOpacity
                                            key={sport}
                                            className="items-center"
                                            onPress={() => selectSport(sport)}
                                            activeOpacity={0.7}
                                        >
                                            <Animated.View
                                                className={`w-14 h-14 rounded-full border-2 border-[#10b68d] items-center justify-center ${selectedSport === sport ? 'bg-[rgba(16,182,141,0.15)]' : ''}`}
                                                style={{
                                                    transform: [{ scale: selectedSport === sport ? 1.05 : 1 }],
                                                    shadowColor: '#10b68d',
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: selectedSport === sport ? 0.2 : 0,
                                                    shadowRadius: 4,
                                                    elevation: selectedSport === sport ? 2 : 0,
                                                }}
                                            >
                                                {sport === 'badminton' ? (
                                                    <Text style={{ fontSize: 24 }}>🏸</Text>
                                                ) : sport === 'football' ? (
                                                    <Ionicons name="football" size={32} color={sportColors.football} />
                                                ) : sport === 'basketball' ? (
                                                    <Ionicons name="basketball" size={32} color={sportColors.basketball} />
                                                ) : sport === 'tennis' ? (
                                                    <Ionicons name="tennisball" size={32} color={sportColors.tennis} />
                                                ) : (
                                                    <Ionicons name="grid" size={32} color={sportColors.other} />
                                                )}
                                            </Animated.View>
                                            <View className={`h-1.5 w-6 rounded-full mt-1.5 ${selectedSport === sport ? 'bg-[#10b68d]' : 'bg-transparent'}`} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        {/* Location selector with animations */}
                        <Animated.View
                            className="mx-6 mt-7 overflow-hidden rounded-2xl shadow-lg"
                            style={{
                                opacity: cardAnimations.location.opacity,
                                transform: [{ translateY: cardAnimations.location.translateY }]
                            }}
                        >
                            <LinearGradient
                                colors={frostedGlassStyle.colors}
                                className="p-4 backdrop-blur-md"
                            >
                                <TouchableOpacity
                                    className="flex-row items-center"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-10 h-10 rounded-full bg-[rgba(16,182,141,0.15)] items-center justify-center mr-3">
                                        <Ionicons name="location" size={22} color="#10b68d" />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800">Your Current Location</Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-sm">Filter venues by proximity</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#10b68d" />
                                </TouchableOpacity>
                            </LinearGradient>
                        </Animated.View>

                        <Animated.View style={fadeInOut}>
                            {isAvailableSport ? (
                                <>
                                    {/* Available Venues Section with animations */}
                                    <Animated.View
                                        className="mx-6 mt-7 overflow-hidden rounded-2xl shadow-lg"
                                        style={{
                                            opacity: cardAnimations.available.opacity,
                                            transform: [{ translateY: cardAnimations.available.translateY }]
                                        }}
                                    >
                                        <LinearGradient
                                            colors={frostedGlassStyle.colors}
                                            className="p-5 backdrop-blur-md"
                                        >
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 text-center mb-2">Available Venues</Text>
                                            <Text style={{ fontFamily: 'Poppins-Medium', lineHeight: 24 }} className="text-gray-700 text-center mb-5">
                                                Badminton Courts 🏸
                                            </Text>

                                            {loading ? (
                                                <View className="items-center justify-center py-8">
                                                    <ActivityIndicator size="large" color="#10b68d" />
                                                    <Text style={{ fontFamily: 'Poppins-Regular', marginTop: 8 }} className="text-gray-500">Loading venues...</Text>
                                                </View>
                                            ) : error ? (
                                                <View className="items-center justify-center py-8">
                                                    <Ionicons name="cloud-offline" size={48} color="#f43f5e" />
                                                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-red-500 text-center mb-2">{error}</Text>
                                                    <GradientButton
                                                        onPress={fetchVenues}
                                                        text="Try Again"
                                                        small
                                                    />
                                                </View>
                                            ) : venues.length === 0 ? (
                                                <View className="items-center justify-center py-8">
                                                    <Ionicons name="location-outline" size={48} color="#9ca3af" />
                                                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-gray-500 text-center">No venues found</Text>
                                                </View>
                                            ) : (
                                                venues.map((venue, index) => (
                                                    <TouchableWithoutFeedback
                                                        key={venue.venueId}
                                                        onPress={() => navigateToVenue(venue.venueId)}
                                                    >
                                                        <Animated.View
                                                            className="bg-[rgba(16,182,141,0.05)] rounded-xl overflow-hidden mb-4 border border-[rgba(16,182,141,0.2)]"
                                                            style={{
                                                                opacity: fadeAnim,
                                                                transform: [
                                                                    {
                                                                        translateY: Animated.timing(
                                                                            new Animated.Value(15),
                                                                            {
                                                                                toValue: 0,
                                                                                duration: 500,
                                                                                delay: 300 + (index * 80),
                                                                                useNativeDriver: true
                                                                            }
                                                                        )
                                                                    }
                                                                ]
                                                            }}
                                                        >
                                                            <View className="h-40 relative">
                                                                {venue.venueImageUrl ? (
                                                                    <Image
                                                                        source={{ uri: venue.venueImageUrl }}
                                                                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                                                                        resizeMode="cover"
                                                                    />
                                                                ) : (
                                                                    <LinearGradient
                                                                        colors={['rgba(16,182,141,0.3)', 'rgba(4,109,100,0.2)']}
                                                                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                                                                    />
                                                                )}
                                                                <LinearGradient
                                                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                                                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
                                                                />
                                                                <View className="p-5 relative h-full flex justify-between">
                                                                    <View>
                                                                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }} className="text-white mb-1 shadow-md">
                                                                            {venue.venueName || venue.name || "Unnamed Venue"}
                                                                        </Text>
                                                                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white mb-2 opacity-90">
                                                                            {venue.location || venue.address || "Location unavailable"}
                                                                        </Text>
                                                                    </View>

                                                                    <View className="flex-row items-center justify-between">
                                                                        <View className="flex-row items-center bg-[rgba(255,255,255,0.9)] px-2 py-1 rounded-lg shadow-md">
                                                                            <Ionicons name="star" size={16} color="#FFD700" />
                                                                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800 ml-1">
                                                                                {venue.rating ? venue.rating.toFixed(1) : "New"}
                                                                            </Text>
                                                                        </View>

                                                                        <View className="bg-[rgba(16,182,141,0.9)] px-3 py-1.5 rounded-lg flex-row items-center shadow-md">
                                                                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white mr-1">View Details</Text>
                                                                            <Ionicons name="arrow-forward" size={16} color="white" />
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </Animated.View>
                                                    </TouchableWithoutFeedback>
                                                ))
                                            )}
                                        </LinearGradient>
                                    </Animated.View>

                                    {/* Popular Venues Section with animations */}
                                    <Animated.View
                                        className="mx-6 mt-7 mb-4 overflow-hidden rounded-2xl shadow-lg"
                                        style={{
                                            opacity: cardAnimations.popular.opacity,
                                            transform: [{ translateY: cardAnimations.popular.translateY }]
                                        }}
                                    >
                                        <LinearGradient
                                            colors={frostedGlassStyle.colors}
                                            className="p-5 backdrop-blur-md"
                                        >
                                            <View className="flex-row justify-between items-center mb-5">
                                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800">Popular Venues</Text>
                                                <View className="flex-row items-center">
                                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">Badminton</Text>
                                                    <Text style={{ fontSize: 18 }}>🏸</Text>
                                                </View>
                                            </View>

                                            {loading ? (
                                                <View className="items-center justify-center py-8">
                                                    <ActivityIndicator size="large" color="#10b68d" />
                                                    <Text style={{ fontFamily: 'Poppins-Regular', marginTop: 8 }} className="text-gray-500">Loading venues...</Text>
                                                </View>
                                            ) : error ? (
                                                <View className="items-center justify-center py-8">
                                                    <Ionicons name="cloud-offline" size={48} color="#f43f5e" />
                                                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-red-500 text-center mb-2">{error}</Text>
                                                    <GradientButton
                                                        onPress={fetchVenues}
                                                        text="Try Again"
                                                        small
                                                    />
                                                </View>
                                            ) : venues.length > 0 ? (
                                                <>
                                                    <View className="flex-row justify-between mb-6">
                                                        {venues.slice(0, 3).map((venue, index) => (
                                                            <Animated.View
                                                                key={venue.venueId}
                                                                style={{
                                                                    opacity: fadeAnim,
                                                                    transform: [
                                                                        {
                                                                            translateY: Animated.timing(
                                                                                new Animated.Value(15),
                                                                                {
                                                                                    toValue: 0,
                                                                                    duration: 500,
                                                                                    delay: 400 + (index * 100),
                                                                                    useNativeDriver: true
                                                                                }
                                                                            )
                                                                        }
                                                                    ]
                                                                }}
                                                            >
                                                                <VenueCard
                                                                    venue={venue}
                                                                    onPress={() => navigateToVenue(venue.venueId)}
                                                                />
                                                            </Animated.View>
                                                        ))}
                                                    </View>

                                                    {venues.length > 3 && (
                                                        <View className="flex-row justify-between mb-4">
                                                            {venues.slice(3, 6).map((venue, index) => (
                                                                <Animated.View
                                                                    key={venue.venueId}
                                                                    style={{
                                                                        opacity: fadeAnim,
                                                                        transform: [
                                                                            {
                                                                                translateY: Animated.timing(
                                                                                    new Animated.Value(15),
                                                                                    {
                                                                                        toValue: 0,
                                                                                        duration: 500,
                                                                                        delay: 500 + (index * 100),
                                                                                        useNativeDriver: true
                                                                                    }
                                                                                )
                                                                            }
                                                                        ]
                                                                    }}
                                                                >
                                                                    <VenueCard
                                                                        venue={venue}
                                                                        onPress={() => navigateToVenue(venue.venueId)}
                                                                    />
                                                                </Animated.View>
                                                            ))}
                                                        </View>
                                                    )}

                                                    <TouchableOpacity
                                                        className="flex-row items-center justify-center mt-2"
                                                        activeOpacity={0.7}
                                                        onPress={() => console.log('View all venues')}
                                                    >
                                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">View All Venues</Text>
                                                        <Ionicons name="chevron-forward" size={16} color="#10b68d" />
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <View className="items-center justify-center py-8">
                                                    <Ionicons name="location-outline" size={48} color="#9ca3af" />
                                                    <Text style={{ fontFamily: 'Poppins-Medium', marginTop: 8 }} className="text-gray-500 text-center">No venues found</Text>
                                                </View>
                                            )}
                                        </LinearGradient>
                                    </Animated.View>
                                </>
                            ) : (
                                <Animated.View
                                    className="mx-6 my-7 overflow-hidden rounded-2xl shadow-lg"
                                    style={{
                                        opacity: cardAnimations.available.opacity,
                                        transform: [{ translateY: cardAnimations.available.translateY }]
                                    }}
                                >
                                    <LinearGradient
                                        colors={frostedGlassStyle.colors}
                                        className="p-8 backdrop-blur-md items-center"
                                    >
                                        <Ionicons name="hourglass-outline" size={80} color="#10b68d" />
                                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 24 }} className="text-gray-800 text-center mt-6 mb-2">Coming Soon!</Text>
                                        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16, lineHeight: 24 }} className="text-gray-700 text-center mb-4">
                                            We're working hard to bring {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} venues to MatchVerse.
                                        </Text>
                                        <Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }} className="text-gray-600 text-base text-center">
                                            In the meantime, try Badminton venues to find your perfect match location.
                                        </Text>
                                        <GradientButton
                                            onPress={() => selectSport('badminton')}
                                            text="Try Badminton Venues"
                                            className="mt-6"
                                        />
                                    </LinearGradient>
                                </Animated.View>
                            )}
                        </Animated.View>
                    </Animated.View>
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
}