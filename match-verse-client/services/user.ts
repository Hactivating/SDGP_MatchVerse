// services/user.ts
import { api } from './api';
import { User } from '@/types/auth';

// Get user by ID
export const getUserById = async (userId: number): Promise<User> => {
    // Since your backend doesn't have a specific endpoint for getting a user by ID,
    // we'll get all users and filter for the one we want
    const response = await api.get('/users');
    const users = response.data;

    // Find the user with the matching ID
    const user = users.find((u: User) => u.userId === userId);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

// Update user
export const updateUser = async (userId: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};