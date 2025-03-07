// app/(auth)/register.tsx
import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function Register() {
    const router = useRouter();

    const navigateToLogin = () => {
        router.push('/(auth)/login');
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
                        <View className="items-center justify-center py-6">
                            <Text className="text-2xl font-bold text-gray-800">Create Account</Text>
                            <Text className="text-gray-500 text-center mt-2">
                                Join MatchVerse to start booking venues
                            </Text>
                        </View>

                        {/* Register Form */}
                        <RegisterForm onNavigateToLogin={navigateToLogin} />

                        {/* Footer */}
                        <View className="mt-6 items-center">
                            <Text className="text-gray-500 text-sm">
                                By signing up, you agree to our Terms of Service and Privacy Policy
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}