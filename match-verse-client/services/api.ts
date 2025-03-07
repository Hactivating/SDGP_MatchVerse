// services/api.ts
import axios from 'axios';
import Constants from 'expo-constants';

// Use your NestJS server IP and port - adjust this to your actual server address
const API_URL = 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
export const setAuthToken = (token: string | undefined) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};