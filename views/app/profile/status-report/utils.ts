import dayjs from 'dayjs';
import { IUserStatus } from '~/store/types';

// Get start and end Unix timestamps for a specific month
export function getMonthDateRange(year: number, month: number) {
    // month is 1-indexed in Day.js (1 = January, 12 = December)
    const startDate = dayjs(`${year}-${month}-01`).startOf('month');
    const endDate = dayjs(`${year}-${month}-01`).endOf('month');

    return {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        startUnix: startDate.unix(), // Unix timestamp in seconds
        endUnix: endDate.unix(), // Unix timestamp in seconds
    };
}

// Helper function to get status-specific content
export const getStatusContent = (status: IUserStatus) => {
    switch (status) {
        case 'ACTIVE':
            return {
                subtitle: 'Good standing.',
                message: "You're maintaining a consistent attendance. Keep it up!",
                streakTitle: 'Active Streak',
                streakSubtitle: 'Keep the momentum going!',
                emoji: '🔥',
                iconBgColor: 'bg-green-700',
                bannerBorderColor: 'border-green-200',
                bannerBgColor: 'bg-green-50',
                iconColor: 'green',
                gradientColors: ['#10b981', '#14b8a6'], // green-500 to teal-500
            };
        case 'DORMANT':
            return {
                subtitle: 'Needs attention.',
                message: "You've been inactive recently. We'd love to see you back!",
                streakTitle: 'Dormant Period',
                streakSubtitle: 'Time to get back on track!',
                emoji: '😞',
                iconBgColor: 'bg-amber-600',
                bannerBorderColor: 'border-amber-200',
                bannerBgColor: 'bg-amber-50',
                iconColor: '#d97706', // amber-600
                gradientColors: ['#f59e0b', '#f97316'], // amber-500 to orange-500
            };
        case 'INACTIVE':
            return {
                subtitle: 'Currently inactive.',
                message: 'Your account is inactive. Please contact your administrator for assistance.',
                streakTitle: 'Inactive Status',
                streakSubtitle: 'Reach out to get reactivated.',
                emoji: '💤',
                iconBgColor: 'bg-gray-600',
                bannerBorderColor: 'border-gray-200',
                bannerBgColor: 'bg-gray-50',
                iconColor: '#6b7280', // gray-500
                gradientColors: ['#6b7280', '#9ca3af'], // gray-500 to gray-400
            };
        case 'BLACKLISTED':
            return {
                subtitle: 'Access restricted.',
                message: 'Your account has been restricted. Please contact your Pastor/Campus Coordinator.',
                streakTitle: 'Restricted Access',
                streakSubtitle: 'Contact your Pastor/Campus Coordinator.',
                emoji: '😩',
                iconBgColor: 'bg-red-700',
                bannerBorderColor: 'border-red-200',
                bannerBgColor: 'bg-red-50',
                iconColor: '#dc2626', // red-600
                gradientColors: ['#dc2626', '#ef4444'], // red-600 to red-500
            };
        default:
            return {
                subtitle: 'Status unknown.',
                message: 'Unable to determine your current status.',
                streakTitle: 'Status',
                streakSubtitle: 'Please refresh.',
                emoji: '❓',
                iconBgColor: 'bg-gray-600',
                bannerBorderColor: 'border-gray-200',
                bannerBgColor: 'bg-gray-50',
                iconColor: '#6b7280',
                gradientColors: ['#6b7280', '#9ca3af'],
            };
    }
};

/**
 * Calculate the streak of consecutive months with the same status
 * Only counts completed months (from history), not the current month
 * @param history - Array of status reports ordered from most recent to oldest
 * @param currentStatus - The current status to match against
 * @returns The number of consecutive completed months with the same status
 */
export const calculateMonthStreak = (
    history: Array<{ status: IUserStatus; available: boolean }>,
    currentStatus: IUserStatus
): number => {
    if (!history || history.length === 0) {
        return 0; // If no history, streak is 0 (current month doesn't count)
    }

    let streak = 0; // Start from 0, only count completed months

    // Iterate through history from most recent to oldest
    // History contains only completed months (not current month)
    for (let i = 0; i < history.length; i++) {
        const report = history[i];

        // Only count months where data is available
        if (!report.available) {
            break; // Stop counting if we hit unavailable data
        }

        // Check if status matches the current status
        if (report.status === currentStatus) {
            streak++;
        } else {
            // Stop counting when status changes
            break;
        }
    }

    return streak;
};
