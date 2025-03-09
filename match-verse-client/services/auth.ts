// services/auth.service.ts
import { api } from './api';
import { LoginCredentials, CreateUserPayload, AuthResponse } from '../types/auth';
import { getUserById } from './user';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const isUsingEmail = 'email' in credentials && credentials.email && !credentials.username;

        const loginData = {
            email: isUsingEmail ? credentials.email : credentials.username,
            password: credentials.password,
            type: 'user'
        };

        const response = await api.post('/auth/login', loginData);
        const userId = response.data;
        const user = await getUserById(userId);
        const token = `user-token-${userId}-${Date.now()}`;

        return {
            user,
            token
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
    }
};

export const register = async (userData: CreateUserPayload): Promise<AuthResponse> => {
    try {
        const response = await api.post('/users', userData);

        return await login({
            email: userData.email,
            password: userData.password
        });
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
    }
};

export const googleLogin = async (): Promise<AuthResponse> => {
    try {
        const response = await api.get('/auth/google');
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Google authentication failed.';
        throw new Error(errorMessage);
    }
};