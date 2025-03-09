export type UserType = 'player' | 'admin';

export interface User {
    userId: number;
    username: string;
    email: string;
    userType: UserType;
    experience?: number;
    rating?: number;
}

export interface LoginCredentials {
    email?: string;
    username?: string;
    password: string;
    type?: string; // For backend that requires a type field
}

export interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}