import { RefreshControl, ScrollView, View } from 'react-native';
import ErrorBoundary from '~/components/composite/error-boundary';
import { Month } from '~/store/types';
import { useGetUserStatusHistoryQuery } from '~/store/services/account';
import useRole from '~/hooks/role';
import AttendanceHistory from '~/views/app/profile/status-report/attendance-history';
import RollingStatusCard from '~/views/app/profile/status-report/rolling-status-card';
import StatusDescription from '~/views/app/profile/status-report/status-description';
import UserDetails from '~/views/app/profile/status-report/user-details';

const currentMonth = (new Date().getMonth() + 1) as Month;
const currentYear = new Date().getFullYear();
// Using last month's status since current month's status is not yet available
const previousMonth = (currentMonth - 1 === 0 ? 12 : currentMonth - 1) as Month;
const previousMonthYear = previousMonth === 12 ? currentYear - 1 : currentYear;

const StatusReport: React.FC = () => {
    const { user, isGlobalPastor } = useRole();
    // Calculate months back based on current month (1-12)
    // In January, monthsBack = 1; in December, monthsBack = 12
    // This ensures status history always spans from January to current month
    const monthsBack = previousMonth;
    const {
        data: userStatusHistory,
        refetch: refetchUserStatusHistory,
        isFetching: isFetchingUserStatusHistory,
    } = useGetUserStatusHistoryQuery({
        userId: user?._id,
        month: previousMonth,
        year: previousMonthYear,
        monthsBack,
    });

    const refetch = () => {
        refetchUserStatusHistory();
    };

    return (
        <ErrorBoundary>
            <View className="flex-1 bg-neutral-50 dark:bg-black/50">
                <ScrollView
                    className=""
                    refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetchingUserStatusHistory} />}
                >
                    <UserDetails user={user} isGlobalPastor={isGlobalPastor} />
                    <RollingStatusCard statusReport={userStatusHistory} isFetching={isFetchingUserStatusHistory} />
                    <AttendanceHistory statusReport={userStatusHistory} isFetching={isFetchingUserStatusHistory} />
                    <StatusDescription />
                </ScrollView>
            </View>
        </ErrorBoundary>
    );
};

export default StatusReport;
