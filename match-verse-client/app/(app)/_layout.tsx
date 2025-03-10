// app/(app)/_layout.tsx
import { Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AppLayout() {
    const { state } = useAuth();
    const router = useRouter();

    // Protect app routes by checking authentication
    useEffect(() => {
        if (!state.isAuthenticated && !state.isLoading) {
            router.replace('/(auth)/login');
        }
    }, [state.isAuthenticated, state.isLoading]);

    if (state.isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#121212]">
                <ActivityIndicator size="large" color="#4ade80" />
            </View>
        );
    }

    if (!state.isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#121212' }
            }}
        />
    );
}