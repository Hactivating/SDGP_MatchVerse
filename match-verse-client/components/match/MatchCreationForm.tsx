// components/match/MatchCreationForm.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Switch,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BookingSelector } from './BookingSelector';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { validateMatchRequest } from './helpers';
import { FlatList } from 'react-native';
import { getAllUsers } from '@/services/user';

interface BookingType {
    bookingId: number;
    courtId: number;
    date: string;
    startingTime: string;
    court?: {
        name: string;
    };
}

interface UserType {
    userId: number;
    username: string;
    email?: string;
    rank?: string;
    userImageUrl?: string;
}

interface MatchCreationFormProps {
    matchType: string;
    setMatchType: (type: string) => void;
    bookingId: string;
    setBookingId: (id: string) => void;
    useBooking: boolean;
    setUseBooking: (use: boolean) => void;
    loading: boolean;
    loadingBookings: boolean;
    availableBookings: BookingType[];
    onSubmit: (data: any) => void;
    currentUserId: number;
}

// Enhanced Button Component similar to home screen
const GradientButton = ({ onPress, text, icon, isLoading = false, disabled = false }) => {
    const [pressed, setPressed] = React.useState(false);

    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={handlePress}
            disabled={isLoading || disabled}
            activeOpacity={disabled ? 1 : 0.8}
            style={{ opacity: disabled ? 0.6 : 1 }}
        >
            <Animated.View
                style={{
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                }}
            >
                <LinearGradient
                    colors={['#10b68d', '#0a8d6d', '#046d64']}
                    className="flex-row py-3 px-5 rounded-full items-center justify-center"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white mr-1.5">
                                {text}
                            </Text>
                            {icon && icon}
                        </>
                    )}
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};

export const MatchCreationForm: React.FC<MatchCreationFormProps> = ({
                                                                        matchType,
                                                                        setMatchType,
                                                                        bookingId,
                                                                        setBookingId,
                                                                        useBooking,
                                                                        setUseBooking,
                                                                        loading,
                                                                        loadingBookings,
                                                                        availableBookings,
                                                                        onSubmit,
                                                                        currentUserId,
                                                                    }) => {
    // Load Poppins font
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    // State for partner selection
    const [showPartnerSelection, setShowPartnerSelection] = useState(false);
    const [partnerId, setPartnerId] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [users, setUsers] = useState<UserType[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch users for partner selection
    useEffect(() => {
        const fetchUsers = async () => {
            if (matchType === 'double' && showPartnerSelection) {
                setLoadingUsers(true);
                try {
                    const usersList = await getAllUsers();
                    // Filter out the current user
                    setUsers(usersList.filter(user => user.userId !== currentUserId));
                } catch (error) {
                    console.error('Error fetching users:', error);
                    Alert.alert('Error', 'Failed to load users for partner selection');
                } finally {
                    setLoadingUsers(false);
                }
            }
        };

        fetchUsers();
    }, [matchType, showPartnerSelection, currentUserId]);

    // When matchType changes to 'double', enforce useBooking
    useEffect(() => {
        if (matchType === 'double' && !useBooking) {
            setUseBooking(true);
            if (!bookingId) {
                Alert.alert(
                    'Booking Required',
                    'For doubles matches, you must provide a booking to ensure all players are matched to the same court.',
                    [{ text: 'OK' }]
                );
            }
        }

        // Reset partner selection when match type changes
        if (matchType !== 'double') {
            setPartnerId('');
            setPartnerName('');
            setShowPartnerSelection(false);
        }
    }, [matchType]);

    const handleToggleSwitch = (value) => {
        // Don't allow turning off booking for doubles matches
        if (matchType === 'double' && !value) {
            Alert.alert(
                'Booking Required',
                'For doubles matches, you must provide a booking to ensure all players are matched to the same court.',
                [{ text: 'OK' }]
            );
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setUseBooking(value);
    };

    const handleChangeMatchType = (type) => {
        if (type === matchType) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMatchType(type);
    };

    const handleSelectPartner = (user: UserType) => {
        setPartnerId(user.userId.toString());
        setPartnerName(user.username);
        setShowPartnerSelection(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSubmit = () => {
        // Validate match request before submitting
        if (validateMatchRequest(matchType, useBooking)) {
            // For doubles, we need a partner
            if (matchType === 'double' && !partnerId) {
                Alert.alert(
                    'Partner Required',
                    'For doubles matches, you must select a partner.',
                    [{ text: 'OK' }]
                );
                return;
            }

            onSubmit({
                matchType,
                bookingId,
                useBooking,
                partnerId: partnerId ? parseInt(partnerId, 10) : undefined
            });
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Determine if the submit button should be disabled
    const isSubmitDisabled = () => {
        if (loading) return true;
        if (useBooking && !bookingId) return true;
        if (matchType === 'double' && !partnerId) return true;
        return false;
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)']}
                className="backdrop-blur-md rounded-2xl p-5"
            >
                <Text style={[styles.cardTitle, { fontFamily: 'Poppins-Bold' }]}>Create Match Request</Text>

                <View style={styles.inputGroup}>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                matchType === 'single' && styles.activeTypeButton
                            ]}
                            onPress={() => handleChangeMatchType('single')}
                        >
                            <Ionicons name="person" size={18} color={matchType === 'single' ? '#fff' : '#333'} />
                            <Text
                                style={[
                                    matchType === 'single' ? styles.activeButtonText : styles.buttonText,
                                    { fontFamily: matchType === 'single' ? 'Poppins-Bold' : 'Poppins-Medium' }
                                ]}
                            >
                                Singles
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                matchType === 'double' && styles.activeTypeButton
                            ]}
                            onPress={() => handleChangeMatchType('double')}
                        >
                            <Ionicons name="people" size={18} color={matchType === 'double' ? '#fff' : '#333'} />
                            <Text
                                style={[
                                    matchType === 'double' ? styles.activeButtonText : styles.buttonText,
                                    { fontFamily: matchType === 'double' ? 'Poppins-Bold' : 'Poppins-Medium' }
                                ]}
                            >
                                Doubles
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.switchContainer}>
                    <Text style={[styles.switchLabel, { fontFamily: 'Poppins-Medium' }]}>I have a booking</Text>
                    <Switch
                        value={useBooking}
                        onValueChange={handleToggleSwitch}
                        trackColor={{ false: '#e0e0e0', true: '#a7f3d0' }}
                        thumbColor={useBooking ? '#10b68d' : '#f4f3f4'}
                        disabled={matchType === 'double'} // Disable toggle for doubles
                    />
                </View>

                {useBooking && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { fontFamily: 'Poppins-Medium' }]}>Booking ID:</Text>
                        <TextInput
                            style={styles.input}
                            value={bookingId}
                            onChangeText={setBookingId}
                            placeholder="Enter booking ID"
                            keyboardType="numeric"
                        />

                        <BookingSelector
                            bookings={availableBookings}
                            loading={loadingBookings}
                            onSelect={setBookingId}
                        />
                    </View>
                )}

                {/* Partner selection for doubles */}
                {matchType === 'double' && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { fontFamily: 'Poppins-Medium' }]}>Partner:</Text>

                        {!showPartnerSelection ? (
                            <View>
                                <TouchableOpacity
                                    style={styles.partnerSelectButton}
                                    onPress={() => setShowPartnerSelection(true)}
                                >
                                    <Ionicons name="person-add" size={20} color="#10b68d" style={styles.partnerIcon} />
                                    <Text style={[styles.partnerSelectText, { fontFamily: 'Poppins-Medium' }]}>
                                        {partnerId ? partnerName : 'Select a partner'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.partnerSelectionContainer}>
                                <View style={styles.searchContainer}>
                                    <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                                    <TextInput
                                        style={[styles.searchInput, { fontFamily: 'Poppins-Regular' }]}
                                        placeholder="Search for a player..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {loadingUsers ? (
                                    <ActivityIndicator size="large" color="#10b68d" style={styles.loadingIndicator} />
                                ) : (
                                    <>
                                        {filteredUsers.length > 0 ? (
                                            <FlatList
                                                data={filteredUsers}
                                                keyExtractor={(item) => item.userId.toString()}
                                                style={styles.usersList}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.userItem}
                                                        onPress={() => handleSelectPartner(item)}
                                                    >
                                                        <View style={styles.userAvatar}>
                                                            {item.userImageUrl ? (
                                                                <Image source={{ uri: item.userImageUrl }} style={styles.avatarImage} />
                                                            ) : (
                                                                <Text style={[styles.avatarText, { fontFamily: 'Poppins-Bold' }]}>
                                                                    {item.username.charAt(0).toUpperCase()}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <View style={styles.userInfo}>
                                                            <Text style={[styles.userName, { fontFamily: 'Poppins-Medium' }]}>
                                                                {item.username}
                                                            </Text>
                                                            {item.rank && (
                                                                <Text style={[styles.userRank, { fontFamily: 'Poppins-Regular' }]}>
                                                                    {item.rank}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <Ionicons name="add-circle" size={24} color="#10b68d" />
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        ) : (
                                            <View style={styles.noUsersContainer}>
                                                <Ionicons name="people" size={40} color="#d1d5db" />
                                                <Text style={[styles.noUsersText, { fontFamily: 'Poppins-Medium' }]}>
                                                    No players found
                                                </Text>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => setShowPartnerSelection(false)}
                                        >
                                            <Text style={[styles.cancelText, { fontFamily: 'Poppins-Medium' }]}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {!useBooking && (
                    <View style={styles.infoContainer}>
                        <Ionicons name="information-circle-outline" size={18} color="#10b68d" />
                        <Text style={[styles.infoText, { fontFamily: 'Poppins-Regular' }]}>
                            You'll be matched with someone who has a court booking.
                        </Text>
                    </View>
                )}

                {matchType === 'double' && (
                    <View style={styles.doublesInfoContainer}>
                        <Ionicons name="people" size={18} color="#3b82f6" />
                        <Text style={[styles.doublesInfoText, { fontFamily: 'Poppins-Regular' }]}>
                            Doubles match requires you to select a partner and provide a booking.
                        </Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <GradientButton
                        onPress={handleSubmit}
                        text="Create Match Request"
                        icon={<Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />}
                        isLoading={loading}
                        disabled={isSubmitDisabled()}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 20,
        color: '#333',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    activeTypeButton: {
        backgroundColor: '#10b68d',
        borderColor: '#10b68d',
    },
    buttonText: {
        color: '#333',
        marginLeft: 6,
    },
    activeButtonText: {
        color: '#fff',
        marginLeft: 6,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    infoText: {
        color: '#333',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    doublesInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    doublesInfoText: {
        color: '#333',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    partnerSelectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    partnerIcon: {
        marginRight: 8,
    },
    partnerSelectText: {
        flex: 1,
        color: '#333',
    },
    partnerSelectionContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        fontSize: 14,
    },
    usersList: {
        maxHeight: 200,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        color: '#333',
    },
    userRank: {
        fontSize: 12,
        color: '#6b7280',
    },
    cancelButton: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelText: {
        color: '#ef4444',
    },
    noUsersContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    noUsersText: {
        color: '#6b7280',
        marginTop: 10,
    },
    loadingIndicator: {
        padding: 20,
    },
});