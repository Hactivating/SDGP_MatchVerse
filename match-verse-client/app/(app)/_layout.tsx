import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import Navbar from '../../components/Navbar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AppLayout() {
    const { state } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!state.isAuthenticated && !state.isLoading) {
            router.replace('/(auth)/login');
        }
    }, [state.isAuthenticated, state.isLoading]);

    if (state.isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <StatusBar backgroundColor="#22c55e" barStyle="dark-content" />
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    if (!state.isAuthenticated) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <View className="flex-1 bg-gray-50">
                <StatusBar backgroundColor="#22c55e" barStyle="dark-content" translucent={true} />
                <View className="flex-1">
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: 'white' }
                        }}
                    />
                </View>

                <Navbar />
            </View>
        </SafeAreaProvider>
    );
}