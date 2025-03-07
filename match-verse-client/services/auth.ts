import { api } from './api';
import { LoginCredentials } from '@/types/auth';
import { CreateUserPayload } from '@/types/auth';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Register a new user
export const register = async (userData: CreateUserPayload) => {
    const response = await api.post('/users', userData);
    return response.data;
};

// Login with email and password
export const login = async (credentials: LoginCredentials) => {
    const response = await api.post('http://localhost:3000/auth/login', credentials);
    return response.data;
};

// Google OAuth login
export const googleLogin = async () => {
    // Define redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'matchverse', // This should match your app.json scheme
    });

    // Construct Google auth endpoint with params
    const authUrl = `${api.defaults.baseURL}/auth?redirect_uri=${encodeURIComponent(redirectUri)}`;

    // Open browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
        // Extract token from URL
        const { url } = result;
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');

        if (!accessToken) {
            throw new Error('Failed to get access token');
        }

        // Get user info using the token
        const userResponse = await api.get('/auth/google/callback', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return userResponse.data;
    } else {
        throw new Error('Google authentication was cancelled or failed');
    }
};

