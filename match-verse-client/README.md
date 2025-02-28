# User Management App

A React Native mobile application for user management built with Expo and TypeScript.

## Features

- User authentication (login/register)
- View user profile
- Edit user profile
- Delete user account
- Settings management

## Tech Stack

- React Native / Expo
- TypeScript
- Expo Router for navigation
- Secure Storage for token management
- REST API integration

## Project Structure

```
├── app/                  # Expo Router app directory
│   ├── (tabs)/           # Tab-based screens
│   │   ├── _layout.tsx   # Tab navigation layout
│   │   ├── index.tsx     # Home screen
│   │   ├── profile.tsx   # Profile screen
│   │   └── settings.tsx  # Settings screen
│   ├── _layout.tsx       # Root layout
│   ├── login.tsx         # Login screen
│   ├── register.tsx      # Registration screen
│   ├── edit-profile.tsx  # Edit profile screen
│   └── delete-account.tsx # Delete account screen
├── components/           # Reusable components
├── context/              # Context providers
│   └── AuthContext.tsx   # Authentication context
├── services/             # API services
│   └── api.ts            # API integration
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## API Configuration

The app is configured to connect to a NestJS backend. Update the API URL in `services/api.ts` to point to your backend server:

```typescript
const API_URL = 'https://your-api-url.com';
```

## Authentication Flow

The app uses JWT tokens for authentication:

1. User logs in or registers
2. JWT token is stored securely using Expo SecureStore
3. Token is included in API requests
4. On logout, token is removed from storage

## Form Validation

Input validation is implemented for all forms:
- Email validation
- Password requirements
- Required fields

## Error Handling

The app includes comprehensive error handling:
- API error responses
- Form validation errors
- Loading states for async operations

## Security Considerations

- Secure storage for authentication tokens
- Password confirmation for sensitive operations
- Proper validation of user inputs