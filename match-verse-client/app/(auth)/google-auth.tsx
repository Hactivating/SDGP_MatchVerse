// app/(auth)/google-auth.tsx
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';



export default function GoogleAuthCallback() {
    const { googleAuth } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // The actual token handling is done in the googleAuth function
                await googleAuth();
                // Successful auth will redirect via the AuthContext
            } catch (error) {
                console.error('Google auth callback error:', error);
                // Navigate back to login on error
                router.replace('/(auth)1/login');
            }
        };

        handleCallback();
    }, []);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-base mb-5">Processing Google login...</Text>
            <ActivityIndicator size="large" color="#3498db" className="mt-5" />
        </View>
    );
}