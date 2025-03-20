// app/(auth)/register.tsx
import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
    const router = useRouter();

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    const navigateToLogin = () => {
        router.push('/(auth)/login');
    };

    if (!fontsLoaded) {
        return null; // Return null or a loading indicator while fonts load
    }

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            {/* Gradient Background - matching login page */}
            <LinearGradient
                colors={['#10b68d', '#046d64']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    className="flex-1 z-10"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 p-6">
                            {/* Header - Logo removed */}
                            <View className="flex-row items-center mb-2 mt-2">
                                <TouchableOpacity
                                    onPress={navigateToLogin}
                                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                                >
                                    <Ionicons name="arrow-back" size={24} color="#046d64" />
                                </TouchableOpacity>
                            </View>

                            {/* Title */}
                            <View className="items-center mt-4 mb-4">
                                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-2xl text-white">Create Account</Text>
                                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-center mt-1 opacity-90">
                                    Join to start finding matches
                                </Text>
                            </View>

                            {/* Register Card - translucent with same styling as login */}
                            <View className="bg-white bg-opacity-60 backdrop-blur-md rounded-3xl shadow-lg p-6 mt-2">
                                {/* Register Form */}
                                <RegisterForm onNavigateToLogin={navigateToLogin} />
                            </View>

                            {/* Footer with consistent styling */}
                            <View className="mt-6 items-center">
                                <Text
                                    style={{
                                        fontFamily: 'Poppins-Regular',
                                        fontSize: 11,
                                        textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                        textShadowOffset: {width: 0, height: 1},
                                        textShadowRadius: 2
                                    }}
                                    className="text-white text-center"
                                >
                                    By signing up, you agree to our Terms of Service and Privacy Policy
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}