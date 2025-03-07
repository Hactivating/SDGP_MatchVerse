// app/(app)/home.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function Home() {
    const { logout, state } = useAuth();
    const router = useRouter();

    const navigateToProfile = () => {
        router.push('/(app)/profile');
    };

    return (
        <View className="flex-1 bg-gray-100">
            <View className="bg-primary p-6 pt-12">
                <Text className="text-2xl font-bold text-white">MatchVerse</Text>
                <Text className="text-white text-base opacity-80">Your sports booking platform</Text>
            </View>

            <View className="p-6">
                <View className="bg-white rounded-lg p-6 shadow mb-6">
                    <Text className="text-2xl font-bold mb-2">Welcome Back!</Text>
                    <Text className="text-gray-600 mb-4">
                        You are logged in as a {state.userType || 'user'}.
                    </Text>

                    <TouchableOpacity
                        className="bg-primary py-3 px-4 rounded-lg items-center"
                        onPress={navigateToProfile}>
                        <Text className="text-white font-medium">View Profile</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="bg-danger py-3 px-4 rounded-lg items-center mt-auto"
                    onPress={logout}>
                    <Text className="text-white font-medium">Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}