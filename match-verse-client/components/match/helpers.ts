import { Alert } from 'react-native';

/**
 * Checks if a match is complete based on its type and participant count
 * @param matchType The type of match (single or double)
 * @param participantCount Number of participants in the match
 * @returns Boolean indicating if the match has all required players
 */
export const isMatchComplete = (matchType: string, participantCount: number): boolean => {
    const requiredPlayers = matchType === 'single' ? 2 : 4;
    return participantCount === requiredPlayers;
};

/**
 * Gets a readable match status text based on match type and completion
 * @param matchType The type of match (single or double)
 * @param participantCount Number of participants in the match
 * @returns String representing the match status
 */
export const getMatchStatusText = (matchType: string, participantCount: number): string => {
    const requiredPlayers = matchType === 'single' ? 2 : 4;
    const playersNeeded = requiredPlayers - participantCount;

    if (playersNeeded <= 0) {
        return matchType === 'single' ? 'Singles match ready' : 'Doubles match ready';
    }

    return `Waiting for ${playersNeeded} more player${playersNeeded !== 1 ? 's' : ''}`;
};

/**
 * Handles validating doubles match requests
 * @param matchType The type of match being created
 * @param hasBooking Whether user has selected a booking
 * @returns Boolean indicating if the match request is valid
 */
export const validateMatchRequest = (matchType: string, hasBooking: boolean): boolean => {
    if (matchType === 'double' && !hasBooking) {
        Alert.alert(
            'Booking Required',
            'For doubles matches, you must provide a booking. This helps ensure all 4 players can be properly matched to the same court.',
            [{ text: 'OK', style: 'default' }]
        );
        return false;
    }

    return true;
};

/**
 * Gets the appropriate icon and color for a match based on its type and status
 * @param matchType The type of match (single or double)
 * @param isComplete Whether the match has all required players
 * @returns Object containing icon name and color
 */
export const getMatchTypeVisuals = (matchType: string, isComplete: boolean): { icon: string, color: string } => {
    if (matchType === 'single') {
        return {
            icon: 'person',
            color: isComplete ? '#10b68d' : '#9ca3af'
        };
    } else {
        return {
            icon: 'people',
            color: isComplete ? '#10b68d' : '#9ca3af'
        };
    }
};

/**
 * Organizes players into teams for doubles matches
 * @param players Array of player objects
 * @returns Object containing team1 and team2 arrays
 */
export const organizeDoublesTeams = (players: any[]): { team1: any[], team2: any[] } => {
    // In a real application, you would use backend data to determine actual teams
    // This is a simplified implementation for UI purposes

    // For 4 players, split into two teams
    if (players.length === 4) {
        return {
            team1: players.slice(0, 2),
            team2: players.slice(2, 4)
        };
    }

    // For less than 4 players, put first 2 in team1, rest in team2
    return {
        team1: players.slice(0, Math.min(2, players.length)),
        team2: players.length > 2 ? players.slice(2) : []
    };
};