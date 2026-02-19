import { RefreshControl, ScrollView, Text, View } from 'react-native';
import ErrorBoundary from '~/components/composite/error-boundary';
import { Month } from '~/store/types';
import { useGetUserStatusHistoryQuery } from '~/store/services/account';
import useRole from '~/hooks/role';
import AvatarComponent from '~/components/atoms/avatar';
import { BriefcaseIcon, MapPinIcon } from 'lucide-react-native';
import { THEME_CONFIG } from '~/config/appConfig';
import AttendanceHistory from '~/views/app/profile/status-report/attendance-history';
import RollingStatusCard from '~/views/app/profile/status-report/rolling-status-card';
import StatusDescription from '~/views/app/profile/status-report/status-description';

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

    const {
        data: previousMonthStatus,
        refetch: refetchPreviousMonthStatus,
        isFetching: isFetchingPreviousMonthStatus,
    } = useGetUserStatusHistoryQuery({
        userId: user?._id,
        month: previousMonth,
        year: previousMonthYear,
        monthsBack: 1,
    });

    const refetch = () => {
        refetchUserStatusHistory();
        refetchPreviousMonthStatus();
    };

    return (
        <ErrorBoundary>
            <View className="flex-1 bg-neutral-50 dark:bg-black/50">
                <ScrollView
                    className=""
                    refreshControl={
                        <RefreshControl
                            onRefresh={refetch}
                            refreshing={isFetchingUserStatusHistory || isFetchingPreviousMonthStatus}
                        />
                    }
                >
                    <View className="py-6 px-4 shadow-sm items-center flex-row gap-6 bg-white dark:bg-black">
                        <View className="border-4 border-neutral-50 dark:border-neutral-800 h-fit w-fit rounded-full shadow-sm">
                            <AvatarComponent
                                alt="current-user-avatar"
                                lastName={user?.lastName}
                                firstName={user?.firstName}
                                imageUrl={user?.pictureUrl}
                                className="w-24 h-24"
                                isLoading={false}
                            />
                        </View>
                        <View className="gap-2 py-2 items-start">
                            <View
                                style={{
                                    justifyContent: 'space-around',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <View>
                                    <Text className="font-semibold text-lg text-foreground">{user?.firstName}</Text>
                                </View>
                                <Text className="font-semibold text-lg text-foreground">{user?.lastName}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <BriefcaseIcon color={THEME_CONFIG.lightGray} size={16} />
                                <Text className="font-medium text-muted-foreground">
                                    {isGlobalPastor ? 'Global Senior Pastor' : user?.department?.departmentName}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <MapPinIcon color={THEME_CONFIG.lightGray} size={16} />
                                <Text className="text-muted-foreground font-medium">{user?.campus?.campusName}</Text>
                            </View>
                        </View>
                    </View>

                    <RollingStatusCard statusReport={previousMonthStatus} isFetching={isFetchingPreviousMonthStatus} />
                    <AttendanceHistory statusReport={userStatusHistory} isFetching={isFetchingUserStatusHistory} />

                    <StatusDescription />
                </ScrollView>
            </View>
        </ErrorBoundary>
    );
};

export default StatusReport;
