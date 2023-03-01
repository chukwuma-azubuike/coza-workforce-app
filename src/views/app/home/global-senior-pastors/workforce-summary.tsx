import { FormControl, HStack, Stack, Text } from 'native-base';
import React from 'react';
import { StatCardComponent } from '../../../../components/composite/card';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { Icon, ListItem } from '@rneui/themed';
import { THEME_CONFIG } from '../../../../config/appConfig';
import {
    useGetGlobalWorkforceSummaryQuery,
    useGetGuestSummaryQuery,
    useGetBusSummaryQuery,
    useGetServiceAttendanceSummaryQuery,
    useGetCarsSummaryQuery,
} from '../../../../store/services/reports';
import useAppColorMode from '../../../../hooks/theme/colorMode';
import { SelectComponent, SelectItemComponent } from '../../../../components/atoms/select';
import { useGetCampusesQuery } from '../../../../store/services/campus';
import { useGetServicesQuery } from '../../../../store/services/services';
import moment from 'moment';
import { ICampus, IService } from '../../../../store/types';
import Utils from '../../../../utils';

const WorkForceSummary: React.FC = () => {
    const [expandedWorkers, setExpandedWorkers] = React.useState<boolean>(true);
    const [expandedAttendance, setExpandedAttendance] = React.useState<boolean>(false);
    const [expandedGuests, setExpandedGuests] = React.useState<boolean>(false);
    const [expandedBusCount, setExpandedBusCount] = React.useState<boolean>(false);

    const { isDarkMode } = useAppColorMode();

    const {
        data: globaWorkforceData,
        refetch: globaWorkforceRefetch,
        isLoading: globaWorkforceIsLoading,
    } = useGetGlobalWorkforceSummaryQuery();

    const {
        data: serviceAttendanceData,
        refetch: serviceAttendanceRefetch,
        isLoading: serviceAttendanceIsLoading,
    } = useGetServiceAttendanceSummaryQuery();

    const {
        data: guestSummaryData,
        refetch: guestSummaryRefetch,
        isLoading: guestSummaryIsLoading,
    } = useGetGuestSummaryQuery();

    const {
        data: busSummaryData,
        refetch: busSummaryRefetch,
        isLoading: busSummaryIsLoading,
    } = useGetBusSummaryQuery();

    const {
        data: carsSummaryData,
        refetch: carsSummaryRefetch,
        isLoading: carsSummaryIsLoading,
    } = useGetCarsSummaryQuery();

    const refresh = () => {
        globaWorkforceRefetch();
        serviceAttendanceRefetch();
        guestSummaryRefetch();
        busSummaryRefetch();
        carsSummaryRefetch();
    };

    const [icon, setIcon] = React.useState<{ name: string; type: string }>({
        type: 'ionicon',
        name: 'briefcase-outline',
    });

    const selectCategoryIcons = (key: string) => {
        switch (key) {
            case 'work':
                setIcon({
                    type: 'ionicon',
                    name: 'briefcase-outline',
                });
                break;
            case 'education':
                setIcon({
                    type: 'ionicon',
                    name: 'school-outline',
                });
                break;
            case 'medical':
                setIcon({
                    type: 'ionicon',
                    name: 'medical-outline',
                });
                break;
            case 'vacation':
                setIcon({
                    type: 'material-community',
                    name: 'beach',
                });
                break;
            case 'maternity':
                setIcon({
                    type: 'material-community',
                    name: 'mother-nurse',
                });
                break;
            case 'other':
                setIcon({
                    type: 'font-awesome',
                    name: 'sticky-note-o',
                });
                break;
            default:
                break;
        }
    };

    const { isLightMode } = useAppColorMode();

    const { data: campuses, error, isLoading: campusesLoading, isSuccess: campusIsSuccess } = useGetCampusesQuery();
    const { data: services, isSuccess: servicesIsSuccess } = useGetServicesQuery();

    const [campusId, setCampusId] = React.useState<ICampus['_id']>('Global');
    const setCampus = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    const [serviceId, setServiceId] = React.useState<IService['_id']>();
    const setService = (value: ICampus['_id']) => {
        setServiceId(value);
    };

    const sortedCampuses = React.useMemo<ICampus[] | undefined>(
        () =>
            campuses && [{ _id: 'Global', campusName: 'Global' }, ...Utils.sortStringAscending(campuses, 'campusName')],
        [campusIsSuccess]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => services && Utils.sortStringAscending(services, 'createdAt'),
        [servicesIsSuccess]
    );

    const campusName = React.useMemo<ICampus['campusName'] | undefined>(
        () => sortedCampuses?.find(a => a._id === campusId)?.campusName,
        [campusId]
    );

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
                                label={`${service.name} - ${moment(service.createdAt).format('Do MMM YYYY')}`}
                            />
                        ))}
                    </SelectComponent>
                </FormControl>
            </HStack>
            <ViewWrapper scroll onRefresh={refresh} refreshing={globaWorkforceIsLoading}>
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
                                    {`${campusName || campusId} Workforce`}
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
                            percent
                            label="Total"
                            suffix="+12"
                            iconName="groups"
                            iconType="material"
                            isLoading={globaWorkforceIsLoading}
                            value={globaWorkforceData?.totalWorkers}
                        />
                        <StatCardComponent
                            percent
                            label="Active"
                            suffix="+15"
                            iconName="check-square"
                            iconType="feather"
                            isLoading={globaWorkforceIsLoading}
                            value={globaWorkforceData?.activeWrokers}
                        />
                        <StatCardComponent
                            percent
                            label="Present"
                            suffix="+25"
                            iconName="event-available"
                            iconType="material"
                            isLoading={globaWorkforceIsLoading}
                            value={globaWorkforceData?.presentWorkers}
                        />
                        <StatCardComponent
                            percent
                            label="Late"
                            suffix="-8"
                            iconType="entypo"
                            iconName="back-in-time"
                            isLoading={globaWorkforceIsLoading}
                            value={globaWorkforceData?.lateWorkers}
                            iconColor={THEME_CONFIG.rose}
                        />
                        <StatCardComponent
                            percent
                            label="Absent"
                            suffix="-21"
                            iconName="groups"
                            iconType="material"
                            isLoading={globaWorkforceIsLoading}
                            value={globaWorkforceData?.absentWorkers}
                            iconColor={THEME_CONFIG.rose}
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
                            percent
                            label="Total"
                            suffix="+27"
                            iconName="account-group"
                            iconType="material-community"
                            value={serviceAttendanceData?.total}
                        />
                        <StatCardComponent
                            percent
                            label="Men"
                            suffix="+12"
                            iconName="man-outline"
                            iconType="ionicon"
                            value={serviceAttendanceData?.men}
                        />
                        <StatCardComponent
                            percent
                            label="Women"
                            suffix="+12"
                            iconName="woman-outline"
                            iconType="ionicon"
                            value={serviceAttendanceData?.women}
                        />
                        <StatCardComponent
                            percent
                            label="Teenagers"
                            suffix="+17"
                            iconName="child"
                            iconType="font-awesome"
                            value={serviceAttendanceData?.teenagers}
                        />
                        <StatCardComponent
                            percent
                            label="Children"
                            suffix="+12"
                            iconName="child"
                            iconType="font-awesome"
                            value={serviceAttendanceData?.children}
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
                            percent
                            label="First timers"
                            suffix="+22"
                            iconName="badge"
                            iconType="simple-line-icon"
                            value={guestSummaryData?.firstTimers}
                        />
                        <StatCardComponent
                            percent
                            label="New Converts"
                            suffix="+32"
                            iconName="person-add-outline"
                            iconType="ionicon"
                            value={guestSummaryData?.newConvert}
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
                            percent
                            label="Locations"
                            suffix="+9"
                            iconName="location-outline"
                            iconType="ionicon"
                            value={busSummaryData?.locations}
                        />
                        <StatCardComponent
                            percent
                            label="Total Guests"
                            suffix="+12"
                            iconName="child"
                            iconType="font-awesome"
                            value={busSummaryData?.locations}
                        />
                        <StatCardComponent
                            percent
                            label="Adults"
                            suffix="+12"
                            iconName="account-group"
                            iconType="material-community"
                            value={busSummaryData?.adult}
                        />
                        <StatCardComponent
                            percent
                            label="Chldren"
                            suffix="+12"
                            iconName="child"
                            iconType="font-awesome"
                            value={busSummaryData?.children}
                        />
                        <StatCardComponent
                            percent
                            label="Cars"
                            suffix="+37"
                            iconType="ionicon"
                            iconName="car-sport-outline"
                            value={carsSummaryData?.totalCars}
                        />
                    </Stack>
                </ListItem.Accordion>
            </ViewWrapper>
        </>
    );
};

export default WorkForceSummary;
