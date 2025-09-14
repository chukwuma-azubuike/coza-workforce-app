import { Text } from '~/components/ui/text';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { useNavigation } from '@react-navigation/native';
import { UserReportContext, UserReportProvider } from './context';
import { TouchableOpacity, View } from 'react-native';
import { IAttendance, ICampus, IService, IUserReportType } from '@store/types';
import dayjs from 'dayjs';
import Utils from '@utils/index';
import useMediaQuery from '@hooks/media-query';
import If from '@components/composite/if-container';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useGetCampusesQuery } from '@store/services/campus';
import UserReportDetails from './UserReportDetails';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { useGetTicketsQuery } from '@store/services/tickets';
import useScreenFocus from '@hooks/focus';
import { Separator } from '~/components/ui/separator';
import { router, useLocalSearchParams } from 'expo-router';
import PickerSelect from '~/components/ui/picker-select';
import SectionListComponent from '~/components/composite/section-list';
import { cn } from '~/lib/utils';

const UserReportListRow: React.FC<IAttendance> = elm => {
    const { isMobile } = useMediaQuery();
    const { setUserId, userId } = React.useContext(UserReportContext);

    const isFocused = userId === elm?.user?._id;

    const handlePress = () => {
        if (isMobile) {
            router.push({
                pathname: '/workforce-summary/user-report-details',
                params: { userId: elm?.user._id },
            });
        }
        setUserId(elm?.user._id);
    };

    return (
        <TouchableOpacity
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <View
                className={cn(
                    'p-4 border-border border mb-2 items-center justify-between flex-row rounded-lg',
                    isFocused && 'bg-muted-background'
                )}
            >
                <View className="gap-2">
                    <AvatarComponent alt="profile-pic" imageUrl={elm?.user?.pictureUrl || AVATAR_FALLBACK_URL} />
                    <Text className="font-bold">
                        {Utils.capitalizeFirstChar(elm?.user?.firstName)}{' '}
                        {Utils.capitalizeFirstChar(elm?.user?.lastName)}
                    </Text>
                </View>
                {elm?.clockIn ? <Text>{dayjs(elm?.clockIn).format('h:mm A')}</Text> : null}
            </View>
        </TouchableOpacity>
    );
};

export interface IUserReportProps {
    headerTitle?: string;
    campusId: ICampus['_id'];
    status?: IUserReportType;
    serviceId: IService['_id'];
    service: 'attendance' | 'ticket';
}

const UserReport: React.FC = () => {
    const { campusId, status, serviceId, service } = useLocalSearchParams() as unknown as IUserReportProps;
    const { isTablet } = useMediaQuery();
    const navigation = useNavigation();
    const { userId, setUserId } = React.useContext(UserReportContext);

    const isTicket = service === 'ticket';
    const isAttendance = service === 'attendance';

    const { data: campuses } = useGetCampusesQuery();

    const sortedcampuses = React.useMemo<ICampus[] | undefined>(
        () =>
            campuses && [
                { _id: 'global', campusName: 'Global' } as any,
                ...Utils.sortStringAscending(campuses, 'campusName'),
            ],
        [campuses]
    );

    const [campusIdUpdate, setCampusId] = React.useState<ICampus['_id']>(campusId as string);
    const isGlobal = campusIdUpdate === 'global';

    const attendanceParams = isGlobal ? { serviceId, status } : { campusId: campusIdUpdate, serviceId, status };
    const {
        data: attendanceReport,
        isLoading: attendanceIsLoading,
        isFetching: attendanceIsFetching,
    } = useGetAttendanceQuery({ ...attendanceParams }, { refetchOnMountOrArgChange: true, skip: !isAttendance });

    const ticketParams = isGlobal ? { serviceId } : { campusId: campusIdUpdate, serviceId };
    const {
        data: ticketsReport,
        isLoading: ticketIsLoading,
        isFetching: ticketIsFetching,
    } = useGetTicketsQuery(ticketParams, { refetchOnMountOrArgChange: true, skip: !isTicket });

    const ticketReportWithCampusName = React.useMemo(() => {
        return ticketsReport?.map(report => {
            return {
                ...report,
                campusName: report?.campus?.campusName,
            };
        });
    }, [ticketsReport]);

    const isLoadingAttendance = attendanceIsLoading || attendanceIsFetching;
    const isLoadingTickets = ticketIsFetching || ticketIsLoading;

    const handleSetCampusId = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    const attendanceUserId = !!attendanceReport?.length ? attendanceReport[0]?.user?._id : undefined;
    const ticketUserId = !!ticketsReport?.length ? ticketsReport[0]?.user?._id : undefined;

    const defaultUserId = attendanceUserId ?? ticketUserId;

    useScreenFocus({
        onFocus: () => {
            setCampusId(campusId as string);
            navigation.setOptions({ headerTitle: `User ${isAttendance ? 'Attendance' : 'Ticket'} Report` });
        },
    });

    return (
        <UserReportProvider>
            <ViewWrapper className="py-0 px-2 flex-1" noPadding refreshing={isLoadingAttendance || isLoadingTickets}>
                <View className="flex-1 md:flex-row">
                    <View className="flex-1 gap-2 pt-2">
                        <View>
                            <PickerSelect
                                valueKey="_id"
                                labelKey="campusName"
                                value={campusIdUpdate}
                                placeholder="Select Campus"
                                items={sortedcampuses || []}
                                onValueChange={handleSetCampusId as any}
                            />
                        </View>
                        <SectionListComponent
                            field="createdAt"
                            column={UserReportListRow}
                            isLoading={isLoadingAttendance || isLoadingTickets}
                            refreshing={isLoadingAttendance || isLoadingTickets}
                            data={isAttendance ? attendanceReport : ticketReportWithCampusName}
                            // field={isGlobal ? 'campusName' : 'departmentName'} //TODO: To be resolved
                            itemHeight={66.7}
                        />
                    </View>
                    <If condition={isTablet}>
                        <View className="flex-1 flex-row">
                            <Separator orientation="vertical" className="m-2" />
                            <UserReportDetails defaultUserId={defaultUserId} userId={userId} />
                        </View>
                    </If>
                </View>
            </ViewWrapper>
        </UserReportProvider>
    );
};

export default UserReport;
