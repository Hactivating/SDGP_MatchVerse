// app/(app)/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/services/user'; // Updated import
import { User } from '@/types/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { state, logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!state.userId) return;

            try {
                setLoading(true);
                // Use the new getUserById function
                const userData = await getUserById(state.userId);
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
    }, [state.userId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-6">
                <Text className="text-red-500 text-center mb-6">{error}</Text>
                <TouchableOpacity
                    className="bg-danger py-3 px-6 rounded-lg"
                    onPress={logout}
                >
                    <Text className="text-white font-medium">Logout</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="bg-primary p-6 pt-12">
                <Text className="text-2xl font-bold text-white">Profile</Text>
            </View>

            <View className="bg-white m-6 p-6 rounded-lg shadow-md items-center">
                <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
                    <Text className="text-white text-3xl font-bold">
                        {user?.username.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text className="text-xl font-bold">{user?.username || 'User'}</Text>
                <Text className="text-gray-500">{user?.email || 'No email'}</Text>
            </View>

            <View className="bg-white mx-6 p-6 rounded-lg shadow-md mb-6">
                <Text className="text-lg font-bold mb-4">Stats</Text>
                <View className="flex-row justify-around">
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-primary">{user?.experience || 0}</Text>
                        <Text className="text-gray-600">Experience</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-primary">{user?.rating || 0}</Text>
                        <Text className="text-gray-600">Rating</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                className="bg-danger mx-6 p-4 rounded-lg items-center mb-6"
                onPress={logout}
            >
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}