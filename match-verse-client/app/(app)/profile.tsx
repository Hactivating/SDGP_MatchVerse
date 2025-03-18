// app/(app)/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, updateUser } from '@/services/user';
import { User } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#121212]">
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-[#121212]">
                <View className="flex-1 justify-center items-center p-6">
                    <Text className="text-red-500 text-center mb-6">{error}</Text>
                    <TouchableOpacity
                        className="bg-red-600 py-3 px-6 rounded-lg"
                        onPress={logout}
                    >
                        <Text className="text-white font-medium">Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="pt-14 px-6 pb-5 bg-[#22c55e]">
                        <Text className="text-white text-3xl font-bold">Profile</Text>
                        <Text className="text-white text-base opacity-80">Your account information</Text>
                    </View>

                    <View className="bg-white m-6 p-6 rounded-xl shadow-md items-center -mt-3">
                        {!isEditing ? (
                            <>
                                <View className="w-20 h-20 rounded-full bg-[#22c55e] items-center justify-center mb-4">
                                    <Text className="text-white text-3xl font-bold">
                                        {user?.username.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                                <Text className="text-xl font-bold text-gray-800">{user?.username || 'User'}</Text>
                                <Text className="text-gray-500">{user?.email || 'No email'}</Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-lg font-bold text-gray-800 mb-4">Edit Profile</Text>
                                <View className="w-full">
                                    <Text className="text-gray-600 mb-1">Username</Text>
                                    <TextInput
                                        value={editedUsername}
                                        onChangeText={setEditedUsername}
                                        placeholder="Enter username"
                                        className="border border-gray-300 rounded-lg p-3 mb-4"
                                    />

                                    <Text className="text-gray-600 mb-1">Email</Text>
                                    <TextInput
                                        value={editedEmail}
                                        onChangeText={setEditedEmail}
                                        placeholder="Enter email"
                                        keyboardType="email-address"
                                        className="border border-gray-300 rounded-lg p-3 mb-4"
                                    />

                                    <View className="flex-row justify-between">
                                        <TouchableOpacity
                                            onPress={handleCancelEdit}
                                            className="bg-gray-200 p-3 rounded-lg flex-1 mr-2"
                                        >
                                            <Text className="text-center">Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleSaveProfile}
                                            disabled={isUpdating}
                                            className={`bg-[#22c55e] p-3 rounded-lg flex-1 ml-2 ${isUpdating ? 'opacity-50' : ''}`}
                                        >
                                            {isUpdating ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <Text className="text-white text-center">Save</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}

                        {!isEditing && (
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                className="mt-4 bg-[#22c55e]/10 p-2 rounded-lg"
                            >
                                <Text className="text-[#22c55e]">Edit Profile</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="bg-white mx-6 p-6 rounded-xl shadow-md mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-4">Stats</Text>
                        <View className="flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-[#22c55e]">{user?.experience || 0}</Text>
                                <Text className="text-gray-600">Experience</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-[#22c55e]">{user?.rating || 0}</Text>
                                <Text className="text-gray-600">Rating</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-red-600 mx-6 p-4 rounded-xl items-center mb-6"
                        onPress={logout}
                    >
                        <Text className="text-white font-bold">Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}