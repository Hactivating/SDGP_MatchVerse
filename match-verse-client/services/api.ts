import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User, RegisterUserDto, UpdateUserDto, LoginResponse } from '@/types';
import axios from 'axios';

// API base URL - replace with your actual backend URL
const API_URL = 'http://localhost:3000';

// For web platform (SecureStore is not available on web)
const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return SecureStore.getItemAsync('userToken');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText || 'Something went wrong';
    throw new Error(errorMessage);
  }
  return response.json();
};

// Authentication API calls
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`http://localhost:3000/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

export const register = async (userData: RegisterUserDto): Promise<LoginResponse> => {
  const response = await fetch(`http://localhost:3000/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

// User API calls
export const getUserProfile = async (): Promise<User> => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:3000/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
};

export const updateUserProfile = async (userData: UpdateUserDto): Promise<User> => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:3000/users/profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

export const deleteUserAccount = async (password: string): Promise<void> => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:3000/users/account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  return handleResponse(response);
};

export const checkAuthStatus = async (token: string): Promise<User> => {
  const response = await fetch(`http://localhost:3000/auth/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Authentication check failed');
  }

  return response.json();
};

export const api = {
  getCurrentUser: async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const response = await axios.get(`http://localhost:3000/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
};