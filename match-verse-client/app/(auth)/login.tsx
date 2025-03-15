// app/(auth)/login.tsx
import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Image,
    SafeAreaView,
    ImageBackground,
    Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LoginForm } from '@/components/auth/LoginForm';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';


export default function Login() {
    const router = useRouter();
    const screenWidth = Dimensions.get('window').width;

    // Calculate logo size based on screen width
    const logoWidth = screenWidth * 0.9; // 90% of screen width

    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    const navigateToRegister = () => {
        router.push('/(auth)/register');
    };

    if (!fontsLoaded) {
        return null; // Return null or a loading indicator while fonts load
    }

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            {/* Background Image with Gradient Overlay */}
            <ImageBackground
                source={require('@/assets/images/Futsal Court Wallpaper.jpg')}
                className="absolute w-full h-full"
                resizeMode="cover"
                imageStyle={{
                    width: '100%',
                    height: '100%'
                }}
            >
                <LinearGradient
                    colors={[
                        'rgba(0, 0, 0, 0.7)',
                        'rgba(0, 0, 0, 0.5)',
                        'rgba(0, 0, 0, 0.3)',
                        'rgba(0, 0, 0, 0.1)',
                        'rgba(0, 0, 0, 0)'
                    ]}
                    locations={[0, 0.3, 0.6, 0.8, 1]}
                    className="absolute w-full h-full"
                />
            </ImageBackground>

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    className="flex-1 z-10"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    {/* Main container with more space above login card */}
                    <View className="flex-1 p-2 justify-between" style={{ paddingTop: 4 }}>
                        {/* Logo and tagline section */}
                        <View className="items-center justify-center">
                            {/* Logo with minimum bottom spacing */}
                            <Image
                                source={require('@/assets/images/login.png')}
                                style={{ width: logoWidth, height: logoWidth * 0.56, marginBottom: -12}}
                                resizeMode="contain"
                            />

                            <View className="flex-row items-center justify-center mb-2">
                                <View className="items-center mx-2">
                                    <View className="bg-green-500 w-7 h-7 rounded-full items-center justify-center">
                                        <Text style={{ fontFamily: 'Poppins-Bold', color: 'white' }}>1</Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontFamily: 'Poppins-Bold',
                                            fontSize: 12,
                                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                            textShadowOffset: {width: 0, height: 1},
                                            textShadowRadius: 2,
                                        }}
                                        className="text-white text-center mt-1"
                                    >
                                        Book your Court
                                    </Text>
                                </View>

                                <View className="h-0.5 w-4 bg-white opacity-50 mx-1" />

                                <View className="items-center mx-2">
                                    <View className="bg-green-500 w-7 h-7 rounded-full items-center justify-center">
                                        <Text style={{ fontFamily: 'Poppins-Bold', color: 'white' }}>2</Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontFamily: 'Poppins-Bold',
                                            fontSize: 12,
                                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                            textShadowOffset: {width: 0, height: 1},
                                            textShadowRadius: 2,
                                        }}
                                        className="text-white text-center mt-1"
                                    >
                                        Join a Team
                                    </Text>
                                </View>

                                <View className="h-0.5 w-4 bg-white opacity-50 mx-1" />

                                <View className="items-center mx-2">
                                    <View className="bg-green-500 w-7 h-7 rounded-full items-center justify-center">
                                        <Text style={{ fontFamily: 'Poppins-Bold', color: 'white' }}>3</Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontFamily: 'Poppins-Bold',
                                            fontSize: 12,
                                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                            textShadowOffset: {width: 0, height: 1},
                                            textShadowRadius: 2,
                                        }}
                                        className="text-white text-center mt-1"
                                    >
                                        Challenge Others
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Login section with more space at top */}
                        <View className="pb-4" style={{ marginTop: 20 }}>
                            {/* Login Card - Lengthier */}
                            <View className="bg-white bg-opacity-60 backdrop-blur-md rounded-3xl shadow-lg p-6 mx-6">
                                {/* Welcome text with more vertical space */}
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 22 }} className="text-gray-800 mb-5 text-center">
                                    Welcome Back
                                </Text>

                                {/* Login Form */}
                                <LoginForm onNavigateToRegister={navigateToRegister} />

                                {/* Additional space at bottom of card */}
                                <View className="h-2"></View>
                            </View>

                            {/* Footer with transparent background */}
                            <View className="mt-3 items-center mx-4">
                                <Text style={{
                                    fontFamily: 'Poppins-Regular',
                                    fontSize: 11, // Smaller font size for terms text
                                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: 0, height: 1},
                                    textShadowRadius: 2
                                }} className="text-white text-center">
                                    By continuing, you agree to our Terms of Service and Privacy Policy
                                </Text>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}