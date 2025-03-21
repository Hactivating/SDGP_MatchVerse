// app/(app)/leaderboard.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Animated,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../hooks/useAuth';

// Trophy icons for top 3 positions
const MEDALS = {
    0: require('@/assets/images/gold-medal.png'),
    1: require('@/assets/images/silver-medal.png'),
    2: require('@/assets/images/bronze-medal.png'),
};

// Rank tier badges with colors
const RANK_TIERS = {
    'Beginner 01': { color: '#8D99AE', icon: 'shield-outline' },
    'Beginner 02': { color: '#8D99AE', icon: 'shield-outline' },
    'Beginner 03': { color: '#8D99AE', icon: 'shield-outline' },
    'Intermediate 01': { color: '#43AA8B', icon: 'shield-half-outline' },
    'Intermediate 02': { color: '#43AA8B', icon: 'shield-half-outline' },
    'Intermediate 03': { color: '#43AA8B', icon: 'shield-half-outline' },
    'Expert 01': { color: '#F8961E', icon: 'shield' },
    'Expert 02': { color: '#F8961E', icon: 'shield' },
    'Expert 03': { color: '#F94144', icon: 'shield' },
};

// Interface for the leaderboard item data structure
interface LeaderboardItem {
    id: number;
    username: string;
    score: number;
    rank?: string;
    position?: number;
}

export default function LeaderboardScreen() {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [userRankInfo, setUserRankInfo] = useState<{
        position: number;
        totalPlayers: number;
        percentile: number;
    } | null>(null);

    // Animation references
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const headerTitleAnim = useRef(new Animated.Value(0)).current;

    // Cache of animated values for list items to prevent recreation during renders
    const itemAnimations = useRef(new Map()).current;

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    });

    // Animations when component mounts
    useEffect(() => {
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
    }, []);

    // Get animations for a list item, creating if needed
    const getItemAnimations = useCallback((id: number, index: number) => {
        if (!itemAnimations.has(id)) {
            const scale = new Animated.Value(0.9);
            const opacity = new Animated.Value(0);

            // Start animations
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    delay: index * 50,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    delay: index * 50,
                    useNativeDriver: true,
                }),
            ]).start();

            itemAnimations.set(id, { scale, opacity });
        }

        return itemAnimations.get(id);
    }, []);

    // Fetch leaderboard data
    const fetchLeaderboard = useCallback(async () => {
        try {
            setError(null);

            const response = await api.get('/leaderboard');

            // Add position property to each item
            const dataWithPosition = response.data.map((item: LeaderboardItem, index: number) => ({
                ...item,
                position: index + 1
            }));

            setLeaderboardData(dataWithPosition);

            // Calculate user position info if user is logged in
            if (user && user.id) {
                const userIndex = dataWithPosition.findIndex(item => item.id === user.id);
                if (userIndex !== -1) {
                    setUserRankInfo({
                        position: userIndex + 1,
                        totalPlayers: dataWithPosition.length,
                        percentile: Math.round(((dataWithPosition.length - (userIndex + 1)) / dataWithPosition.length) * 100)
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard data. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    // Initial data load
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Handle pull-to-refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Filter selection handler
    const handleFilterChange = useCallback((filter: string) => {
        if (filter === selectedFilter) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedFilter(filter);

        // Here you would implement actual filtering logic
        // For now, we'll just re-fetch the same data
        setLoading(true);
        fetchLeaderboard();
    }, [selectedFilter, fetchLeaderboard]);

    // Get appropriate rank color based on position
    const getRankColor = useCallback((position: number) => {
        if (position === 1) return ['#FFD700', '#FFA000'];
        if (position === 2) return ['#C0C0C0', '#A0A0A0'];
        if (position === 3) return ['#CD7F32', '#8B4513'];
        return ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'];
    }, []);

    // Get rank tier info from rank string
    const getRankTierInfo = useCallback((rank: string) => {
        return RANK_TIERS[rank] || { color: '#8D99AE', icon: 'shield-outline' };
    }, []);

    // User rank card component (memoized)
    const UserRankCard = useCallback(() => {
        if (!user || !userRankInfo) return null;

        const userRankData = leaderboardData.find(item => item.id === user.id);
        if (!userRankData) return null;

        const rankTierInfo = getRankTierInfo(userRankData.rank || 'Beginner 01');

        return (
            <View className="mx-4 mb-6 mt-2">
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    className="rounded-xl p-4 border border-white/10"
                >
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white/80 mb-2">
                        Your Ranking
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-full bg-white/15 items-center justify-center mr-3">
                                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-xl">
                                    #{userRankInfo.position}
                                </Text>
                            </View>

                            <View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-lg">
                                    {userRankData.username}
                                </Text>
                                <View className="flex-row items-center">
                                    {userRankData.rank && (
                                        <>
                                            <Ionicons
                                                name={rankTierInfo.icon as any}
                                                size={14}
                                                color={rankTierInfo.color}
                                            />
                                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white/70 text-xs ml-1">
                                                {userRankData.rank}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>

                        <View className="items-end">
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-lg">
                                {userRankData.score} pts
                            </Text>
                            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs">
                                Top {userRankInfo.percentile}%
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    }, [user, userRankInfo, leaderboardData, getRankTierInfo]);

    // Ranking info card component (memoized)
    const RankingInfoCard = useCallback(() => (
        <View className="mx-4 mb-4">
            <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                className="rounded-xl p-4"
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white">
                        Ranking System
                    </Text>
                    <TouchableOpacity
                        className="p-1"
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <Ionicons name="information-circle-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    <View className="items-center mb-2 w-1/3">
                        <Ionicons name={RANK_TIERS['Beginner 01'].icon as any} size={20} color={RANK_TIERS['Beginner 01'].color} />
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs mt-1">
                            Beginner
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/50 text-xs">
                            0-1500 pts
                        </Text>
                    </View>

                    <View className="items-center mb-2 w-1/3">
                        <Ionicons name={RANK_TIERS['Intermediate 01'].icon as any} size={20} color={RANK_TIERS['Intermediate 01'].color} />
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs mt-1">
                            Intermediate
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/50 text-xs">
                            1500-3000 pts
                        </Text>
                    </View>

                    <View className="items-center mb-2 w-1/3">
                        <Ionicons name={RANK_TIERS['Expert 01'].icon as any} size={20} color={RANK_TIERS['Expert 01'].color} />
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs mt-1">
                            Expert
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/50 text-xs">
                            3000+ pts
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    ), []);

    // List header component (memoized)
    const ListHeaderComponent = useCallback(() => (
        <>
            <UserRankCard />
            <RankingInfoCard />
        </>
    ), [UserRankCard, RankingInfoCard]);

    // Empty state component (memoized)
    const EmptyState = useCallback(() => (
        <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="trophy-outline" size={80} color="rgba(255,255,255,0.2)" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white/70 text-lg text-center mt-4">
                No players found
            </Text>
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/50 text-center mt-2">
                Be the first to claim your spot on the leaderboard!
            </Text>
        </View>
    ), []);

    // Error state component (memoized)
    const ErrorState = useCallback(() => (
        <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="cloud-offline-outline" size={80} color="rgba(255,255,255,0.2)" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white/70 text-lg text-center mt-4">
                {error}
            </Text>
            <TouchableOpacity
                className="bg-white/20 rounded-full px-6 py-3 mt-6"
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setLoading(true);
                    fetchLeaderboard();
                }}
            >
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white">
                    Try Again
                </Text>
            </TouchableOpacity>
        </View>
    ), [error, fetchLeaderboard]);

    // Filter tabs component (memoized)
    const FilterTabs = useCallback(() => (
        <View className="flex-row justify-center mb-3 px-4">
            {['all', 'weekly', 'monthly'].map((filter) => (
                <TouchableOpacity
                    key={filter}
                    onPress={() => handleFilterChange(filter)}
                    className={`mx-2 px-5 py-2 rounded-full ${
                        selectedFilter === filter ? 'bg-white/25' : 'bg-transparent'
                    }`}
                    activeOpacity={0.7}
                >
                    <Text
                        style={{ fontFamily: 'Poppins-Medium' }}
                        className={`${selectedFilter === filter ? 'text-white' : 'text-white/60'}`}
                    >
                        {filter === 'all' ? 'All Time' : filter === 'weekly' ? 'Weekly' : 'Monthly'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    ), [selectedFilter, handleFilterChange]);

    // Pre-generate item render function to avoid recreating on every render
    const renderItem = useCallback(({ item, index }: { item: LeaderboardItem, index: number }) => {
        const isTopThree = index < 3;
        const isFirstPlace = index === 0;
        const isCurrentUser = user && user.id === item.id;

        // Get cached animations for this item
        const animations = getItemAnimations(item.id, index);
        const rankTierInfo = getRankTierInfo(item.rank || '');

        return (
            <Animated.View
                style={{
                    opacity: animations.opacity,
                    transform: [{ scale: animations.scale }],
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    className={`${isTopThree ? 'my-1.5' : 'my-1'} mx-4 overflow-hidden`}
                >
                    <LinearGradient
                        colors={isTopThree
                            ? getRankColor(item.position || index + 1)
                            : isCurrentUser
                                ? ['rgba(16,182,141,0.4)', 'rgba(4,109,100,0.2)']
                                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className={`flex-row items-center p-4 rounded-xl ${isFirstPlace ? 'shadow-lg' : ''} ${isCurrentUser ? 'border border-[#10b68d]/30' : ''}`}
                    >
                        {/* Position indicator */}
                        <View className={`
              ${isTopThree
                            ? 'w-12 h-12 ml-1'
                            : 'w-10 h-10 bg-white/10 rounded-full'} 
              justify-center items-center mr-3
            `}>
                            {isTopThree ? (
                                <Image
                                    source={MEDALS[index]}
                                    className="w-10 h-10"
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-base">
                                    {item.position}
                                </Text>
                            )}
                        </View>

                        {/* Avatar placeholder - can be replaced with actual user avatar */}
                        <View className="w-10 h-10 rounded-full bg-white/15 overflow-hidden mr-3">
                            <View className="w-full h-full items-center justify-center">
                                <Ionicons name="person" size={isTopThree ? 22 : 20} color="white" />
                            </View>
                        </View>

                        {/* Username and rank */}
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text
                                    style={{ fontFamily: isTopThree ? 'Poppins-Bold' : 'Poppins-Medium' }}
                                    className={`text-white ${isTopThree ? 'text-lg' : 'text-base'}`}
                                    numberOfLines={1}
                                >
                                    {item.username}
                                </Text>
                                {isCurrentUser && (
                                    <View className="ml-2 px-2 py-0.5 bg-[#10b68d] rounded-full">
                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-xs">
                                            You
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {item.rank ? (
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name={rankTierInfo.icon as any}
                                        size={12}
                                        color={rankTierInfo.color}
                                    />
                                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs ml-1">
                                        {item.rank}
                                    </Text>
                                </View>
                            ) : isTopThree && (
                                <View className="flex-row items-center">
                                    <Ionicons name="star" size={12} color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} />
                                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs ml-1">
                                        Top Player
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Score badge */}
                        <View className={`
              ${isTopThree
                            ? 'bg-white/25 px-4 py-2'
                            : 'bg-white/15 px-3 py-1.5'} 
              rounded-full
            `}>
                            <Text
                                style={{ fontFamily: isTopThree ? 'Poppins-Bold' : 'Poppins-Medium' }}
                                className="text-white text-center"
                            >
                                {item.score} pts
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    }, [user, getItemAnimations, getRankColor, getRankTierInfo]);

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

    // ListFooterComponent (memoized)
    const ListFooterComponent = useCallback(() => (
        <View className="h-20" />
    ), []);

    // If fonts are not loaded yet, show a loading indicator
    if (!fontsLoaded) {
        return (
            <View className="flex-1 justify-center items-center bg-[#121212]">
                <ActivityIndicator size="large" color="#10b68d" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#121212]">
            <StatusBar style="light" />

            {/* Gradient Background */}
            <LinearGradient
                colors={['#10b68d', '#0a8d6d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView className="flex-1">
                {/* Animated Header */}
                <Animated.View
                    style={[headerTitleStyle]}
                    className="pt-4 pb-2 px-4"
                >
                    <Text
                        style={{ fontFamily: 'Poppins-Bold', fontSize: 28 }}
                        className="text-white text-center"
                    >
                        Leaderboard
                    </Text>
                    <Text
                        style={{ fontFamily: 'Poppins-Regular' }}
                        className="text-white/80 text-center mb-2"
                    >
                        Top players ranked by score
                    </Text>
                </Animated.View>

                {/* Filter tabs */}
                <FilterTabs />

                {/* Leaderboard content */}
                {loading && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : error ? (
                    <ErrorState />
                ) : (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                            flex: 1
                        }}
                    >
                        {/* Trophy decoration for the top section */}
                        <View className="absolute top-1 right-4 opacity-20">
                            <Ionicons name="trophy" size={120} color="#FFD700" />
                        </View>

                        <FlatList
                            data={leaderboardData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 10 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="white"
                                    colors={["white"]}
                                />
                            }
                            ListHeaderComponent={ListHeaderComponent}
                            ListEmptyComponent={EmptyState}
                            ListFooterComponent={ListFooterComponent}
                        />
                    </Animated.View>
                )}
            </SafeAreaView>
        </View>
    );
}