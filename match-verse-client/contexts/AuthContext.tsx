import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as authService from '../services/auth';
import { setAuthToken } from '../services/api';
import { getUserById } from '../services/user';
import { User, LoginCredentials, CreateUserPayload, AuthResponse } from '../types/auth';

interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
}

const initialState: AuthState = {
    isLoading: true,
    isAuthenticated: false,
    user: null,
    token: null,
    error: null
};

type AuthAction =
    | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
    | { type: 'REGISTER_SUCCESS'; payload: AuthResponse }
    | { type: 'AUTH_ERROR'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (userData: CreateUserPayload) => Promise<AuthResponse>;
    logout: () => void;
    googleAuth: () => Promise<AuthResponse>;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                isLoading: false,
                error: null
            };
        case 'AUTH_ERROR':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                isLoading: false,
                error: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                isLoading: false
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const userString = await AsyncStorage.getItem('user');

                if (token && userString) {
                    const user = JSON.parse(userString);
                    setAuthToken(token);
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user,
                            token
                        }
                    });
                    router.replace('/(app)/home');
                } else {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } catch (error) {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadToken();
    }, []);

    const handleAuthSuccess = async (response: AuthResponse) => {
        try {
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            setAuthToken(response.token);
            dispatch({ type: 'LOGIN_SUCCESS', payload: response });
            router.replace('/(app)/home');
            return response;
        } catch (error) {
            throw error;
        }
    };

    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await authService.login(credentials);
            return await handleAuthSuccess(response);
        } catch (error: any) {
            dispatch({ type: 'AUTH_ERROR', payload: error.message });
            throw error;
        }
    };

    const register = async (userData: CreateUserPayload): Promise<AuthResponse> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await authService.register(userData);
            return await handleAuthSuccess(response);
        } catch (error: any) {
            dispatch({ type: 'AUTH_ERROR', payload: error.message });
            throw error;
        }
    };

    const googleAuth = async (): Promise<AuthResponse> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await authService.googleLogin();
            return await handleAuthSuccess(response);
        } catch (error: any) {
            dispatch({ type: 'AUTH_ERROR', payload: error.message });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            setAuthToken(null);
            dispatch({ type: 'LOGOUT' });
            router.replace('/(auth)/login');
        } catch (error) {
        }
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        state,
        login,
        register,
        logout,
        googleAuth,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};