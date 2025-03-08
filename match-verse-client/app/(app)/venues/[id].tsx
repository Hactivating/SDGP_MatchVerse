// app/(app)/venues/[id].tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VenueDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const goBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-[#121212]">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="p-5">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-[rgba(74,222,128,0.2)] items-center justify-center mb-4"
                    onPress={goBack}
                >
                    <Ionicons name="arrow-back" size={24} color="#4ade80" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center p-5">
                <Text className="text-white text-2xl font-bold mb-4">Venue Details</Text>
                <Text className="text-[#aaa] text-center">Venue ID: {id}</Text>
                <Text className="text-[#aaa] text-center mt-4">This screen is under development</Text>
            </View>
        </SafeAreaView>
    );
}