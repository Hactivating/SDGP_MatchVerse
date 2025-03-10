// app/(auth)/login.tsx
import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
    const router = useRouter();

    const navigateToRegister = () => {
        router.push('/(auth)/register');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 p-6">
                        {/* Logo & Header */}
                        <View className="items-center justify-center py-10">
                            {/* You can replace this with your actual logo */}
                            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
                                <Text className="text-white text-3xl font-bold">MV</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-800">MatchVerse</Text>
                            <Text className="text-gray-500 text-center mt-2">
                                Sign in to find and book your perfect venue
                            </Text>
                        </View>

                        {/* Login Form */}
                        <LoginForm onNavigateToRegister={navigateToRegister} />

                        {/* Footer */}
                        <View className="mt-6 items-center">
                            <Text className="text-gray-500 text-sm">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}