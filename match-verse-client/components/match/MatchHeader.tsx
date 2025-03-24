import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts } from 'expo-font';

interface MatchHeaderProps {
    title: string;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ title }) => {
    const headerTitleAnim = useRef(new Animated.Value(0)).current;

    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    });

    React.useEffect(() => {
        Animated.timing(headerTitleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const headerTitleStyle = {
        opacity: headerTitleAnim,
        transform: [
            {
                translateY: headerTitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                }),
            },
        ],
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Animated.View style={[styles.header, headerTitleStyle]}>
            <Text style={[styles.headerText, { fontFamily: 'Poppins-Bold' }]}>
                {title}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 16,
    },
    headerText: {
        fontSize: 28,
        color: 'white',
        paddingTop: 8,
        paddingBottom: 8,
    },
});