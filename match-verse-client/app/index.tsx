import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
    const { state } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!state.isLoading) {
            if (state.isAuthenticated) {
                router.replace('/(app)/home');
            } else {
                router.replace('/(auth)/login');
            }
        }
    }, [state.isLoading, state.isAuthenticated]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ActivityIndicator size="large" color="#3498db" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});