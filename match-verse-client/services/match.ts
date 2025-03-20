// services/match.ts
import axios from 'axios';
import { API_URL } from './api';

// Get available bookings by date
export const getBookings = async (date: string) => {
    try {
        const response = await axios.get(`${API_URL}/bookings/available?date=${date}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

// Create a match request
export const createMatchRequest = async (data: {
    bookingId: number;
    matchType: 'single' | 'double';
    createdById: number;
    partnerId?: number;
}) => {
    try {
        const response = await axios.post(`${API_URL}/match/request`, data);
        return response.data;
    } catch (error) {
        console.error('Error creating match request:', error);
        throw error;
    }
};

// Get user's match history (all matches they are involved in)
export const getUserMatches = async (userId: number) => {
    try {
        const response = await axios.get(`${API_URL}/match/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user matches:', error);
        throw error;
    }
};

// Get all pending match requests
export const getPendingMatches = async () => {
    try {
        const response = await axios.get(`${API_URL}/match/pending`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending matches:', error);
        throw error;
    }
};

// Get all matched requests
export const getMatchedMatches = async () => {
    try {
        const response = await axios.get(`${API_URL}/match/matched`);
        return response.data;
    } catch (error) {
        console.error('Error fetching matched matches:', error);
        throw error;
    }
};

// Cancel a match request
export const cancelMatchRequest = async (requestId: number) => {
    try {
        const response = await axios.delete(`${API_URL}/match/request/${requestId}`);
        return response.data;
    } catch (error) {
        console.error('Error canceling match request:', error);
        throw error;
    }
};

// Get match requests by type (singles or doubles)
export const getMatchesByType = async (matchType: 'single' | 'double') => {
    try {
        const response = await axios.get(`${API_URL}/match/type/${matchType}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${matchType} matches:`, error);
        throw error;
    }
};

// Accept a match request (for players to confirm participating in a match)
export const acceptMatchRequest = async (requestId: number, userId: number) => {
    try {
        const response = await axios.post(`${API_URL}/match/request/${requestId}/accept`, {
            userId
        });
        return response.data;
    } catch (error) {
        console.error('Error accepting match request:', error);
        throw error;
    }
};