import React from 'react';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Box, Divider, FormControl, HStack, Text, VStack } from 'native-base';
import { UserReportContext, UserReportProvider } from './context';
import { Appearance, TouchableNativeFeedback } from 'react-native';
import { SelectComponent, SelectItemComponent } from '../../../../components/atoms/select';
import FlatListComponent, { IFlatListColumn } from '../../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../../config/appConfig';
import useAppColorMode from '../../../../hooks/theme/colorMode';
import {
    IAttendance,
    IAttendanceStatus,
    ICampus,
    IService,
    ITicket,
    IUserReport,
    IUserReportType,
} from '../../../../store/types';
import moment from 'moment';
import Utils from '../../../../utils';
import useMediaQuery from '../../../../hooks/media-query';
import If from '../../../../components/composite/if-container';
import AvatarComponent from '../../../../components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '../../../../constants';
import { useGetCampusesQuery } from '../../../../store/services/campus';
import UserReportDetails from './UserReportDetails';
import { useGetAttendanceQuery } from '../../../../store/services/attendance';
import { useGetTicketsQuery } from '../../../../store/services/tickets';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '../../../../hooks/focus';

// interface IPermissionListRowProps extends IUserReportContext {
//     type: 'own' | 'team' | 'campus';
//     '0'?: string;
//     '1'?: IUserReport[];
// }

// const PermissionListRow: React.FC<IPermissionListRowProps> = props => {
//     const navigation = useNavigation();

//     const { type } = props;

//     const { isLightMode } = useAppColorMode();

//     return (
//         <ErrorBoundary>
//             {props[1]?.map((elm, index) => {
//                 const handlePress = () => {
//                     navigation.navigate('Permission Details' as never, elm as never);
//                 };

//                 const { _id, firstName, lastName, department, pictureUrl } = elm;

//                 return (
//                     <TouchableNativeFeedback
//                         disabled={false}
//                         delayPressIn={0}
//                         onPress={handlePress}
//                         accessibilityRole="button"
//                         background={TouchableNativeFeedback.Ripple(
//                             isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
//                             false,
//                             220
//                         )}
//                         key={index}
//                         style={{ paddingHorizontal: 20 }}
//                     >
//                         <HStack py={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
//                             <HStack space={3} alignItems="center">
//                                 <AvatarComponent imageUrl={pictureUrl || AVATAR_FALLBACK_URL} />
//                                 <VStack justifyContent="space-between">
//                                     {type === 'own' && (
//                                         <>
//                                             <Text bold fontSize="sm" color="gray.400">
//                                                 {`${firstName} ${lastName}`}
//                                             </Text>
//                                             <Text fontSize="sm" color="gray.400">
//                                                 {department?.departmentName}
//                                             </Text>
//                                         </>
//                                     )}
//                                 </VStack>
//                             </HStack>
//                             <Text fontSize="sm" color="gray.400">
//                                 {moment().format('HH:MM')}
//                             </Text>
//                         </HStack>
//                     </TouchableNativeFeedback>
//                 );
//             })}
//         </ErrorBoundary>
//     );
// };

// const attendanceColumns: IFlatListColumn[] = [
//     {
//         title: 'Date',
//         dataIndex: 'date',
//         render: (elm: IAttendance, key) => {
//             return (
//                 <Box
//                     pb={1}
//                     size="52px"
//                     borderWidth={0.2}
//                     key={`date-${key}`}
//                     borderColor={isLightMode ? 'gray.700' : 'gray.500'}
//                 >
//                     <Center pt={0}>
//                         <Text bold fontSize={14} color={isLightMode ? 'gray.700' : 'gray.300'}>
//                             {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
//                         </Text>
//                         <Text bold color={isLightMode ? 'gray.700' : 'gray.300'} fontSize={10}>
//                             {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
//                         </Text>
//                         <Text bold color={isLightMode ? 'gray.700' : 'gray.300'} fontSize={10}>
//                             {moment(elm.createdAt).format('MMMM').substring(0, 3)} /{' '}
//                             {moment(elm.createdAt).format('YY')}
//                         </Text>
//                     </Center>
//                 </Box>
//             );
//         },
//     },
//     {
//         title: 'Clock In',
//         dataIndex: 'clockIn',
//         render: (elm: IAttendance, key) => (
//             <HStack key={`clockin-${key}`} alignItems="center" minWidth={88}>
//                 <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
//                 <Text
//                     _dark={{
//                         color: elm.clockIn ? 'green.300' : 'red.300',
//                     }}
//                     color={elm.clockIn ? 'green.500' : 'red.500'}
//                 >
//                     {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
//                 </Text>
//             </HStack>
//         ),
//     },
//     {
//         title: 'Clock Out',
//         dataIndex: 'clockOut',
//         render: (elm: IAttendance, key) => (
//             <HStack key={`clockout-${key}`} alignItems="center" minWidth={88}>
//                 <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
//                 <Text
//                     color="gray.500"
//                     _dark={{
//                         color: 'warmGray.200',
//                     }}
//                 >
//                     {elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}
//                 </Text>
//             </HStack>
//         ),
//     },
//     {
//         title: 'Service hrs',
//         dataIndex: 'hours',
//         render: (elm: IAttendance, key) => (
//             <Text
//                 key={`hours-${key}`}
//                 _dark={{
//                     color: 'warmGray.50',
//                 }}
//                 color="gray.500"
//                 textAlign="center"
//             >
//                 {elm?.clockOut ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins : '--:--'}
//             </Text>
//         ),
//     },
// ];

// interface TicketListRowProps extends ITicket {
//     '0'?: string;
//     '1'?: ITicket[];
// }

// export const TicketListRow: React.FC<TicketListRowProps> = props => {
//     const { isLightMode } = useAppColorMode();

//     return (
//         <>
//             {props[1]?.map((elm, index) => {
//                 const handlePress = () => {
//                     // Open Modal
//                 };

//                 const { status, category, user, departmentName } = elm;

//                 return (
//                     <TouchableNativeFeedback
//                         disabled={false}
//                         delayPressIn={0}
//                         onPress={handlePress}
//                         accessibilityRole="button"
//                         background={TouchableNativeFeedback.Ripple(
//                             isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
//                             false,
//                             220
//                         )}
//                         key={index}
//                         style={{ paddingHorizontal: 20 }}
//                     >
//                         <HStack py={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
//                             <HStack space={3} alignItems="center">
//                                 <AvatarComponent imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
//                                 <VStack justifyContent="space-between">
//                                     <Text fontSize="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.600' }}>
//                                         {Utils.capitalizeFirstChar(category?.categoryName)}
//                                     </Text>
//                                     <Text fontSize="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.600' }}>
//                                         {Utils.truncateString(departmentName)}
//                                     </Text>
//                                 </VStack>
//                             </HStack>
//                             <StatusTag>{status}</StatusTag>
//                         </HStack>
//                     </TouchableNativeFeedback>
//                 );
//             })}
//         </>
//     );
// };

// interface IUserReportListRowProps extends IUserReport {}

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
    const { isLightMode } = useAppColorMode();
    const { isMobile } = useMediaQuery();
    const { setUserId, userId } = React.useContext(UserReportContext);

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    if (isMobile) {
                        navigation.navigate('User Profile' as never, props as never);
                    }
                    setUserId(elm?.user._id);
                };

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                            false,
                            220
                        )}
                        style={{ paddingHorizontal: 20 }}
                    >
                        <HStack p={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={elm?.user?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <Text bold>
                                    {Utils.capitalizeFirstChar(elm?.user?.firstName)}{' '}
                                    {Utils.capitalizeFirstChar(elm?.user?.lastName)}
                                </Text>
                            </HStack>
                            <Text>{moment(elm?.clockIn).format('HH:MM A')}</Text>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </>
    );
};

export interface IUserReportProps {
    campusId: ICampus['_id'];
    status: IUserReportType;
    serviceId: IService['_id'];
    type: 'attendance' | 'ticket';
}

const UserReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { campusId, status, serviceId, type } = props.route.params as IUserReportProps;
    const { isMobile, isTablet } = useMediaQuery();

    const isTicket = type === 'ticket';
    const isAttendance = type === 'attendance';

    const { data: campuses, isLoading: campusesLoading } = useGetCampusesQuery();

    const sortedcampuses = React.useMemo<ICampus[] | undefined>(
        () => campuses && Utils.sortStringAscending(campuses, 'campusName'),
        [campuses]
    );

    const [campusIdUpdate, setCampusId] = React.useState<ICampus['_id']>(campusId);

    const {
        data: attendanceReport,
        isLoading: attendanceIsLoading,
        isFetching: attendanceIsFetching,
        isUninitialized: attendanceIsUninitialized,
    } = useGetAttendanceQuery(
        { campusId: campusIdUpdate, serviceId, status },
        { refetchOnMountOrArgChange: true, skip: !isAttendance }
    );

    const groupedAttendanceReport = React.useMemo(
        () => Utils.groupListByKey(attendanceReport, 'departmentName'),
        [attendanceReport]
    );

    const {
        data: ticketsReport,
        isLoading: ticketIsLoading,
        isFetching: ticketIsFetching,
        isUninitialized: ticketIsUninitialized,
    } = useGetTicketsQuery(
        { campusId: campusIdUpdate, serviceId },
        { refetchOnMountOrArgChange: true, skip: !isTicket }
    );

    const groupedTicketsReport = React.useMemo(
        () => Utils.groupListByKey(ticketsReport, 'departmentName'),
        [ticketsReport]
    );

    const isLoadingAttendance = attendanceIsLoading || attendanceIsFetching;
    const isLoadingTickets = ticketIsFetching || ticketIsLoading;

    const handleSetCampusId = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    useScreenFocus({
        onFocus: () => {
            setCampusId(campusId);
        },
    });

    const attendanceUserId = attendanceReport && attendanceReport[0]?.user?._id;
    const ticketUserId = ticketsReport && ticketsReport[0]?.user?._id;
    const userId = isAttendance ? attendanceUserId : ticketUserId;

    return (
        <UserReportProvider>
            <ViewWrapper py={0} px={2} noPadding refreshing={isLoadingAttendance || isLoadingTickets}>
                <HStack flex={1}>
                    <VStack w={isMobile ? '100%' : '33%'} flex={1} space={3} pt={4}>
                        <FormControl isRequired>
                            <SelectComponent
                                placeholder="Select Campus"
                                selectedValue={campusIdUpdate}
                                onValueChange={handleSetCampusId}
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
                    </VStack>
                    <If condition={isTablet}>
                        <Divider orientation="vertical" height="100%" m={4} />
                        <Box w="67%">
                            <UserReportDetails userId={userId} />
                        </Box>
                    </If>
                </HStack>
            </ViewWrapper>
        </UserReportProvider>
    );
};

export default UserReport;
