
import { api } from './api';
import { User } from '@/types/auth';

export const getUserById = async (userId: number): Promise<User> => {
    const response = await api.get('/users');
    const users = response.data;
    const user = users.find((u: User) => u.userId === userId);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

export const updateUser = async (userId: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};

// Add this to your user.ts service file

/**
 * Fetches all users from the API
 * @returns {Promise<User[]>} List of all users
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
};