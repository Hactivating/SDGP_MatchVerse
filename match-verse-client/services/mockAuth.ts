// services/mockAuth.ts
import { LoginCredentials, CreateUserPayload, User, AuthResponse } from '../types/auth';

// Mock user data
const mockUsers: (User & { password: string })[] = [
    {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        userType: 'player',
        experience: 250,
        rating: 4.7
    },
    {
        userId: 2,
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        userType: 'admin',
        experience: 500,
        rating: 5.0
    }
];

// Mock token
const generateToken = (userId: number): string => {
    return `mock-token-${userId}-${Date.now()}`;
};

// Mock login
export const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log("Mock login with credentials:", credentials);

    // Check for email or username match (case insensitive)
    const user = mockUsers.find(
        u => (u.email.toLowerCase() === credentials.email.toLowerCase() ||
                u.username.toLowerCase() === credentials.email.toLowerCase()) &&
            u.password === credentials.password
    );

    console.log("Found user:", user ? `${user.username} (${user.email})` : "none");

    if (!user) {
        console.error("Invalid credentials provided");
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user.userId);
    console.log("Generated token:", token);

    // Return authenticated user without password
    const { password, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token
    };
};

// Mock register
export const mockRegister = async (userData: CreateUserPayload): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('Email already in use');
    }

    // Check if username already exists
    if (mockUsers.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        throw new Error('Username already taken');
    }

    const newUser: (User & { password: string }) = {
        userId: mockUsers.length + 1,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        userType: 'player',
        experience: 0,
        rating: 0
    };

    // Add to mock database
    mockUsers.push(newUser);

    const token = generateToken(newUser.userId);

    // Return new user without password
    const { password, ...userWithoutPassword } = newUser;

    return {
        user: userWithoutPassword,
        token
    };
};

// Mock user data
export const mockGetUserById = async (userId: number): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.userId === userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
};