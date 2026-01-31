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

const StatusReport: React.FC = () => {
    const { user, isGlobalPastor } = useRole();
    const {
        data: userStatusHistory,
        refetch,
        isFetching,
    } = useGetUserStatusHistoryQuery({
        userId: user?._id,
        month: currentMonth,
        year: currentYear,
        monthsBack: 12,
    });
    console.log({ userStatusHistory });
    return (
        <ErrorBoundary>
            <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
                <ScrollView
                    className=""
                    refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
                >
                    <View className="py-10 px-4 border-b border-gray-200 dark:border-gray-800 shadow-sm items-center flex-row gap-6 bg-white dark:bg-black">
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

                    <RollingStatusCard />
                    <AttendanceHistory statusReport={userStatusHistory} />

                    <StatusDescription />
                </ScrollView>
            </View>
        </ErrorBoundary>
    );
};

export default StatusReport;
