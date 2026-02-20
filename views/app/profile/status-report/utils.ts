import dayjs from 'dayjs';
import { IGetUserStatusMetric } from '~/store/services/account';
import { IUserStatus, Month } from '~/store/types';

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
export const getStatusContent = (status: IUserStatus | 'UNKNOWN') => {
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

export const getRollingStatus = (metrics: IGetUserStatusMetric | undefined) => {
    if (!metrics) {
        return 'UNKNOWN';
    }

    if (metrics?.activeStreak > 0) {
        return 'ACTIVE';
    }

    if (metrics?.dormantStreak > 0) {
        return 'DORMANT';
    }

    if (metrics?.inactiveStreak > 0) {
        return 'INACTIVE';
    }

    if (metrics?.blacklistedStreak > 0) {
        return 'BLACKLISTED';
    }

    return 'UNKNOWN';
};

export const getCurrentStreak = (metrics: IGetUserStatusMetric | undefined) => {
    if (!metrics) {
        return 0;
    }

    if (metrics?.activeStreak > 0) {
        return metrics?.activeStreak;
    }

    if (metrics?.dormantStreak > 0) {
        return metrics?.dormantStreak;
    }

    if (metrics?.inactiveStreak > 0) {
        return metrics?.inactiveStreak;
    }

    if (metrics?.blacklistedStreak > 0) {
        return metrics?.blacklistedStreak;
    }

    return 0;
};

export const currentMonth = new Date().getMonth() + 1;
export const currentYear = new Date().getFullYear();
// Using last month's status since current month's status is not yet available
export const previousMonth = (currentMonth - 1 === 0 ? 12 : currentMonth - 1) as Month;
export const previousMonthYear = previousMonth === 12 ? currentYear - 1 : currentYear;
