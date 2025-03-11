import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// File Upload API
export const uploadApi = {
  uploadFile: async (file, venueId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('venueId', venueId);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Courts API
export const courtsApi = {
  getAll: async () => {
    const venueId = localStorage.getItem('venue');
    if (!venueId) {
      throw new Error('No venue information found. Please log in.');
    }
    
    const parsedVenueId = Number(venueId);
    if (isNaN(parsedVenueId)) {
      throw new Error('Invalid venue ID');
    }
    
    const response = await api.get(`/courts?venueId=${parsedVenueId}`);
    const courtsData = (response.data || []).filter(court =>
      Number(court.venueId) === parsedVenueId
    );
    
    return { ...response, data: courtsData };
  },
  
  create: async (courtData) => {
    const venueId = localStorage.getItem('venue');
    if (!venueId) {
      throw new Error('No venue information found. Please log in.');
    }
    
    const parsedVenueId = Number(venueId);
    if (isNaN(parsedVenueId)) {
      throw new Error('Invalid venue ID');
    }
    
    const payload = {
      name: courtData.name,
      venueId: parsedVenueId
    };
    
    return api.post('/courts', payload);
  },
  
  delete: async (id) => {
    return api.delete(`/courts/${id}`);
  }
};

// Venue Profile API
export const venueApi = {
  getAll: () => api.get('/venues'),
  
  getById: (id) => {
    return api.get('/venues').then(response => {
      const venues = response.data || [];
      const venue = venues.find(v => v.venueId === Number(id));
      
      if (!venue) {
        throw new Error('Venue not found');
      }
      
      return { data: venue };
    });
  },
  
  getProfile: () => api.get('/venue/profile'),
  updateProfile: (data) => api.put('/venue/profile', data),
  updatePassword: (data) => api.put('/venue/password', data),
  
  // New method for uploading venue photos
  uploadPhoto: async (file, venueId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('venueId', venueId);
    
    return api.post('/venues/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

// Bookings API
export const bookingsApi = {
  getByCourtAndDate: (courtId, date) => {
    if (!courtId) {
      throw new Error('Court ID is required');
    }
    
    if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }
    
    return api.get(`/bookings/${courtId}/${date}`);
  },
  
  createVenueBooking: (data) => {
    const courtId = parseInt(data.courtId, 10);
    
    if (isNaN(courtId)) {
      throw new Error('Court ID must be a valid number');
    }
    
    if (typeof data.date !== 'string' || !data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Date must be a string in YYYY-MM-DD format');
    }
    
    const payload = {
      courtId: courtId,
      startingTime: data.startingTime,
      date: data.date
    };
    
    return api.post('/bookings', payload);
  },
  
  deleteBooking: async (bookingId) => {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    return api.delete(`/bookings/${bookingId}`);
  },
  
  getAll: () => api.get('/venue/bookings'),
  getTodayBookings: () => api.get('/venue/bookings/today'),
};

// Stats API
export const statsApi = {
  getDashboardStats: () => api.get('/venue/stats/dashboard'),
  getWeeklyBookings: () => api.get('/venue/stats/weekly-bookings'),
  getRecentActivity: () => api.get('/venue/stats/recent-activity'),
};

// Auth API for venue owners
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  verifyPassword: async (data) => {
    return api.post('/venue/verify-password', { password: data.password });
  },
};

export default api;