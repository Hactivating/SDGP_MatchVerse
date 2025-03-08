// types/auth.ts

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Create user payload
export interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
}

// User interface
export interface User {
    userId: number;
    username: string;
    email: string;
    userType?: string;
    experience?: number;
    rating?: number;
}

// Auth response
export interface AuthResponse {
    user: User;
    token: string;
}

// // types/auth.ts
// export type UserType = 'user' | 'venue';
//
// export interface LoginCredentials {
//     email: string;
//     password: string;
//     type: UserType;
// }
//
// export interface AuthState {
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     userId?: number;
//     token?: string;
//     userType?: UserType;
//     error?: string;
// }
//
// export interface User {
//     userId: number;
//     username: string;
//     email: string;
//     password?: string; // Include but mark as optional
//     experience: number;
//     rating: number;
// }
//
// export interface CreateUserPayload {
//     email: string;
//     password: string;
//     username: string;
// }