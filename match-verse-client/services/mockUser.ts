// services/mockUser.ts
import { mockGetUserById } from './mockAuth';
import { User } from '../types/auth';

// Use the mockGetUserById function from mockAuth
export const getUserById = mockGetUserById;

// Mock update user
export const updateUser = async (userId: number, userData: Partial<User>): Promise<User> => {
    // This is a mock function that doesn't actually update anything
    // In a real app, this would update the user in the database

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get current user data
    const currentUser = await mockGetUserById(userId);

    // Return merged data
    return {
        ...currentUser,
        ...userData
    };
};