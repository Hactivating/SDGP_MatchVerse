// app/(app)/profile.tsx
import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/services/user';
import { User } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

// Enhanced Button Component
const GradientButton = ({ onPress, text, icon, small, disabled, loading }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={() => !disabled && setPressed(true)}
            onPressOut={() => !disabled && setPressed(false)}
            onPress={handlePress}
        >
            <Animated.View
                style={{
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    opacity: disabled ? 0.7 : 1
                }}
            >
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    className={`flex-row ${small ? 'py-2 px-4' : 'py-3 px-5'} rounded-full items-center justify-center shadow-md`}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white">
                                {text}
                            </Text>
                            {icon && <View className="ml-1.5">{icon}</View>}
                        </>
                    )}
                </LinearGradient>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

// Secondary Button Component
const SecondaryButton = ({ onPress, text, icon, small }) => {
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
                className="bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden"
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(240,240,240,0.8)']}
                    className={`flex-row ${small ? 'py-2 px-4' : 'py-3 px-5'} items-center justify-center`}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-700">
                        {text}
                    </Text>
                    {icon && <View className="ml-1.5">{icon}</View>}
                </LinearGradient>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

// Input Field Component
const InputField = ({ icon, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false }) => {
    return (
        <View className="flex-row items-center bg-white backdrop-blur-md border border-[rgba(16,182,141,0.2)] rounded-xl px-4 py-3 shadow-sm overflow-hidden">
            {icon && <View className="mr-2">{icon}</View>}
            <TextInput
                style={{ fontFamily: 'Poppins-Regular', flex: 1 }}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                placeholderTextColor="#9ca3af"
                className="text-gray-800"
            />
        </View>
    );
};

export default function ProfileScreen() {
    const { state, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY] = useState(new Animated.Value(0));

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const headerTitleAnim = useRef(new Animated.Value(0)).current;
    const cardAnimations = useRef({
        profile: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        stats: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        activity: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
        logout: { opacity: new Animated.Value(0), translateY: new Animated.Value(20) }
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

    // Start animations when component mounts
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

        // Staggered animations for cards
        const animateCards = () => {
            const delays = {
                profile: 100,
                stats: 200,
                activity: 300,
                logout: 400
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

    useEffect(() => {
        const fetchUserData = async () => {
            if (!state.user?.userId) return;

            try {
                setLoading(true);
                const userData = await getUserById(state.user.userId);
                setUser(userData);
                setError(null);
            } catch (err) {
                setError('Failed to load user data');
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [state.user?.userId]);

    const handleSaveProfile = async () => {
        if (!user?.userId) return;

        // Basic validation
        if (!editedUsername.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        try {
            setIsUpdating(true);
            const updatedUserData = await updateUser(user.userId, {
                username: editedUsername,
                email: editedEmail
            });

            // Update local state
            setUser(prevUser => prevUser ? { ...prevUser, ...updatedUserData } : null);
            setIsEditing(false);

            // Haptic feedback for success
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
            // Haptic feedback for error
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (user) {
            setEditedUsername(user.username);
            setEditedEmail(user.email);
        }
        // Haptic feedback for cancel
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleLogout = () => {
        // Haptic feedback before logout
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: logout,
                    style: "destructive"
                }
            ]
        );
    };

    useEffect(() => {
        if (user) {
            setEditedUsername(user.username);
            setEditedEmail(user.email);
        }
    }, [user]);

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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1">
                <StatusBar style="light" />
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="cloud-offline" size={64} color="white" className="mb-4" />
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-center text-lg mb-8">{error}</Text>
                    <GradientButton
                        text="Try Again"
                        onPress={() => window.location.reload()}
                        icon={<Ionicons name="refresh" size={20} color="white" />}
                    />
                    <TouchableOpacity
                        className="mt-6"
                        onPress={logout}
                    >
                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white">Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            {/* Enhanced Gradient Background */}
            <LinearGradient
                colors={['#10b68d', '#0a8d6d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <Animated.View style={[{ opacity: headerOpacity }, headerTitleStyle]} className="pt-8 px-6 pb-5">
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 28, lineHeight: 34 }} className="text-white">
                                    My Profile
                                </Text>
                                <Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 22 }} className="text-white text-base opacity-90">
                                    Manage your account
                                </Text>
                            </View>
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
                        keyboardShouldPersistTaps="handled"
                    >
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }}
                        >
                            {/* Profile Card */}
                            <Animated.View
                                className="mx-6 overflow-hidden rounded-2xl shadow-lg"
                                style={{
                                    opacity: cardAnimations.profile.opacity,
                                    transform: [{ translateY: cardAnimations.profile.translateY }]
                                }}
                            >
                                <LinearGradient
                                    colors={frostedGlassStyle.colors}
                                    className="p-6 backdrop-blur-md"
                                >
                                    {!isEditing ? (
                                        <>
                                            <View className="items-center">
                                                <View className="w-24 h-24 rounded-full overflow-hidden mb-6 shadow-lg border-2 border-white">
                                                    <LinearGradient
                                                        colors={['#10b68d', '#0a8d6d', '#046d64']}
                                                        className="w-full h-full items-center justify-center"
                                                    >
                                                        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-4xl">
                                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                                        </Text>
                                                    </LinearGradient>
                                                </View>
                                            </View>

                                            <View className="bg-[rgba(16,182,141,0.05)] rounded-xl p-5 border border-[rgba(16,182,141,0.15)] mb-5">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="w-8 h-8 rounded-full bg-[rgba(16,182,141,0.2)] items-center justify-center mr-3">
                                                        <Ionicons name="person" size={18} color="#10b68d" />
                                                    </View>
                                                    <View>
                                                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }} className="text-gray-500">Username</Text>
                                                        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16 }} className="text-gray-800">
                                                            {user?.username || 'User'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View className="flex-row items-center">
                                                    <View className="w-8 h-8 rounded-full bg-[rgba(16,182,141,0.2)] items-center justify-center mr-3">
                                                        <Ionicons name="mail" size={18} color="#10b68d" />
                                                    </View>
                                                    <View>
                                                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }} className="text-gray-500">Email</Text>
                                                        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16 }} className="text-gray-800">
                                                            {user?.email || 'No email'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <GradientButton
                                                text="Edit Profile"
                                                onPress={() => setIsEditing(true)}
                                                small
                                                icon={<Ionicons name="create-outline" size={18} color="white" />}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <View className="items-center mb-5">
                                                <View className="w-24 h-24 rounded-full overflow-hidden mb-3 shadow-lg border-2 border-white">
                                                    <LinearGradient
                                                        colors={['#10b68d', '#0a8d6d', '#046d64']}
                                                        className="w-full h-full items-center justify-center"
                                                    >
                                                        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-4xl">
                                                            {editedUsername?.charAt(0).toUpperCase() || 'U'}
                                                        </Text>
                                                    </LinearGradient>
                                                </View>
                                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }} className="text-gray-800">
                                                    Edit Your Profile
                                                </Text>
                                            </View>

                                            <View className="bg-[rgba(16,182,141,0.05)] rounded-xl p-5 border border-[rgba(16,182,141,0.15)] mb-5">
                                                <View className="mb-4">
                                                    <View className="flex-row items-center mb-2">
                                                        <Ionicons name="person" size={18} color="#10b68d" className="mr-2" />
                                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700">Username</Text>
                                                    </View>
                                                    <InputField
                                                        value={editedUsername}
                                                        onChangeText={setEditedUsername}
                                                        placeholder="Enter username"
                                                    />
                                                </View>

                                                <View>
                                                    <View className="flex-row items-center mb-2">
                                                        <Ionicons name="mail" size={18} color="#10b68d" className="mr-2" />
                                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-700">Email</Text>
                                                    </View>
                                                    <InputField
                                                        value={editedEmail}
                                                        onChangeText={setEditedEmail}
                                                        placeholder="Enter email"
                                                        keyboardType="email-address"
                                                    />
                                                </View>
                                            </View>

                                            <View className="flex-row justify-between mt-2">
                                                <View className="flex-1 mr-2">
                                                    <SecondaryButton
                                                        text="Cancel"
                                                        onPress={handleCancelEdit}
                                                        icon={<Ionicons name="close-outline" size={18} color="#6b7280" />}
                                                        small
                                                    />
                                                </View>
                                                <View className="flex-1 ml-2">
                                                    <GradientButton
                                                        text="Save"
                                                        onPress={handleSaveProfile}
                                                        disabled={isUpdating}
                                                        loading={isUpdating}
                                                        small
                                                    />
                                                </View>
                                            </View>
                                        </>
                                    )}
                                </LinearGradient>
                            </Animated.View>

                            {/* Stats Card */}
                            <Animated.View
                                className="mx-6 mt-7 overflow-hidden rounded-2xl shadow-lg"
                                style={{
                                    opacity: cardAnimations.stats.opacity,
                                    transform: [{ translateY: cardAnimations.stats.translateY }]
                                }}
                            >
                                <LinearGradient
                                    colors={frostedGlassStyle.colors}
                                    className="p-6 backdrop-blur-md"
                                >
                                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 mb-4">
                                        Your Stats
                                    </Text>

                                    <View className="flex-row justify-around">
                                        <View className="items-center bg-[rgba(16,182,141,0.1)] p-4 rounded-xl shadow-sm">
                                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 24, color: '#10b68d' }}>
                                                {user?.experience || 0}
                                            </Text>
                                            <Text style={{ fontFamily: 'Poppins-Medium', color: '#4b5563' }}>
                                                Experience
                                            </Text>
                                        </View>

                                        <View className="items-center bg-[rgba(16,182,141,0.1)] p-4 rounded-xl shadow-sm">
                                            <View className="flex-row items-center">
                                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 24, color: '#10b68d' }}>
                                                    {user?.rating || 0}
                                                </Text>
                                                <Ionicons name="star" size={16} color="#FFD700" style={{ marginLeft: 2, marginTop: 4 }} />
                                            </View>
                                            <Text style={{ fontFamily: 'Poppins-Medium', color: '#4b5563' }}>
                                                Rating
                                            </Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Animated.View>

                            {/* Activity Card */}
                            <Animated.View
                                className="mx-6 mt-7 overflow-hidden rounded-2xl shadow-lg"
                                style={{
                                    opacity: cardAnimations.activity.opacity,
                                    transform: [{ translateY: cardAnimations.activity.translateY }]
                                }}
                            >
                                <LinearGradient
                                    colors={frostedGlassStyle.colors}
                                    className="p-6 backdrop-blur-md"
                                >
                                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20 }} className="text-gray-800 mb-4">
                                        Recent Activity
                                    </Text>

                                    <View className="bg-[rgba(16,182,141,0.05)] p-4 rounded-xl border border-[rgba(16,182,141,0.2)] mb-3">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 rounded-full bg-[rgba(16,182,141,0.2)] items-center justify-center mr-3">
                                                <Ionicons name="tennis" size={20} color="#10b68d" />
                                            </View>
                                            <View>
                                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800">Joined Badminton Match</Text>
                                                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }} className="text-gray-500">Yesterday at 5:30 PM</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="bg-[rgba(16,182,141,0.05)] p-4 rounded-xl border border-[rgba(16,182,141,0.2)]">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 rounded-full bg-[rgba(16,182,141,0.2)] items-center justify-center mr-3">
                                                <Ionicons name="star" size={20} color="#10b68d" />
                                            </View>
                                            <View>
                                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800">Received 5-star Rating</Text>
                                                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }} className="text-gray-500">3 days ago</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        className="flex-row items-center justify-center mt-4"
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-[#10b68d] mr-1">View All Activity</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#10b68d" />
                                    </TouchableOpacity>
                                </LinearGradient>
                            </Animated.View>

                            {/* Logout Button */}
                            <Animated.View
                                className="mx-6 mt-7 overflow-hidden rounded-2xl shadow-lg"
                                style={{
                                    opacity: cardAnimations.logout.opacity,
                                    transform: [{ translateY: cardAnimations.logout.translateY }]
                                }}
                            >
                                <TouchableWithoutFeedback onPress={handleLogout}>
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.9)', 'rgba(255,220,220,0.7)']}
                                        className="p-4 backdrop-blur-md rounded-2xl"
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <Ionicons name="log-out-outline" size={20} color="#f43f5e" className="mr-2" />
                                            <Text style={{ fontFamily: 'Poppins-Bold', color: '#f43f5e' }}>
                                                Logout
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableWithoutFeedback>
                            </Animated.View>
                        </Animated.View>
                    </Animated.ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}