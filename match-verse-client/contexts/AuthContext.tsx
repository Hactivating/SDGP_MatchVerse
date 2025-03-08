// contexts/AuthContext.tsx
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';
import { mockLogin, mockRegister, mockGetUserById } from '../services/mockAuth';
import { AuthResponse, LoginCredentials, CreateUserPayload } from '../types/auth';

// Define auth state type
interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    token: string | null;
    userId: number | null;
    userType: string | null;
    username: string | null;
    error: string | null;
}

// Define auth actions
type AuthAction =
    | { type: 'LOGIN_SUCCESS' | 'REGISTER_SUCCESS'; payload: AuthResponse }
    | { type: 'AUTH_ERROR' | 'LOGOUT'; payload: string | null }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_LOADING' };

// Define auth context value type
interface AuthContextValue {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (userData: CreateUserPayload) => Promise<AuthResponse>;
    googleAuth: () => Promise<AuthResponse>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// Define initial state
const initialState: AuthState = {
    isLoading: true,
    isAuthenticated: false,
    token: null,
    userId: null,
    userType: null,
    username: null,
    error: null
};

// Create context
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Define reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                token: action.payload.token,
                userId: action.payload.user.userId,
                userType: action.payload.user.userType || null,
                username: action.payload.user.username,
                error: null
            };
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                token: action.payload.token,
                userId: action.payload.user.userId,
                userType: action.payload.user.userType || null,
                username: action.payload.user.username,
                error: null
            };
        case 'AUTH_ERROR':
        case 'LOGOUT':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                token: null,
                userId: null,
                userType: null,
                username: null,
                error: action.payload
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: true
            };
        default:
            return state;
    }
}

interface AuthProviderProps {
    children: ReactNode;
}

// Create provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load token on startup
    useEffect(() => {
        const loadToken = async () => {
            try {
                console.log("Loading authentication state...");
                const token = await AsyncStorage.getItem('token');
                const userIdStr = await AsyncStorage.getItem('userId');
                const userType = await AsyncStorage.getItem('userType');
                const username = await AsyncStorage.getItem('username');

                console.log("Stored token:", token);
                console.log("Stored userId:", userIdStr);

                if (token && userIdStr) {
                    const userId = parseInt(userIdStr, 10);
                    console.log("Restoring authentication state...");

                    // Set token in axios headers
                    setAuthToken(token);

                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            token,
                            user: {
                                userId,
                                userType: userType || 'player',
                                username: username || 'User',
                                email: '' // Add empty email since it's required by the type
                            }
                        }
                    });
                    console.log("Authentication restored successfully");
                } else {
                    console.log("No stored authentication found");
                    dispatch({ type: 'AUTH_ERROR', payload: null });
                }
            } catch (err) {
                console.error('Error loading auth data:', err);
                dispatch({ type: 'AUTH_ERROR', payload: 'Error loading auth data' });
            }
        };

        loadToken();
    }, []);

    // Login
    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            console.log("Login attempt with:", credentials.email);
            dispatch({ type: 'SET_LOADING' });

            // Use mock login instead of actual API
            const response = await mockLogin(credentials);
            console.log("Login successful for:", response.user.username);

            // Set token in axios headers
            setAuthToken(response.token);

            // Store auth data in AsyncStorage
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('userId', String(response.user.userId));
            await AsyncStorage.setItem('userType', response.user.userType || 'player');
            await AsyncStorage.setItem('username', response.user.username);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: response
            });

            return response;
        } catch (err: any) {
            console.error("Login error:", err.message);
            dispatch({
                type: 'AUTH_ERROR',
                payload: err.message || 'Login failed'
            });
            throw err;
        }
    };

    // Register
    const register = async (userData: CreateUserPayload): Promise<AuthResponse> => {
        try {
            dispatch({ type: 'SET_LOADING' });

            // Use mock register instead of actual API
            const response = await mockRegister(userData);

            // Set token in axios headers
            setAuthToken(response.token);

            // Store auth data in AsyncStorage
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('userId', String(response.user.userId));
            await AsyncStorage.setItem('userType', response.user.userType || 'player');
            await AsyncStorage.setItem('username', response.user.username);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: response
            });

            return response;
        } catch (err: any) {
            dispatch({
                type: 'AUTH_ERROR',
                payload: err.message || 'Registration failed'
            });
            throw err;
        }
    };

    // Google Auth (simplified mock version)
    const googleAuth = async (): Promise<AuthResponse> => {
        try {
            // For mock purposes, we'll just log in as a predefined user
            const mockGoogleResponse: AuthResponse = {
                token: 'google-mock-token',
                user: {
                    userId: 3,
                    username: 'googleuser',
                    email: 'google@example.com',
                    userType: 'player'
                }
            };

            // Set token in axios headers
            setAuthToken(mockGoogleResponse.token);

            // Store auth data in AsyncStorage
            await AsyncStorage.setItem('token', mockGoogleResponse.token);
            await AsyncStorage.setItem('userId', String(mockGoogleResponse.user.userId));
            await AsyncStorage.setItem('userType', mockGoogleResponse.user.userType || 'player');
            await AsyncStorage.setItem('username', mockGoogleResponse.user.username);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: mockGoogleResponse
            });

            return mockGoogleResponse;
        } catch (err: any) {
            dispatch({
                type: 'AUTH_ERROR',
                payload: err.message || 'Google auth failed'
            });
            throw err;
        }
    };

    // Logout
    const logout = async (): Promise<void> => {
        try {
            console.log("Logging out...");
            // Remove token from axios headers
            setAuthToken(null);

            // Remove auth data from AsyncStorage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userType');
            await AsyncStorage.removeItem('username');

            dispatch({ type: 'LOGOUT', payload: null });
            console.log("Logout successful");
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    // Clear error
    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    return (
        <AuthContext.Provider
            value={{
                state,
                login,
                register,
                googleAuth,
                logout,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// // contexts/AuthContext.tsx
// import React, { createContext, useReducer, useEffect } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import { AuthState, LoginCredentials, UserType } from '@/types/auth';
// import { login, googleLogin, register } from '@/services/auth';
//
// // Initial auth state
// const initialState: AuthState = {
//     isAuthenticated: false,
//     isLoading: true,
//     userId: undefined,
//     token: undefined,
//     userType: undefined,
//     error: undefined,
// };
//
// // Define action types
// type AuthAction =
//     | { type: 'LOGIN_REQUEST' }
//     | { type: 'LOGIN_SUCCESS'; payload: { userId: number; token: string; userType: UserType } }
//     | { type: 'LOGIN_FAILURE'; payload: string }
//     | { type: 'REGISTER_REQUEST' }
//     | { type: 'REGISTER_SUCCESS' }
//     | { type: 'REGISTER_FAILURE'; payload: string }
//     | { type: 'LOGOUT' }
//     | { type: 'RESTORE_TOKEN'; payload: { userId: number; token: string; userType: UserType } | null };
//
// // Auth reducer
// const authReducer = (state: AuthState, action: AuthAction): AuthState => {
//     switch (action.type) {
//         case 'LOGIN_REQUEST':
//         case 'REGISTER_REQUEST':
//             return {
//                 ...state,
//                 isLoading: true,
//                 error: undefined,
//             };
//         case 'LOGIN_SUCCESS':
//             return {
//                 ...state,
//                 isLoading: false,
//                 isAuthenticated: true,
//                 userId: action.payload.userId,
//                 token: action.payload.token,
//                 userType: action.payload.userType,
//                 error: undefined,
//             };
//         case 'LOGIN_FAILURE':
//         case 'REGISTER_FAILURE':
//             return {
//                 ...state,
//                 isLoading: false,
//                 error: action.payload,
//             };
//         case 'REGISTER_SUCCESS':
//             return {
//                 ...state,
//                 isLoading: false,
//                 error: undefined,
//             };
//         case 'LOGOUT':
//             return {
//                 ...initialState,
//                 isLoading: false,
//             };
//         case 'RESTORE_TOKEN':
//             return {
//                 ...state,
//                 isLoading: false,
//                 isAuthenticated: action.payload !== null,
//                 userId: action.payload?.userId,
//                 token: action.payload?.token,
//                 userType: action.payload?.userType,
//             };
//         default:
//             return state;
//     }
// };
//
// // Create context
// type AuthContextType = {
//     state: AuthState;
//     login: (credentials: LoginCredentials) => Promise<void>;
//     googleAuth: () => Promise<void>;
//     register: (userData: { email: string; password: string; username: string }) => Promise<void>;
//     logout: () => Promise<void>;
// };
//
// export const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// // Auth provider component
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [state, dispatch] = useReducer(authReducer, initialState);
//
//     // Check if user is already logged in on app start
//     useEffect(() => {
//         const bootstrapAsync = async () => {
//             try {
//                 const authDataStr = await SecureStore.getItemAsync('authData');
//                 if (authDataStr) {
//                     const authData = JSON.parse(authDataStr);
//                     dispatch({
//                         type: 'RESTORE_TOKEN',
//                         payload: {
//                             userId: authData.userId,
//                             token: authData.token,
//                             userType: authData.userType
//                         }
//                     });
//                 } else {
//                     dispatch({ type: 'RESTORE_TOKEN', payload: null });
//                 }
//             } catch (e) {
//                 console.error('Failed to restore authentication state:', e);
//                 dispatch({ type: 'RESTORE_TOKEN', payload: null });
//             }
//         };
//
//         bootstrapAsync();
//     }, []);
//
//     // Login function
//     const handleLogin = async (credentials: LoginCredentials) => {
//         dispatch({ type: 'LOGIN_REQUEST' });
//         try {
//             const response = await login(credentials);
//
//             // Store auth data
//             const authData = {
//                 userId: response.userId,
//                 token: 'token_placeholder', // Replace with actual token when backend provides it
//                 userType: credentials.type,
//             };
//
//             await SecureStore.setItemAsync('authData', JSON.stringify(authData));
//
//             dispatch({
//                 type: 'LOGIN_SUCCESS',
//                 payload: authData
//             });
//         } catch (error) {
//             dispatch({
//                 type: 'LOGIN_FAILURE',
//                 payload: error instanceof Error ? error.message : 'Login failed'
//             });
//         }
//     };
//
//     // Google auth function
//     const handleGoogleAuth = async () => {
//         dispatch({ type: 'LOGIN_REQUEST' });
//         try {
//             const response = await googleLogin();
//
//             // Store auth data
//             const authData = {
//                 userId: response.userId,
//                 token: 'token_placeholder', // Replace with actual token when backend provides it
//                 userType: 'user' as UserType, // Google auth is always for user type
//             };
//
//             await SecureStore.setItemAsync('authData', JSON.stringify(authData));
//
//             dispatch({
//                 type: 'LOGIN_SUCCESS',
//                 payload: authData
//             });
//         } catch (error) {
//             dispatch({
//                 type: 'LOGIN_FAILURE',
//                 payload: error instanceof Error ? error.message : 'Google login failed'
//             });
//         }
//     };
//
//     // Register function
//     const handleRegister = async (userData: { email: string; password: string; username: string }) => {
//         dispatch({ type: 'REGISTER_REQUEST' });
//         try {
//             await register(userData);
//             dispatch({ type: 'REGISTER_SUCCESS' });
//         } catch (error) {
//             dispatch({
//                 type: 'REGISTER_FAILURE',
//                 payload: error instanceof Error ? error.message : 'Registration failed'
//             });
//         }
//     };
//
//     // Logout function
//     const handleLogout = async () => {
//         await SecureStore.deleteItemAsync('authData');
//         dispatch({ type: 'LOGOUT' });
//     };
//
//     return (
//         <AuthContext.Provider
//             value={{
//                 state,
//                 login: handleLogin,
//                 googleAuth: handleGoogleAuth,
//                 register: handleRegister,
//                 logout: handleLogout,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };