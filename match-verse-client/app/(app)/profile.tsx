// app/(app)/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/services/user';
import { User } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { state, logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="pt-14 px-6 pb-5 bg-[#22c55e]">
                    <Text className="text-white text-3xl font-bold">Profile</Text>
                    <Text className="text-white text-base opacity-80">Your account information</Text>
                </View>

                <View className="bg-white m-6 p-6 rounded-xl shadow-md items-center -mt-3">
                    <View className="w-20 h-20 rounded-full bg-[#22c55e] items-center justify-center mb-4">
                        <Text className="text-white text-3xl font-bold">
                            {user?.username.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-800">{user?.username || 'User'}</Text>
                    <Text className="text-gray-500">{user?.email || 'No email'}</Text>
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
        </SafeAreaView>
    );
}