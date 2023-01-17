import { HStack, Text, VStack } from 'native-base';
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

const WorkForceSummary: React.FC = () => {
    const [expandedWorkers, setExpandedWorkers] = React.useState<boolean>(true);
    const [expandedAttendance, setExpandedAttendance] =
        React.useState<boolean>(false);
    const [expandedGuests, setExpandedGuests] = React.useState<boolean>(false);
    const [expandedBusCount, setExpandedBusCount] =
        React.useState<boolean>(false);

    const { isDarkMode } = useAppColorMode();

    const {
        data: globaWorkforceData,
        refetch: globaWorkforceRefetch,
        isLoading: globaWorkforceIsLoading,
        error,
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

    return (
        <ViewWrapper
            scroll
            flex={1}
            onRefresh={refresh}
            refreshing={globaWorkforceIsLoading}
        >
            <ListItem.Accordion
                content={
                    <>
                        <Icon
                            size={20}
                            name="globe"
                            type="font-awesome"
                            color={
                                isDarkMode
                                    ? THEME_CONFIG.lightGray
                                    : THEME_CONFIG.darkGray
                            }
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text
                                fontSize="md"
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                            >
                                Global Workforce
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderWidth: 0.2,
                    borderColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : THEME_CONFIG.veryLightGray,
                    backgroundColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : 'white',
                }}
                isExpanded={expandedWorkers}
                onPress={() => {
                    setExpandedWorkers(!expandedWorkers);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                </VStack>
            </ListItem.Accordion>
            <ListItem.Accordion
                content={
                    <>
                        <Icon
                            size={20}
                            type="font-awesome"
                            name="calendar-check-o"
                            color={
                                isDarkMode
                                    ? THEME_CONFIG.lightGray
                                    : THEME_CONFIG.darkGray
                            }
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                                fontSize="md"
                            >
                                Service Attendance
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderWidth: 0.2,
                    borderColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : THEME_CONFIG.veryLightGray,
                    backgroundColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : 'white',
                }}
                isExpanded={expandedAttendance}
                onPress={() => {
                    setExpandedAttendance(!expandedAttendance);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            percent
                            label="Children"
                            suffix="+12"
                            iconName="child"
                            iconType="font-awesome"
                            value={serviceAttendanceData?.children}
                        />
                    </HStack>
                </VStack>
            </ListItem.Accordion>
            <ListItem.Accordion
                content={
                    <>
                        <Icon
                            size={20}
                            type="ionicon"
                            name="person-add"
                            color={
                                isDarkMode
                                    ? THEME_CONFIG.lightGray
                                    : THEME_CONFIG.darkGray
                            }
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                                fontSize="md"
                            >
                                Guests Attendance
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderWidth: 0.2,
                    borderColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : THEME_CONFIG.veryLightGray,
                    backgroundColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : 'white',
                }}
                isExpanded={expandedGuests}
                onPress={() => {
                    setExpandedGuests(!expandedGuests);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                </VStack>
            </ListItem.Accordion>
            <ListItem.Accordion
                content={
                    <>
                        <Icon
                            size={20}
                            type="ionicon"
                            name="bus-outline"
                            color={
                                isDarkMode
                                    ? THEME_CONFIG.lightGray
                                    : THEME_CONFIG.darkGray
                            }
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                                fontSize="md"
                            >
                                Bus Count (Pick up)
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderWidth: 0.2,
                    borderColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : THEME_CONFIG.veryLightGray,
                    backgroundColor: isDarkMode
                        ? THEME_CONFIG.darkGray
                        : 'white',
                }}
                isExpanded={expandedBusCount}
                onPress={() => {
                    setExpandedBusCount(!expandedBusCount);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
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
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            percent
                            label="Cars"
                            suffix="+37"
                            iconType="ionicon"
                            iconName="car-sport-outline"
                            value={carsSummaryData?.totalCars}
                        />
                    </HStack>
                </VStack>
            </ListItem.Accordion>
        </ViewWrapper>
    );
};

export default WorkForceSummary;
