// components/auth/RegisterForm.tsx
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
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

type RegisterFormProps = {
    onNavigateToLogin: () => void;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateToLogin }) => {
    const { register, state } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!username.trim()) {
            errors.username = 'Username is required';
        }

        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email is invalid';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        await register({ username, email, password });
        // Navigate to login after successful registration
        if (!state.error) {
            onNavigateToLogin();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                {state.error && (
                    <View className="bg-red-100 p-4 rounded-lg mb-4">
                        <Text className="text-red-500 text-center">{state.error}</Text>
                    </View>
                )}

                {/* Username */}
                <View className="mb-4">
                    <Text className="text-gray-700 text-base mb-2 font-medium">Username</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                        <Ionicons name="person-outline" size={20} color="#666" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-base"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Choose a username"
                            autoCapitalize="none"
                            placeholderTextColor="#999"
                        />
                    </View>
                    {formErrors.username &&
                        <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.username}</Text>
                    }
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
                    {formErrors.email &&
                        <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.email}</Text>
                    }
                </View>

                {/* Password */}
                <View className="mb-4">
                    <Text className="text-gray-700 text-base mb-2 font-medium">Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                        <Ionicons name="lock-closed-outline" size={20} color="#666" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-base"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
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
                    {formErrors.password &&
                        <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.password}</Text>
                    }
                </View>

                {/* Confirm Password */}
                <View className="mb-6">
                    <Text className="text-gray-700 text-base mb-2 font-medium">Confirm Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                        <Ionicons name="lock-closed-outline" size={20} color="#666" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-base"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry={!showConfirmPassword}
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {formErrors.confirmPassword &&
                        <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.confirmPassword}</Text>
                    }
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    className="bg-primary py-4 rounded-lg items-center shadow"
                    onPress={handleRegister}
                    disabled={state.isLoading}
                >
                    {state.isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-base">Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-600">Already have an account? </Text>
                    <TouchableOpacity onPress={onNavigateToLogin}>
                        <Text className="text-primary font-medium">Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};