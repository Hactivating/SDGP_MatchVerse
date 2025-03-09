// app/(app)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Navbar from '../../components/Navbar';
import React from 'react';

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
        <View className="flex-1 bg-[#121212]">
            {/* Content area with padding at bottom to avoid navbar overlap */}
            <View className="flex-1 pb-24">
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#121212' }
                    }}
                />
            </View>

            {/* Fixed navbar at the bottom */}
            <Navbar />
        </View>
    );
}