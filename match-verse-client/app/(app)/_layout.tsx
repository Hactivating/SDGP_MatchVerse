import { Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AppLayout() {
    const { state } = useAuth();
    const router = useRouter();

    // Protect app routes by checking authentication
    useEffect(() => {
        if (!state.isAuthenticated && !state.isLoading) {
            router.replace('/(auth)/login');
        }
    }, [state.isAuthenticated, state.isLoading]);

    if (!state.isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return <Stack screenOptions={{ headerShown: true }} />;
}