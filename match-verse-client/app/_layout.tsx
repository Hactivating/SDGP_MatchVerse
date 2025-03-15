import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function Layout() {
    return (
        <AuthProvider>
            <StatusBar style="dark" backgroundColor="#22c55e" />
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}