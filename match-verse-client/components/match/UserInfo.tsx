import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

interface UserType {
    userId: string | number;
    username?: string;
    rank?: string;
    userImageUrl?: string;
}

interface UserInfoProps {
    user: UserType | null;
}

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    const getRankColor = (rank) => {
        if (!rank) return '#9CA3AF'; // Default gray

        if (rank.includes('Beginner')) return '#10B981'; // Green
        if (rank.includes('Intermediate')) return '#3B82F6'; // Blue
        if (rank.includes('Advanced')) return '#8B5CF6'; // Purple
        if (rank.includes('Expert')) return '#EF4444'; // Red

        return '#9CA3AF'; // Default gray
    };

    if (!fontsLoaded) {
        return null;
    }

    if (!user) {
        return (
            <View style={styles.notAvailableContainer}>
                <Text style={[styles.notAvailableText, { fontFamily: 'Poppins-Regular' }]}>
                    User information not available
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.userInfoContainer}>
            {user.userImageUrl ? (
                <Image
                    source={{ uri: user.userImageUrl }}
                    style={styles.userAvatar}
                    resizeMode="cover"
                />
            ) : (
                <LinearGradient
                    colors={['#d1d5db', '#9CA3AF']}
                    style={styles.userAvatarPlaceholder}
                >
                    <Text style={[styles.userAvatarText, { fontFamily: 'Poppins-Bold' }]}>
                        {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </Text>
                </LinearGradient>
            )}
            <View style={styles.userDetails}>
                <Text style={[styles.userName, { fontFamily: 'Poppins-Medium' }]}>
                    {user.username || `User #${user.userId}`}
                </Text>
                <View
                    style={[
                        styles.rankBadge,
                        { backgroundColor: getRankColor(user.rank) }
                    ]}
                >
                    <Text style={[styles.rankText, { fontFamily: 'Poppins-Bold' }]}>
                        {user.rank || 'Unranked'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        color: '#fff',
        fontSize: 18,
    },
    userDetails: {
        marginLeft: 10,
        flex: 1,
    },
    userName: {
        fontSize: 14,
        color: '#333',
    },
    rankBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    rankText: {
        color: '#fff',
        fontSize: 10,
    },
    notAvailableContainer: {
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        alignItems: 'center',
    },
    notAvailableText: {
        fontStyle: 'italic',
        color: '#9ca3af',
    },
});