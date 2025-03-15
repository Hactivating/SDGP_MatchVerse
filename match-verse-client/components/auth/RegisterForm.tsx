// components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { CreateUserPayload } from '@/types/auth';

interface RegisterFormProps {
    onNavigateToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, state, clearError } = useAuth();

    const handleRegister = async () => {
        // Form validation
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Starting registration process...');
            const userData: CreateUserPayload = {
                username,
                email,
                password
            };

            console.log('Sending user data:', { ...userData, password: '****' });
            await register(userData);
            console.log('Registration completed successfully');
        } catch (error: any) {
            console.error('Registration failed with error:', error);
            Alert.alert(
                'Registration Failed',
                error.message || 'Please try again with different credentials',
                [{ text: 'OK', onPress: () => clearError() }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="w-full">
            {/* Username */}
            <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800 mb-2">Username</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white bg-opacity-50">
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput
                        style={{ fontFamily: 'Poppins-Regular' }}
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Create a username"
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {/* Email */}
            <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800 mb-2">Email</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white bg-opacity-50">
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <TextInput
                        style={{ fontFamily: 'Poppins-Regular' }}
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
            </View>

            {/* Password */}
            <View className="mb-4">
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800 mb-2">Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white bg-opacity-50">
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <TextInput
                        style={{ fontFamily: 'Poppins-Regular' }}
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Create a password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-800 mb-2">Confirm Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white bg-opacity-50">
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <TextInput
                        style={{ fontFamily: 'Poppins-Regular' }}
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                    />
                </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
                className="bg-[#22c55e] py-4 rounded-xl items-center mb-6 shadow-sm"
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Create Account</Text>
                )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-0.5 bg-gray-200" />
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="mx-4 text-gray-500 text-sm">OR</Text>
                <View className="flex-1 h-0.5 bg-gray-200" />
            </View>

            {/* Social Register */}
            <View className="flex-row justify-center space-x-4 mb-6">
                <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-300">
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-300">
                    <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-300">
                    <Ionicons name="logo-facebook" size={24} color="#3b5998" />
                </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-4">
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#22c55e]">Sign In</Text>
                </TouchableOpacity>
            </View>

            {/* Error Message */}
            {state.error && (
                <View className="mt-4 p-3 bg-red-100 rounded-lg">
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-red-500 text-center">{state.error}</Text>
                </View>
            )}
        </View>
    );
};