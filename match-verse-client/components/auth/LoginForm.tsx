// components/auth/LoginForm.tsx
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
import { LoginCredentials } from '@/types/auth';

interface LoginFormProps {
    onNavigateToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, state, clearError } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const credentials: LoginCredentials = { email, password };
            await login(credentials);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Please check your credentials');
            clearError();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            console.log("Using demo account...");
            // Use demo credentials
            const demoCredentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password'
            };

            // For debugging, show what credentials we're using
            console.log("Demo credentials:", demoCredentials);

            const result = await login(demoCredentials);
            console.log("Demo login result:", result);
        } catch (error: any) {
            console.error("Demo login error:", error);
            Alert.alert(
                'Demo Login Failed',
                `Error: ${error.message || 'Unknown error occurred'}. Please try again.`
            );
            clearError();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="w-full">
            {/* Email */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">Email or Username</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your email or username"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
            </View>

            {/* Password */}
            <View className="mb-6">
                <Text className="text-gray-700 mb-2">Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your password"
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
                <TouchableOpacity className="self-end mt-2">
                    <Text className="text-primary text-sm">Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
                className="bg-primary py-4 rounded-xl items-center mb-4"
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-base">Sign In</Text>
                )}
            </TouchableOpacity>

            {/* Demo Account Button */}
            <TouchableOpacity
                className="bg-gray-200 py-4 rounded-xl items-center mb-6"
                onPress={handleDemoLogin}
                disabled={isLoading}
            >
                <Text className="text-gray-800 font-bold text-base">Use Demo Account</Text>
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
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
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
                    <Text className="text-primary font-bold">Sign Up</Text>
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

// // components/auth/LoginForm.tsx
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
// import { UserType } from '@/types/auth';
// import { useAuth } from '@/hooks/useAuth';
// import { Ionicons } from '@expo/vector-icons';
//
// type LoginFormProps = {
//     onNavigateToRegister: () => void;
// };
//
// export const LoginForm: React.FC<LoginFormProps> = ({ onNavigateToRegister }) => {
//     const { login, googleAuth, state } = useAuth();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [userType, setUserType] = useState<UserType>('user');
//     const [showPassword, setShowPassword] = useState(false);
//
//     const handleLogin = async () => {
//         if (!email || !password) {
//             // Show validation error
//             return;
//         }
//
//         await login({ email, password, type: userType });
//     };
//
//     const handleGoogleLogin = async () => {
//         await googleAuth();
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
//                 {/* User Type Selector */}
//                 <View className="flex-row mb-6 rounded-lg overflow-hidden border border-gray-200">
//                     <TouchableOpacity
//                         className={`flex-1 py-3 items-center ${userType === 'user' ? 'bg-primary' : 'bg-gray-100'}`}
//                         onPress={() => setUserType('user')}
//                     >
//                         <Text className={`font-medium ${userType === 'user' ? 'text-white' : 'text-gray-700'}`}>
//                             User
//                         </Text>
//                     </TouchableOpacity>
//
//                     <TouchableOpacity
//                         className={`flex-1 py-3 items-center ${userType === 'venue' ? 'bg-primary' : 'bg-gray-100'}`}
//                         onPress={() => setUserType('venue')}
//                     >
//                         <Text className={`font-medium ${userType === 'venue' ? 'text-white' : 'text-gray-700'}`}>
//                             Venue
//                         </Text>
//                     </TouchableOpacity>
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
//                 </View>
//
//                 {/* Password */}
//                 <View className="mb-6">
//                     <Text className="text-gray-700 text-base mb-2 font-medium">Password</Text>
//                     <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
//                         <Ionicons name="lock-closed-outline" size={20} color="#666" />
//                         <TextInput
//                             className="flex-1 py-3 px-2 text-base"
//                             value={password}
//                             onChangeText={setPassword}
//                             placeholder="Enter your password"
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
//                 </View>
//
//                 {/* Login Button */}
//                 <TouchableOpacity
//                     className="bg-primary py-4 rounded-lg items-center shadow"
//                     onPress={handleLogin}
//                     disabled={state.isLoading}
//                 >
//                     {state.isLoading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text className="text-white font-bold text-base">Sign In</Text>
//                     )}
//                 </TouchableOpacity>
//
//                 {/* Forgot Password */}
//                 <TouchableOpacity className="mt-4 items-center">
//                     <Text className="text-primary font-medium">Forgot Password?</Text>
//                 </TouchableOpacity>
//
//                 {/* Divider */}
//                 <View className="flex-row items-center my-6">
//                     <View className="flex-1 h-px bg-gray-300" />
//                     <Text className="mx-4 text-gray-500">OR</Text>
//                     <View className="flex-1 h-px bg-gray-300" />
//                 </View>
//
//                 {/* Google Sign In */}
//                 <TouchableOpacity
//                     className="flex-row bg-white border border-gray-300 py-3 rounded-lg items-center justify-center shadow-sm"
//                     onPress={handleGoogleLogin}
//                     disabled={state.isLoading}
//                 >
//                     {/* Replace with actual Google icon */}
//                     <View className="w-5 h-5 bg-blue-500 rounded-sm mr-3" />
//                     <Text className="text-gray-700 font-medium text-base">Continue with Google</Text>
//                 </TouchableOpacity>
//
//                 {/* Register Link */}
//                 <View className="flex-row justify-center mt-8">
//                     <Text className="text-gray-600">Don't have an account? </Text>
//                     <TouchableOpacity onPress={onNavigateToRegister}>
//                         <Text className="text-primary font-medium">Sign Up</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </TouchableWithoutFeedback>
//     );
// };