// contexts/AuthContext.tsx
import React, { createContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthState, LoginCredentials, UserType } from '@/types/auth';
import { login, googleLogin, register } from '@/services/auth';

// Initial auth state
const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    userId: undefined,
    token: undefined,
    userType: undefined,
    error: undefined,
};

// Define action types
type AuthAction =
    | { type: 'LOGIN_REQUEST' }
    | { type: 'LOGIN_SUCCESS'; payload: { userId: number; token: string; userType: UserType } }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'REGISTER_REQUEST' }
    | { type: 'REGISTER_SUCCESS' }
    | { type: 'REGISTER_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'RESTORE_TOKEN'; payload: { userId: number; token: string; userType: UserType } | null };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
        case 'REGISTER_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: undefined,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                userId: action.payload.userId,
                token: action.payload.token,
                userType: action.payload.userType,
                error: undefined,
            };
        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isLoading: false,
                error: undefined,
            };
        case 'LOGOUT':
            return {
                ...initialState,
                isLoading: false,
            };
        case 'RESTORE_TOKEN':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: action.payload !== null,
                userId: action.payload?.userId,
                token: action.payload?.token,
                userType: action.payload?.userType,
            };
        default:
            return state;
    }
};

// Create context
type AuthContextType = {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    googleAuth: () => Promise<void>;
    register: (userData: { email: string; password: string; username: string }) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is already logged in on app start
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const authDataStr = await SecureStore.getItemAsync('authData');
                if (authDataStr) {
                    const authData = JSON.parse(authDataStr);
                    dispatch({
                        type: 'RESTORE_TOKEN',
                        payload: {
                            userId: authData.userId,
                            token: authData.token,
                            userType: authData.userType
                        }
                    });
                } else {
                    dispatch({ type: 'RESTORE_TOKEN', payload: null });
                }
            } catch (e) {
                console.error('Failed to restore authentication state:', e);
                dispatch({ type: 'RESTORE_TOKEN', payload: null });
            }
        };

        bootstrapAsync();
    }, []);

    // Login function
    const handleLogin = async (credentials: LoginCredentials) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const response = await login(credentials);

            // Store auth data
            const authData = {
                userId: response.userId,
                token: 'token_placeholder', // Replace with actual token when backend provides it
                userType: credentials.type,
            };

            await SecureStore.setItemAsync('authData', JSON.stringify(authData));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: authData
            });
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error instanceof Error ? error.message : 'Login failed'
            });
        }
    };

    // Google auth function
    const handleGoogleAuth = async () => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const response = await googleLogin();

            // Store auth data
            const authData = {
                userId: response.userId,
                token: 'token_placeholder', // Replace with actual token when backend provides it
                userType: 'user' as UserType, // Google auth is always for user type
            };

            await SecureStore.setItemAsync('authData', JSON.stringify(authData));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: authData
            });
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error instanceof Error ? error.message : 'Google login failed'
            });
        }
    };

    // Register function
    const handleRegister = async (userData: { email: string; password: string; username: string }) => {
        dispatch({ type: 'REGISTER_REQUEST' });
        try {
            await register(userData);
            dispatch({ type: 'REGISTER_SUCCESS' });
        } catch (error) {
            dispatch({
                type: 'REGISTER_FAILURE',
                payload: error instanceof Error ? error.message : 'Registration failed'
            });
        }
    };

    // Logout function
    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('authData');
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider
            value={{
                state,
                login: handleLogin,
                googleAuth: handleGoogleAuth,
                register: handleRegister,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};