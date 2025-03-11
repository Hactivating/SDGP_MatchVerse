import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Authenticate venue owner and get token
export const login = async (credentials) => {
  const payload = {
    email: credentials.email,
    password: credentials.password,
    type: 'venue'
  };
  
  const response = await axios.post(`${API_URL}/login`, payload);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('venue', JSON.stringify(response.data.venue || response.data));
  }
  
  return response.data;
};

// Remove venue data from local storage
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('venue');
};

// Get current venue from localStorage
export const getCurrentVenue = () => {
  const venueStr = localStorage.getItem('venue');
  if (!venueStr) return null;
  
  try {
    return JSON.parse(venueStr);
  } catch (error) {
    localStorage.removeItem('venue');
    return null;
  }
};

// Check if venue owner is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

const venueAuthService = {
  login,
  logout,
  getCurrentVenue,
  isAuthenticated,
  getToken
};

export default venueAuthService;