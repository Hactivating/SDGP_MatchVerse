// components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { LoginCredentials } from '@/types/auth';

interface LoginFormProps {
    onNavigateToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onNavigateToRegister }) => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, state, clearError } = useAuth();

    // Function to validate if a string is an email
    const isValidEmail = (text: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    const handleLogin = async () => {
        if (!emailOrUsername || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            // Determine if input is email or username
            const isEmail = isValidEmail(emailOrUsername);
            console.log(`Logging in with ${isEmail ? 'email' : 'username'}: ${emailOrUsername}`);

            // Create credentials based on input type
            let credentials: LoginCredentials;

            if (isEmail) {
                credentials = {
                    email: emailOrUsername,
                    password,
                    type: 'user'
                };
            } else {
                credentials = {
                    username: emailOrUsername,
                    email: '',
                    password,
                    type: 'user'
                };
            }

            await login(credentials);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Please check your credentials');
            clearError();
        }
    };

    return (
        <View className="w-full">
            {/* Email or Username */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Email or Username</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your email or username"
                        placeholderTextColor="#999"
                        value={emailOrUsername}
                        onChangeText={setEmailOrUsername}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />
                </View>
            </View>

            {/* Password */}
            <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium">Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="self-end mt-2">
                    <Text style={{ color: '#046d64' }} className="text-sm font-medium">Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
                style={{ backgroundColor: '#046d64' }}
                className="py-4 rounded-xl items-center mb-4 shadow-sm"
                onPress={handleLogin}
                disabled={state.isLoading}
            >
                {state.isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-base">Sign In</Text>
                )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-0.5 bg-gray-200" />
                <Text className="mx-4 text-gray-500 text-sm">OR</Text>
                <View className="flex-1 h-0.5 bg-gray-200" />
            </View>

            {/* Social Login */}
            <View className="flex-row justify-center space-x-4 mb-6">
                <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-300">
                    {/* Google logo */}
                    <Image
                        source={require('@/assets/images/google-logo.png')}
                        style={{ width: 30, height: 30 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-300">
                    <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-300">
                    <Ionicons name="logo-facebook" size={24} color="#3b5998" />
                </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-4">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateToRegister}>
                    <Text style={{ color: '#046d64' }} className="font-bold">Sign Up</Text>
                </TouchableOpacity>
            </View>

            {/* Error Message */}
            {state.error && (
                <View className="mt-4 p-3 bg-red-100 rounded-lg">
                    <Text className="text-red-500 text-center">{state.error}</Text>
                </View>
            )}
        </View>
    );
};