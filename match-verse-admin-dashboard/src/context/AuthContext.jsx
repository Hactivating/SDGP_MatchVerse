// In src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load venue data from localStorage on mount
  useEffect(() => {
    const loadStoredVenue = () => {
      try {
        const storedVenue = localStorage.getItem('venue');
        if (storedVenue) {
          const parsedVenue = JSON.parse(storedVenue);
          setVenue(parsedVenue);
        }
      } catch (err) {
        console.error('Error loading stored venue data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredVenue();
  }, []);

  // In AuthContext.jsx - Modify login function to ensure venueId is saved
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({
        email,
        password,
        type: 'venue'
      });
      
      // Process response to get venue data
      let venueData;
      if (response.data) {
        venueData = response.data.venue || response.data;
      } else {
        venueData = response.venue || response;
      }
      
      // Important: Make sure venueId is set properly
      if (!venueData.venueId && venueData.id) {
        venueData.venueId = venueData.id;
      }
      
      // Store venue in localStorage as a string
      localStorage.setItem('venue', JSON.stringify(venueData));
      
      // Store token if available
      if (response.data?.token || response.token) {
        const token = response.data?.token || response.token;
        localStorage.setItem('token', token);
      }
      
      // Update state
      setVenue(venueData);
      setIsLoading(false);
      
      return venueData;
    } catch (err) {
      // Comprehensive error handling
      console.error('Login error:', err);
      
      // Ensure loading state is set to false
      setIsLoading(false);
      
      // Set error message
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Login failed';
      setError(errorMessage);
      
      // Clear any partial auth state
      localStorage.removeItem('token');
      localStorage.removeItem('venue');
      setVenue(null);
      
      // Re-throw the error for the UI to handle
      throw err;
    }
  };

  const logout = () => {
    setVenue(null);
    localStorage.removeItem('venue');
    localStorage.removeItem('token');
  };

  const value = {
    venue,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!venue,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;