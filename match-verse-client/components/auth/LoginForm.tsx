// components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { UserType } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

type LoginFormProps = {
    onNavigateToRegister: () => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({ onNavigateToRegister }) => {
    const { login, googleAuth, state } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<UserType>('user');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            // Show validation error
            return;
        }

        await login({ email, password, type: userType });
    };

    const handleGoogleLogin = async () => {
        await googleAuth();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                {state.error && (
                    <View className="bg-red-100 p-4 rounded-lg mb-4">
                        <Text className="text-red-500 text-center">{state.error}</Text>
                    </View>
                )}

                {/* User Type Selector */}
                <View className="flex-row mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${userType === 'user' ? 'bg-primary' : 'bg-gray-100'}`}
                        onPress={() => setUserType('user')}
                    >
                        <Text className={`font-medium ${userType === 'user' ? 'text-white' : 'text-gray-700'}`}>
                            User
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${userType === 'venue' ? 'bg-primary' : 'bg-gray-100'}`}
                        onPress={() => setUserType('venue')}
                    >
                        <Text className={`font-medium ${userType === 'venue' ? 'text-white' : 'text-gray-700'}`}>
                            Venue
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-gray-700 text-base mb-2 font-medium">Email</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                        <Ionicons name="mail-outline" size={20} color="#666" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-base"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {/* Password */}
                <View className="mb-6">
                    <Text className="text-gray-700 text-base mb-2 font-medium">Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                        <Ionicons name="lock-closed-outline" size={20} color="#666" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-base"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#999"
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

                {/* Login Button */}
                <TouchableOpacity
                    className="bg-primary py-4 rounded-lg items-center shadow"
                    onPress={handleLogin}
                    disabled={state.isLoading}
                >
                    {state.isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-base">Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity className="mt-4 items-center">
                    <Text className="text-primary font-medium">Forgot Password?</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-6">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-4 text-gray-500">OR</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Google Sign In */}
                <TouchableOpacity
                    className="flex-row bg-white border border-gray-300 py-3 rounded-lg items-center justify-center shadow-sm"
                    onPress={handleGoogleLogin}
                    disabled={state.isLoading}
                >
                    {/* Replace with actual Google icon */}
                    <View className="w-5 h-5 bg-blue-500 rounded-sm mr-3" />
                    <Text className="text-gray-700 font-medium text-base">Continue with Google</Text>
                </TouchableOpacity>

                {/* Register Link */}
                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-600">Don't have an account? </Text>
                    <TouchableOpacity onPress={onNavigateToRegister}>
                        <Text className="text-primary font-medium">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};