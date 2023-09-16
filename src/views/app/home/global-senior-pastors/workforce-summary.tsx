import { FormControl, HStack, Stack, Text } from 'native-base';
import React from 'react';
import { StatCardComponent } from '@components/composite/card';
import ViewWrapper from '@components/layout/viewWrapper';
import { Icon, ListItem } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { useGetGSPReportQuery } from '@store/services/reports';
import useAppColorMode from '@hooks/theme/colorMode';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { useGetLatestServiceQuery } from '@store/services/services';
import moment from 'moment';
import { IAttendanceStatus, ICampus, IService, IUserReportType } from '@store/types';
import Utils from '@utils';
import useRole from '@hooks/role';
import { useGetCampusesQuery } from '@store/services/campus';
import { useNavigation } from '@react-navigation/native';
import { IUserReportProps } from '../../workforce-management/user-reports';

interface WorkforceSummaryProps {
    servicesIsSuccess: boolean;
    services: IService[];
}

const WorkForceSummary: React.FC<WorkforceSummaryProps> = ({ services, servicesIsSuccess }) => {
    const { navigate } = useNavigation();
    const [expandedWorkers, setExpandedWorkers] = React.useState<boolean>(true);
    const [expandedAttendance, setExpandedAttendance] = React.useState<boolean>(false);
    const [expandedGuests, setExpandedGuests] = React.useState<boolean>(false);
    const [expandedBusCount, setExpandedBusCount] = React.useState<boolean>(false);

    const { user } = useRole();
    const { isDarkMode } = useAppColorMode();

    const { data: campuses, isSuccess: campusIsSuccess } = useGetCampusesQuery();
    const { refetch: latestServiceRefetch } = useGetLatestServiceQuery(user?.campus?._id as string);

    const [campusId, setCampusId] = React.useState<ICampus['_id']>('global');
    const setCampus = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    const [serviceId, setServiceId] = React.useState<IService['_id']>('Global');
    const setService = (value: ICampus['_id']) => {
        setServiceId(value);
    };

    const {
        data: gspReport,
        refetch,
        isLoading,
        isFetching,
    } = useGetGSPReportQuery(
        { serviceId, campusId: campusId === 'global' ? undefined : campusId },
        { refetchOnMountOrArgChange: true }
    );

    const gspReportIsLoading = isLoading || isFetching;

    const refresh = () => {
        refetch();
        latestServiceRefetch();
    };

    const workers = gspReport?.workers;
    const busCount = gspReport?.busCount;
    const guestAttendance = gspReport?.guestAttendance;
    const serviceAttendance = gspReport?.serviceAttendance;

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => moment().unix() > moment(service.clockInStartTime).unix()),
        [services, servicesIsSuccess]
    );

    const sortedCampuses = React.useMemo<ICampus[] | undefined>(
        () =>
            campuses && [{ _id: 'global', campusName: 'Global' }, ...Utils.sortStringAscending(campuses, 'campusName')],
        [campusIsSuccess]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    const campusName = React.useMemo<ICampus['campusName'] | undefined>(
        () => sortedCampuses?.find(a => a._id === campusId)?.campusName,
        [sortedCampuses, campusId]
    );

    React.useEffect(() => {
        sortedServices && setServiceId(sortedServices[0]._id);
    }, [sortedServices]);

    const handlePressCard =
        ({ status, service }: { status?: IUserReportType; service: 'attendance' | 'ticket' }) =>
        () => {
            const reportState: IUserReportProps = {
                status,
                service,
                campusId,
                serviceId,
                headerTitle: `User Report - ${Utils.capitalizeFirstChar(service)}`,
            };

            navigate('User Report' as never, reportState as never);
        };

    return (
        <>
            <HStack justifyContent="space-around" w="100%" mb={4} space={10} px={4} position="static" top={3}>
                <FormControl isRequired w="50%">
                    <SelectComponent placeholder="Select Campus" selectedValue={campusId} onValueChange={setCampus}>
                        {sortedCampuses?.map((campus, index) => (
                            <SelectItemComponent key={index} label={campus.campusName} value={campus._id} />
                        ))}
                    </SelectComponent>
                </FormControl>
                <FormControl isRequired w="50%">
                    <SelectComponent placeholder="Select Service" selectedValue={serviceId} onValueChange={setService}>
                        {sortedServices?.map((service, index) => (
                            <SelectItemComponent
                                value={service._id}
                                key={`service-${index}`}
                                label={`${service.name} - ${moment(service.clockInStartTime).format('Do MMM YYYY')}`}
                            />
                        ))}
                    </SelectComponent>
                </FormControl>
            </HStack>
            <ViewWrapper scroll onRefresh={refresh} refreshing={gspReportIsLoading}>
                <ListItem.Accordion
                    content={
                        <>
                            <Icon
                                size={20}
                                name="globe"
                                type="font-awesome"
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                                style={{ marginRight: 12 }}
                            />
                            <ListItem.Content>
                                <Text fontSize="md" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                                    {`${campusName ? campusName : ''} Workforce`}
                                </Text>
                            </ListItem.Content>
                        </>
                    }
                    containerStyle={{
                        borderWidth: 0.2,
                        borderColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray,
                        backgroundColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryVeryLightGray,
                    }}
                    isExpanded={expandedWorkers}
                    onPress={() => {
                        setExpandedWorkers(!expandedWorkers);
                    }}
                    expandIcon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                    icon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            style={{ marginRight: 12 }}
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                        />
                    }
                >
                    <Stack py={3} flexDirection="row" flexWrap="wrap">
                        <StatCardComponent
                            // percent
                            label="Total"
                            // suffix="+12"
                            iconName="groups"
                            iconType="material"
                            isLoading={gspReportIsLoading}
                            value={workers?.totalWorkers}
                        />
                        <StatCardComponent
                            // percent
                            label="Active"
                            // suffix="+15"
                            iconType="feather"
                            iconName="check-square"
                            isLoading={gspReportIsLoading}
                            value={workers?.activeWorkers}
                        />
                        <StatCardComponent
                            // percent
                            label="Present"
                            // suffix="+25"
                            iconType="material"
                            iconName="event-available"
                            isLoading={gspReportIsLoading}
                            value={workers?.presentWorkers}
                            onPress={handlePressCard({ status: IAttendanceStatus.PRESENT, service: 'attendance' })}
                        />
                        <StatCardComponent
                            // percent
                            label="Late"
                            // suffix="-8"
                            iconType="entypo"
                            iconName="back-in-time"
                            value={workers?.lateWorkers}
                            iconColor={THEME_CONFIG.rose}
                            isLoading={gspReportIsLoading}
                            onPress={handlePressCard({ status: IAttendanceStatus.LATE, service: 'attendance' })}
                        />
                        <StatCardComponent
                            // percent
                            label="Absent"
                            // suffix="-21"
                            iconName="groups"
                            iconType="material"
                            isLoading={gspReportIsLoading}
                            value={workers?.absentWorkers}
                            iconColor={THEME_CONFIG.rose}
                            onPress={handlePressCard({ status: IAttendanceStatus.ABSENT, service: 'attendance' })}
                        />
                        <StatCardComponent
                            // percent
                            label="Tickets"
                            // suffix="-21"
                            value={workers?.tickets}
                            iconColor={THEME_CONFIG.rose}
                            iconType="material-community"
                            isLoading={gspReportIsLoading}
                            iconName="ticket-confirmation-outline"
                            onPress={handlePressCard({ service: 'ticket' })}
                        />
                    </Stack>
                </ListItem.Accordion>
                <ListItem.Accordion
                    content={
                        <>
                            <Icon
                                size={20}
                                type="font-awesome"
                                name="calendar-check-o"
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                                style={{ marginRight: 12 }}
                            />
                            <ListItem.Content>
                                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }} fontSize="md">
                                    {campusName || campusId} Service Attendance
                                </Text>
                            </ListItem.Content>
                        </>
                    }
                    containerStyle={{
                        borderWidth: 0.2,
                        borderColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray,
                        backgroundColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryVeryLightGray,
                    }}
                    isExpanded={expandedAttendance}
                    onPress={() => {
                        setExpandedAttendance(!expandedAttendance);
                    }}
                    expandIcon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                    icon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                >
                    <Stack py={3} flexDirection="row" flexWrap="wrap">
                        <StatCardComponent
                            // percent
                            label="Total"
                            // suffix="+27"
                            iconName="account-group"
                            iconType="material-community"
                            isLoading={gspReportIsLoading}
                            value={serviceAttendance?.totalAttenance}
                        />
                        <StatCardComponent
                            // percent
                            label="Men"
                            // suffix="+12"
                            iconType="ionicon"
                            iconName="man-outline"
                            isLoading={gspReportIsLoading}
                            value={serviceAttendance?.menAttendance}
                        />
                        <StatCardComponent
                            // percent
                            label="Women"
                            // suffix="+12"
                            iconName="woman-outline"
                            iconType="ionicon"
                            isLoading={gspReportIsLoading}
                            value={serviceAttendance?.womenAttendance}
                        />
                        <StatCardComponent
                            // percent
                            label="Teenagers"
                            // suffix="+17"
                            iconName="child"
                            iconType="font-awesome"
                            isLoading={gspReportIsLoading}
                            value={serviceAttendance?.teenagerAttendance}
                        />
                        <StatCardComponent
                            // percent
                            label="Children"
                            // suffix="+12"
                            iconName="child"
                            iconType="font-awesome"
                            isLoading={gspReportIsLoading}
                            value={serviceAttendance?.childrenAttendance}
                        />
                    </Stack>
                </ListItem.Accordion>
                <ListItem.Accordion
                    content={
                        <>
                            <Icon
                                size={20}
                                type="ionicon"
                                name="person-add"
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                                style={{ marginRight: 12 }}
                            />
                            <ListItem.Content>
                                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }} fontSize="md">
                                    {campusName || campusId} Guests Attendance
                                </Text>
                            </ListItem.Content>
                        </>
                    }
                    containerStyle={{
                        borderWidth: 0.2,
                        borderColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray,
                        backgroundColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryVeryLightGray,
                    }}
                    isExpanded={expandedGuests}
                    onPress={() => {
                        setExpandedGuests(!expandedGuests);
                    }}
                    expandIcon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                    icon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                >
                    <Stack py={3} flexDirection="row" flexWrap="wrap">
                        <StatCardComponent
                            // percent
                            label="First timers"
                            // suffix="+22"
                            iconName="badge"
                            iconType="simple-line-icon"
                            isLoading={gspReportIsLoading}
                            value={guestAttendance?.firstTimer}
                        />
                        <StatCardComponent
                            // percent
                            label="New Converts"
                            // suffix="+32"
                            iconName="person-add-outline"
                            iconType="ionicon"
                            isLoading={gspReportIsLoading}
                            value={guestAttendance?.newConvert}
                        />
                    </Stack>
                </ListItem.Accordion>
                <ListItem.Accordion
                    content={
                        <>
                            <Icon
                                size={20}
                                type="ionicon"
                                name="bus-outline"
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                                style={{ marginRight: 12 }}
                            />
                            <ListItem.Content>
                                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }} fontSize="md">
                                    {campusName || campusId} Bus Count (Pick up)
                                </Text>
                            </ListItem.Content>
                        </>
                    }
                    containerStyle={{
                        borderWidth: 0.2,
                        borderColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray,
                        backgroundColor: isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryVeryLightGray,
                    }}
                    isExpanded={expandedBusCount}
                    onPress={() => {
                        setExpandedBusCount(!expandedBusCount);
                    }}
                    expandIcon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                    icon={
                        <Icon
                            size={20}
                            type="ionicon"
                            name="chevron-down"
                            color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            style={{ marginRight: 12 }}
                        />
                    }
                >
                    <Stack py={3} flexDirection="row" flexWrap="wrap">
                        <StatCardComponent
                            // percent
                            label="Locations"
                            // suffix="+9"
                            iconName="location-outline"
                            iconType="ionicon"
                            isLoading={gspReportIsLoading}
                            value={busCount?.location}
                        />
                        <StatCardComponent
                            // percent
                            // suffix="+12"
                            label="Adults"
                            iconName="child"
                            iconType="font-awesome"
                            isLoading={gspReportIsLoading}
                            value={busCount?.totalAdult}
                        />
                        <StatCardComponent
                            // percent
                            label="Total Guests"
                            // suffix="+12"
                            iconName="account-group"
                            iconType="material-community"
                            isLoading={gspReportIsLoading}
                            value={busCount?.totalGuest}
                        />
                        <StatCardComponent
                            // percent
                            label="Chldren"
                            // suffix="+12"
                            iconName="account-group"
                            iconType="material-community"
                            isLoading={gspReportIsLoading}
                            value={busCount?.totalChildren}
                        />
                        <StatCardComponent
                            // percent
                            label="Cars"
                            // suffix="+37"
                            iconType="ionicon"
                            iconName="car-sport-outline"
                            isLoading={gspReportIsLoading}
                            value={busCount?.totalCars}
                        />
                    </Stack>
                </ListItem.Accordion>
            </ViewWrapper>
        </>
    );
};

export default WorkForceSummary;
