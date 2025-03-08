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
            const userData: CreateUserPayload = {
                username,
                email,
                password
            };
            await register(userData);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Please try again with different credentials');
            clearError();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="w-full">
            {/* Username */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">Username</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput
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
                <Text className="text-gray-700 mb-2">Email</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <TextInput
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
                <Text className="text-gray-700 mb-2">Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <TextInput
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
                <Text className="text-gray-700 mb-2">Confirm Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <TextInput
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
                className="bg-primary py-4 rounded-xl items-center mb-6"
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-base">Create Account</Text>
                )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-0.5 bg-gray-200" />
                <Text className="mx-4 text-gray-500 text-sm">OR</Text>
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
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                    <Text className="text-primary font-bold">Sign In</Text>
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
// // components/auth/RegisterForm.tsx
// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     ActivityIndicator,
//     TouchableWithoutFeedback,
//     Keyboard
// } from 'react-native';
// import { useAuth } from '@/hooks/useAuth';
// import { Ionicons } from '@expo/vector-icons';
//
// type RegisterFormProps = {
//     onNavigateToLogin: () => void;
// };
//
// export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateToLogin }) => {
//     const { register, state } = useAuth();
//     const [username, setUsername] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//
//     const validateForm = () => {
//         const errors: Record<string, string> = {};
//
//         if (!username.trim()) {
//             errors.username = 'Username is required';
//         }
//
//         if (!email.trim()) {
//             errors.email = 'Email is required';
//         } else if (!/\S+@\S+\.\S+/.test(email)) {
//             errors.email = 'Email is invalid';
//         }
//
//         if (!password) {
//             errors.password = 'Password is required';
//         } else if (password.length < 6) {
//             errors.password = 'Password must be at least 6 characters';
//         }
//
//         if (password !== confirmPassword) {
//             errors.confirmPassword = 'Passwords do not match';
//         }
//
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };
//
//     const handleRegister = async () => {
//         if (!validateForm()) {
//             return;
//         }
//
//         await register({ username, email, password });
//         // Navigate to login after successful registration
//         if (!state.error) {
//             onNavigateToLogin();
//         }
//     };
//
//     return (
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View>
//                 {state.error && (
//                     <View className="bg-red-100 p-4 rounded-lg mb-4">
//                         <Text className="text-red-500 text-center">{state.error}</Text>
//                     </View>
//                 )}
//
//                 {/* Username */}
//                 <View className="mb-4">
//                     <Text className="text-gray-700 text-base mb-2 font-medium">Username</Text>
//                     <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
//                         <Ionicons name="person-outline" size={20} color="#666" />
//                         <TextInput
//                             className="flex-1 py-3 px-2 text-base"
//                             value={username}
//                             onChangeText={setUsername}
//                             placeholder="Choose a username"
//                             autoCapitalize="none"
//                             placeholderTextColor="#999"
//                         />
//                     </View>
//                     {formErrors.username &&
//                         <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.username}</Text>
//                     }
//                 </View>
//
//                 {/* Email */}
//                 <View className="mb-4">
//                     <Text className="text-gray-700 text-base mb-2 font-medium">Email</Text>
//                     <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
//                         <Ionicons name="mail-outline" size={20} color="#666" />
//                         <TextInput
//                             className="flex-1 py-3 px-2 text-base"
//                             value={email}
//                             onChangeText={setEmail}
//                             placeholder="Enter your email"
//                             keyboardType="email-address"
//                             autoCapitalize="none"
//                             placeholderTextColor="#999"
//                         />
//                     </View>
//                     {formErrors.email &&
//                         <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.email}</Text>
//                     }
//                 </View>
//
//                 {/* Password */}
//                 <View className="mb-4">
//                     <Text className="text-gray-700 text-base mb-2 font-medium">Password</Text>
//                     <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
//                         <Ionicons name="lock-closed-outline" size={20} color="#666" />
//                         <TextInput
//                             className="flex-1 py-3 px-2 text-base"
//                             value={password}
//                             onChangeText={setPassword}
//                             placeholder="Create a password"
//                             secureTextEntry={!showPassword}
//                             placeholderTextColor="#999"
//                         />
//                         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                             <Ionicons
//                                 name={showPassword ? "eye-off-outline" : "eye-outline"}
//                                 size={20}
//                                 color="#666"
//                             />
//                         </TouchableOpacity>
//                     </View>
//                     {formErrors.password &&
//                         <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.password}</Text>
//                     }
//                 </View>
//
//                 {/* Confirm Password */}
//                 <View className="mb-6">
//                     <Text className="text-gray-700 text-base mb-2 font-medium">Confirm Password</Text>
//                     <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
//                         <Ionicons name="lock-closed-outline" size={20} color="#666" />
//                         <TextInput
//                             className="flex-1 py-3 px-2 text-base"
//                             value={confirmPassword}
//                             onChangeText={setConfirmPassword}
//                             placeholder="Confirm your password"
//                             secureTextEntry={!showConfirmPassword}
//                             placeholderTextColor="#999"
//                         />
//                         <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
//                             <Ionicons
//                                 name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
//                                 size={20}
//                                 color="#666"
//                             />
//                         </TouchableOpacity>
//                     </View>
//                     {formErrors.confirmPassword &&
//                         <Text className="text-red-500 text-xs mt-1 ml-1">{formErrors.confirmPassword}</Text>
//                     }
//                 </View>
//
//                 {/* Register Button */}
//                 <TouchableOpacity
//                     className="bg-primary py-4 rounded-lg items-center shadow"
//                     onPress={handleRegister}
//                     disabled={state.isLoading}
//                 >
//                     {state.isLoading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text className="text-white font-bold text-base">Create Account</Text>
//                     )}
//                 </TouchableOpacity>
//
//                 {/* Login Link */}
//                 <View className="flex-row justify-center mt-8">
//                     <Text className="text-gray-600">Already have an account? </Text>
//                     <TouchableOpacity onPress={onNavigateToLogin}>
//                         <Text className="text-primary font-medium">Sign In</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </TouchableWithoutFeedback>
//     );
// };