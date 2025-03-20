// app/(app)/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/services/user';
import { User } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { state, logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

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

            Alert.alert('Success', 'Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
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
    };

    useEffect(() => {
        if (user) {
            setEditedUsername(user.username);
            setEditedEmail(user.email);
        }
    }, [user]);

    if (!fontsLoaded) {
        return null; // Return null or a loading indicator while fonts load
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <LinearGradient
                    colors={['#10b68d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1">
                <LinearGradient
                    colors={['#10b68d', '#046d64']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <View className="flex-1 justify-center items-center p-6">
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-center mb-6">{error}</Text>
                    <TouchableOpacity
                        className="bg-white py-3 px-6 rounded-xl shadow-md"
                        onPress={logout}
                    >
                        <Text style={{ fontFamily: 'Poppins-Bold', color: '#046d64' }}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1">
            <LinearGradient
                colors={['#10b68d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 180 }}
            />
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 100 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="pt-8 px-6 pb-5">
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-3xl">Profile</Text>
                            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white text-base opacity-80">Your account information</Text>
                        </View>

                        <View className="bg-white mx-6 p-6 rounded-3xl shadow-lg -mt-3">
                            {!isEditing ? (
                                <>
                                    <View className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10b68d] to-[#046d64] items-center justify-center mb-4 self-center shadow-md">
                                        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-3xl">
                                            {user?.username.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-xl text-gray-800 text-center">{user?.username || 'User'}</Text>
                                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-center mb-4">{user?.email || 'No email'}</Text>

                                    <TouchableOpacity
                                        onPress={() => setIsEditing(true)}
                                        className="mt-2 bg-[#046d64] p-3 rounded-xl self-center px-6 shadow-sm"
                                    >
                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white">Edit Profile</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-xl text-gray-800 mb-4 text-center">Edit Profile</Text>
                                    <View className="w-full">
                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 mb-1">Username</Text>
                                        <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4">
                                            <Ionicons name="person-outline" size={20} color="#666" />
                                            <TextInput
                                                style={{ fontFamily: 'Poppins-Regular', flex: 1, marginLeft: 8 }}
                                                value={editedUsername}
                                                onChangeText={setEditedUsername}
                                                placeholder="Enter username"
                                            />
                                        </View>

                                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 mb-1">Email</Text>
                                        <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-6">
                                            <Ionicons name="mail-outline" size={20} color="#666" />
                                            <TextInput
                                                style={{ fontFamily: 'Poppins-Regular', flex: 1, marginLeft: 8 }}
                                                value={editedEmail}
                                                onChangeText={setEditedEmail}
                                                placeholder="Enter email"
                                                keyboardType="email-address"
                                            />
                                        </View>

                                        <View className="flex-row justify-between">
                                            <TouchableOpacity
                                                onPress={handleCancelEdit}
                                                className="bg-gray-200 p-3 rounded-xl flex-1 mr-2"
                                            >
                                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-center text-gray-700">Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={handleSaveProfile}
                                                disabled={isUpdating}
                                                style={{ backgroundColor: '#046d64' }}
                                                className={`p-3 rounded-xl flex-1 ml-2 ${isUpdating ? 'opacity-50' : ''}`}
                                            >
                                                {isUpdating ? (
                                                    <ActivityIndicator color="white" />
                                                ) : (
                                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-center">Save</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>

                        <View className="bg-white mx-6 mt-5 p-6 rounded-3xl shadow-lg mb-6">
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-xl text-gray-800 mb-4">Stats</Text>
                            <View className="flex-row justify-around">
                                <View className="items-center">
                                    <Text style={{ fontFamily: 'Poppins-Bold', color: '#10b68d' }} className="text-2xl">{user?.experience || 0}</Text>
                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600">Experience</Text>
                                </View>
                                <View className="items-center">
                                    <Text style={{ fontFamily: 'Poppins-Bold', color: '#10b68d' }} className="text-2xl">{user?.rating || 0}</Text>
                                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600">Rating</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-white border border-red-500 mx-6 p-4 rounded-xl items-center mb-6"
                            onPress={logout}
                        >
                            <Text style={{ fontFamily: 'Poppins-Bold', color: '#ff3b30' }}>Logout</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}