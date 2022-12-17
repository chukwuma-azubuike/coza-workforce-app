import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import { StatCardComponent } from '../../../../components/composite/card';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { Icon, ListItem } from '@rneui/themed';
import { THEME_CONFIG } from '../../../../config/appConfig';

const WorkForceSummary: React.FC = () => {
    const [expandedWorkers, setExpandedWorkers] = React.useState<boolean>(true);
    const [expandedAttendance, setExpandedAttendance] =
        React.useState<boolean>(false);
    const [expandedGuests, setExpandedGuests] = React.useState<boolean>(false);
    const [expandedBusCount, setExpandedBusCount] =
        React.useState<boolean>(false);

    return (
        <ViewWrapper scroll flex={1}>
            <ListItem.Accordion
                content={
                    <>
                        <Icon
                            size={20}
                            name="globe"
                            type="font-awesome"
                            color={THEME_CONFIG.gray}
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text color="gray.500" fontSize="md">
                                Global Workforce
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderWidth: 0.2,
                    borderColor: THEME_CONFIG.veryLightGray,
                }}
                isExpanded={expandedWorkers}
                onPress={() => {
                    setExpandedWorkers(!expandedWorkers);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={1010}
                            label="Total"
                            suffix="+12%"
                            iconName="groups"
                            iconType="material"
                        />
                        <StatCardComponent
                            value={968}
                            label="Active"
                            suffix="+15%"
                            iconName="check-square"
                            iconType="feather"
                        />
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={836}
                            label="Present"
                            suffix="+25%"
                            iconName="event-available"
                            iconType="material"
                        />
                        <StatCardComponent
                            value={30}
                            label="Late"
                            suffix="-8%"
                            iconType="entypo"
                            iconName="back-in-time"
                            iconColor={THEME_CONFIG.rose}
                        />
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={56}
                            label="Absent"
                            suffix="-21%"
                            iconName="groups"
                            iconType="material"
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
                            color={THEME_CONFIG.gray}
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text color="gray.500" fontSize="md">
                                Service Attendance
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderBottomWidth: 0.2,
                    borderColor: THEME_CONFIG.veryLightGray,
                }}
                isExpanded={expandedAttendance}
                onPress={() => {
                    setExpandedAttendance(!expandedAttendance);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={56410}
                            label="Total"
                            suffix="+27%"
                            iconName="account-group"
                            iconType="material-community"
                        />
                        <StatCardComponent
                            value={26311}
                            label="Men"
                            suffix="+12%"
                            iconName="man-outline"
                            iconType="ionicon"
                        />
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={28010}
                            label="Women"
                            suffix="+12%"
                            iconName="woman-outline"
                            iconType="ionicon"
                        />
                        <StatCardComponent
                            value={2710}
                            label="Teenagers"
                            suffix="+17%"
                            iconName="child"
                            iconType="font-awesome"
                        />
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={710}
                            label="Children"
                            suffix="+12%"
                            iconName="child"
                            iconType="font-awesome"
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
                            color={THEME_CONFIG.gray}
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text color="gray.500" fontSize="md">
                                Guests Attendance
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderBottomWidth: 0.2,
                    borderColor: THEME_CONFIG.veryLightGray,
                }}
                isExpanded={expandedGuests}
                onPress={() => {
                    setExpandedGuests(!expandedGuests);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={2010}
                            label="First timers"
                            suffix="+22%"
                            iconName="badge"
                            iconType="simple-line-icon"
                        />
                        <StatCardComponent
                            value={1210}
                            label="New Converts"
                            suffix="+32%"
                            iconName="person-add-outline"
                            iconType="ionicon"
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
                            color={THEME_CONFIG.gray}
                            style={{ marginRight: 12 }}
                        />
                        <ListItem.Content>
                            <Text color="gray.500" fontSize="md">
                                Bus Count (Pick up)
                            </Text>
                        </ListItem.Content>
                    </>
                }
                containerStyle={{
                    borderBottomWidth: 0.2,
                    borderColor: THEME_CONFIG.veryLightGray,
                }}
                isExpanded={expandedBusCount}
                onPress={() => {
                    setExpandedBusCount(!expandedBusCount);
                }}
            >
                <VStack space={4} p={2} flex={1}>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={59}
                            label="Locations"
                            suffix="+9%"
                            iconName="location-outline"
                            iconType="ionicon"
                        />
                        <StatCardComponent
                            value={584}
                            label="Total Guests"
                            suffix="+12%"
                            iconName="child"
                            iconType="font-awesome"
                        />
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={427}
                            label="Adults"
                            suffix="+12%"
                            iconName="account-group"
                            iconType="material-community"
                        />
                        <StatCardComponent
                            value={59}
                            label="Chldren"
                            suffix="+12%"
                            iconName="child"
                            iconType="font-awesome"
                        />
                    </HStack>
                    <HStack justifyContent="space-between" px={2} space={3}>
                        <StatCardComponent
                            value={7040}
                            label="Cars"
                            suffix="+37%"
                            iconType="ionicon"
                            iconName="car-sport-outline"
                        />
                    </HStack>
                </VStack>
            </ListItem.Accordion>
        </ViewWrapper>
    );
};

export default WorkForceSummary;
