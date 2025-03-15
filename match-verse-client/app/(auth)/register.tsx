// app/(auth)/register.tsx
import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ImageBackground,
    ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

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
        <SafeAreaView className="flex-1">
            <StatusBar style="light" />

            {/* Background Image with Gradient Overlay */}
            <ImageBackground
                source={require('@/assets/images/Futsal Court Wallpaper.jpg')}
                className="absolute w-full h-full"
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)', 'rgba(255, 255, 255, 0.9)']}
                    locations={[0, 0.3, 1]}
                    className="absolute w-full h-full"
                />
            </ImageBackground>

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
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-2 mt-2">
                            <TouchableOpacity
                                onPress={navigateToLogin}
                                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                            >
                                <Ionicons name="arrow-back" size={24} color="#22c55e" />
                            </TouchableOpacity>

                            {/* Logo Only (No Text) */}
                            <Image
                                source={require('@/assets/images/MV.png')}
                                className="w-14 h-14"
                                resizeMode="contain"
                            />
                        </View>

                        {/* Title */}
                        <View className="items-center mt-4 mb-4">
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-2xl text-white">Create Account</Text>
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-center mt-1 opacity-90">
                                Join to start finding matches
                            </Text>
                        </View>

                        {/* Register Card - translucent */}
                        <View className="bg-white bg-opacity-75 backdrop-blur-md rounded-3xl shadow-lg p-6 mt-2">
                            {/* Register Form */}
                            <RegisterForm onNavigateToLogin={navigateToLogin} />
                        </View>

                        {/* Footer */}
                        <View className="mt-6 items-center">
                            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white text-sm text-center">
                                By signing up, you agree to our Terms of Service and Privacy Policy
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}