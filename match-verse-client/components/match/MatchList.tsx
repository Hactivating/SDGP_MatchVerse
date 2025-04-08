// components/match/MatchList.tsx
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MatchItem } from './MatchItem';
import { isMatchComplete } from './helpers';

interface MatchListProps {
    pendingMatches: any[];
    matchedMatches: any[];
    animations: {
        pending: {
            opacity: Animated.Value;
            translateY: Animated.Value;
        };
        matched: {
            opacity: Animated.Value;
            translateY: Animated.Value;
        };
    };
}

export const MatchList: React.FC<MatchListProps> = ({
                                                        pendingMatches,
                                                        matchedMatches,
                                                        animations
                                                    }) => {
    return (
        <View style={styles.container}>
            {/* Pending Matches */}
            <Animated.View
                style={{
                    opacity: animations.pending.opacity,
                    transform: [{ translateY: animations.pending.translateY }]
                }}
            >
                <MatchItem
                    title="Pending Matches"
                    matches={pendingMatches.map(match => ({
                        ...match,
                        isComplete: isMatchComplete(match.matchType, match.allParticipants?.length || 1)
                    }))}
                    status="pending"
                    emptyIconName="hourglass-outline"
                    emptyText="No pending matches found"
                />
            </Animated.View>

            {/* Matched Matches */}
            <Animated.View
                style={{
                    opacity: animations.matched.opacity,
                    transform: [{ translateY: animations.matched.translateY }]
                }}
            >
                <MatchItem
                    title="Matched Games"
                    matches={matchedMatches.map(match => ({
                        ...match,
                        isComplete: isMatchComplete(match.matchType, match.allParticipants?.length || 1)
                    }))}
                    status="matched"
                    emptyIconName="tennisball-outline"
                    emptyText="No matched games found"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // No specific styles needed as MatchItem components handle their own styling
    }
});

export default MatchList;