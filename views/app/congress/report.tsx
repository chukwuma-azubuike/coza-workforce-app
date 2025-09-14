import { Text } from '~/components/ui/text';
import React from 'react';
import {
    useGetDepartmentCongressAttendanceReportQuery,
    useGetLeadersCongressAttendanceReportQuery,
    useGetWorkersCongressAttendanceReportQuery,
} from '@store/services/attendance';
import useRole from '@hooks/role';
import { IService } from '@store/types';
import dayjs from 'dayjs';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import Loading from '@components/atoms/loading';
import { TouchableOpacity, View } from 'react-native';
import { CountUp } from 'use-count-up';
import useScreenFocus from '@hooks/focus';
import If from '@components/composite/if-container';
import PickerSelect from '~/components/ui/picker-select';
import { router } from 'expo-router';

export const CongressReportSummary: React.FC<{
    latestService?: IService;
    title: string;
    sessions: IService[];
    CongressId: string;
}> = React.memo(({ title, sessions, CongressId }) => {
    const {
        isHOD,
        isAHOD,
        isSuperAdmin,
        isCampusPastor,
        user: { department, campus },
    } = useRole();

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    const { data: attendanceReport, isLoading: attendanceReportLoading } =
        useGetDepartmentCongressAttendanceReportQuery(
            {
                CongressId,
                isCongress: true,
                departmentId: department?._id,
                serviceId: serviceId as string,
            },
            { skip: !serviceId, refetchOnMountOrArgChange: true }
        );

    const { data: leadersAttendance, isLoading: leadersReportLoading } = useGetLeadersCongressAttendanceReportQuery(
        {
            CongressId,
            isCongress: true,
            campusId: campus?._id,
            serviceId: serviceId as string,
        },
        { skip: !serviceId, refetchOnMountOrArgChange: true }
    );

    const { data: workersAttendance } = useGetWorkersCongressAttendanceReportQuery(
        {
            CongressId,
            isCongress: true,
            campusId: campus?._id,
            serviceId: serviceId as string,
        },
        { skip: !serviceId, refetchOnMountOrArgChange: true }
    );

    const goToAttendance = () => {
        router.push({ pathname: '/congress/congress-attendance', params: { CongressId } });
    };

    const goToTickets = () => {
        router.push('/tickets');
    };

    useScreenFocus({
        onFocus: () => {
            if (!!sessions?.length) {
                return setServiceId(sessions[0]?._id);
            }
        },
    });

    React.useEffect(() => {
        if (!!sessions?.length) {
            return setServiceId(sessions[0]?._id);
        }
    }, [sessions]);

    return (
        <View>
            <View className="px-2 justify-between flex-row items-center gap-8">
                <Text className="pt-8 pb-8 font-bold">{title}</Text>
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        labelKey="name"
                        items={sessions}
                        onValueChange={setService}
                        placeholder="Select Service"
                        customLabel={session => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`}
                    />
                </View>
            </View>
            <View className="p-6">
                {attendanceReportLoading || leadersReportLoading ? (
                    <Loading />
                ) : (
                    <View className="flex-row gap-x-10 flex-wrap items-center justify-center">
                        <If condition={isCampusPastor || isSuperAdmin}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={goToAttendance}
                                accessibilityRole="button"
                                className="flex-1"
                            >
                                <View>
                                    <View className="items-baseline flex-row justify-center">
                                        <Text className="text-primary !text-5xl font-semibold">
                                            <CountUp isCounting duration={2} end={leadersAttendance?.attendance || 0} />
                                        </Text>
                                        <Text className="text-muted-foreground font-semibold !text-2xl text-center">
                                            /
                                            <CountUp
                                                isCounting
                                                duration={2}
                                                end={leadersAttendance?.leaderUsers || 0}
                                            />
                                        </Text>
                                    </View>
                                    <View className="items-center flex-row gap-2">
                                        <Icon
                                            color={THEME_CONFIG.primaryLight}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text className="text-muted-foreground font-semibold">Leaders</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </If>
                        <If condition={isCampusPastor || isSuperAdmin}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={goToAttendance}
                                accessibilityRole="button"
                                className="flex-1"
                            >
                                <View>
                                    <View className="items-baseline flex-row justify-center">
                                        <Text className="text-primary !text-5xl font-semibold">
                                            <CountUp isCounting duration={2} end={workersAttendance?.attendance || 0} />
                                        </Text>
                                        <Text className="text-muted-foreground font-semibold !text-2xl text-center">
                                            /
                                            <CountUp
                                                isCounting
                                                duration={2}
                                                end={workersAttendance?.workerUsers || 0}
                                            />
                                        </Text>
                                    </View>
                                    <View className="items-center flex-row gap-2">
                                        <Icon
                                            color={THEME_CONFIG.primaryLight}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text className="text-muted-foreground font-semibold">Workers</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </If>
                        <If condition={isHOD || isAHOD}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={goToAttendance}
                                accessibilityRole="button"
                                className="flex-1"
                            >
                                <View>
                                    <View className="items-baseline flex-row justify-center">
                                        <Text className="text-primary !text-5xl font-semibold">
                                            <CountUp isCounting duration={2} end={attendanceReport?.attendance || 0} />
                                        </Text>
                                        <Text className="text-muted-foreground font-semibold !text-2xl text-center">
                                            /
                                            <CountUp
                                                isCounting
                                                duration={2}
                                                end={attendanceReport?.departmentUsers || 0}
                                            />
                                        </Text>
                                    </View>
                                    <View className="items-center flex-row gap-2">
                                        <Icon
                                            color={THEME_CONFIG.primaryLight}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text className="text-muted-foreground font-semibold">Members clocked in</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </If>
                        <View className="flex-1">
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={goToTickets}
                                accessibilityRole="button"
                            >
                                <View className="mx-auto">
                                    <Text className="text-rose-400 font-semibold !text-5xl text-center">
                                        <CountUp isCounting duration={2} end={attendanceReport?.tickets || 0} />
                                    </Text>
                                    <View className="items-center flex-row gap-1">
                                        <Icon
                                            name="ticket-confirmation-outline"
                                            color={THEME_CONFIG.rose}
                                            type="material-community"
                                            size={18}
                                        />
                                        <Text className="ml-1 text-muted-foreground">Tickets</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
});
