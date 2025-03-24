// services/api.ts
import axios from 'axios';

// You may need to adjust this URL to match your backend
// For development on a real device, this should point to your computer's IP address
export const API_URL = 'http://172.20.10.2:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};