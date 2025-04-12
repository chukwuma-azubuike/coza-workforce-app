import { Text } from "~/components/ui/text";
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Divider, FormControl } from 'native-base';
import { UserReportContext, UserReportProvider } from './context';
import { TouchableOpacity, View } from 'react-native';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '@hooks/focus';

const userReportColumns: IFlatListColumn[] = [
    {
        dataIndex: '_id',
        render: (_: IUserReportListRowProps, key) => <UserReportListRow key={key} {..._} />,
    },
];

export interface IUserReportListRowProps {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: IAttendance[];
}

const UserReportListRow: React.FC<IUserReportListRowProps> = props => {
    const navigation = useNavigation();
    const { isMobile } = useMediaQuery();
    const { setUserId } = React.useContext(UserReportContext);

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    if (isMobile) {
                        navigation.navigate('User Report Details' as never, { userId: elm?.user._id } as never);
                    }
                    setUserId(elm?.user._id);
                };

                return (
                    <TouchableOpacity
                        key={index}
                        delayPressIn={0}
                        activeOpacity={0.6}
                        onPress={handlePress}
                        style={{ width: '100%' }}
                        accessibilityRole="button"
                    >
                        <View p={2} alignItems="center" justifyContent="space-between">
                            <View space={3} alignItems="center" w="85%">
                                <AvatarComponent imageUrl={elm?.user?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <Text ellipsizeMode="tail" numberOfLines={1} w="72%" className="font-bold">
                                    {Utils.capitalizeFirstChar(elm?.user?.firstName)}{' '}
                                    {Utils.capitalizeFirstChar(elm?.user?.lastName)}
                                </Text>
                            </View>
                            {elm?.clockIn ? <Text>{dayjs(elm?.clockIn).format('h:mm A')}</Text> : null}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </>
    );
};

export interface IUserReportProps {
    headerTitle?: string;
    campusId: ICampus['_id'];
    status?: IUserReportType;
    serviceId: IService['_id'];
    service: 'attendance' | 'ticket';
}

const UserReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { campusId, status, serviceId, service } = props.route.params as IUserReportProps;
    const { isMobile, isTablet } = useMediaQuery();
    const navigation = useNavigation();

    const isTicket = service === 'ticket';
    const isAttendance = service === 'attendance';

    const { data: campuses } = useGetCampusesQuery();

    const sortedcampuses = React.useMemo<ICampus[] | undefined>(
        () =>
            campuses && [{ _id: 'global', campusName: 'Global' }, ...Utils.sortStringAscending(campuses, 'campusName')],
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

    const groupedAttendanceReport = React.useMemo(
        () => Utils.groupListByKey(attendanceReport, isGlobal ? 'campusName' : 'departmentName'),
        [attendanceReport]
    );

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

    const groupedTicketsReport = React.useMemo(
        () => Utils.groupListByKey(ticketReportWithCampusName, isGlobal ? 'campusName' : 'departmentName'),
        [ticketReportWithCampusName]
    );

    const isLoadingAttendance = attendanceIsLoading || attendanceIsFetching;
    const isLoadingTickets = ticketIsFetching || ticketIsLoading;

    const handleSetCampusId = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    useScreenFocus({
        onFocus: () => {
            setCampusId(campusId as string);
            navigation.setOptions({ headerTitle: `User ${isAttendance ? 'Attendance' : 'Ticket'} Report` });
        },
    });

    const attendanceUserId = !!attendanceReport?.length ? attendanceReport[0]?.user?._id : undefined;
    const ticketUserId = !!ticketsReport?.length ? ticketsReport[0]?.user?._id : undefined;
    const userId = isAttendance ? attendanceUserId : ticketUserId;

    return (
        <UserReportProvider>
            <ViewWrapper py={0} px={2} noPadding refreshing={isLoadingAttendance || isLoadingTickets}>
                <View flex={1}>
                    <View w={isMobile ? '100%' : '40%'} flex={1} space={3} pt={4}>
                        <FormControl isRequired>
                            <SelectComponent
                                valueKey="_id"
                                displayKey="campusName"
                                placeholder="Select Campus"
                                items={sortedcampuses || []}
                                selectedValue={campusIdUpdate}
                                onValueChange={handleSetCampusId as any}
                            >
                                {sortedcampuses?.map((campus, index) => (
                                    <SelectItemComponent
                                        value={campus._id}
                                        key={`service-${index}`}
                                        label={campus.campusName}
                                    />
                                ))}
                            </SelectComponent>
                        </FormControl>
                        <FlatListComponent
                            columns={userReportColumns}
                            isLoading={isLoadingAttendance || isLoadingTickets}
                            refreshing={isLoadingAttendance || isLoadingTickets}
                            data={isAttendance ? groupedAttendanceReport : groupedTicketsReport}
                        />
                    </View>
                    <If condition={isTablet}>
                        <Divider orientation="vertical" height="100%" m={4} />
                        <View w="60%">
                            <UserReportDetails userId={userId} />
                        </View>
                    </If>
                </View>
            </ViewWrapper>
        </UserReportProvider>
    );
};

export default UserReport;
