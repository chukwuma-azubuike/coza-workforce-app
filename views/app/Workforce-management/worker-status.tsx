import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import ErrorBoundary from '~/components/composite/error-boundary';
import { useGetUserByIdQuery, useGetUserStatusHistoryQuery } from '~/store/services/account';
import AttendanceHistory from '~/views/app/profile/status-report/attendance-history';
import RollingStatusCard from '~/views/app/profile/status-report/rolling-status-card';
import UserDetails from '~/views/app/profile/status-report/user-details';
import { previousMonth, previousMonthYear } from '~/views/app/profile/status-report/utils';

const WorkerStatus: React.FC = () => {
    const { _id } = useLocalSearchParams();
    const monthsBack = previousMonth;
    const {
        data: userStatusHistory,
        refetch: refetchUserStatusHistory,
        isFetching: isFetchingUserStatusHistory,
    } = useGetUserStatusHistoryQuery({
        userId: String(_id),
        month: previousMonth,
        year: previousMonthYear,
        monthsBack,
    });
    const { data: user, refetch: refetchUser } = useGetUserByIdQuery(String(_id));

    const refetch = () => {
        refetchUserStatusHistory();
        refetchUser();
    };
    return (
        <ErrorBoundary>
            <View className="flex-1 bg-neutral-50 dark:bg-black/50">
                <ScrollView
                    className=""
                    refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetchingUserStatusHistory} />}
                >
                    <UserDetails user={user} isGlobalPastor={false} />
                    <RollingStatusCard
                        thirdPartyView
                        statusReport={userStatusHistory}
                        isFetching={isFetchingUserStatusHistory}
                    />
                    <AttendanceHistory statusReport={userStatusHistory} isFetching={isFetchingUserStatusHistory} />
                </ScrollView>
            </View>
        </ErrorBoundary>
    );
};

export default WorkerStatus;
