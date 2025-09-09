import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import React from 'react';
import { StatCardComponent } from '@components/composite/card';
import ViewWrapper from '@components/layout/viewWrapper';
import { Icon, ListItem } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { useGetGSPReportQuery } from '@store/services/reports';
import useAppColorMode from '@hooks/theme/colorMode';
import { useGetLatestServiceQuery } from '@store/services/services';
import dayjs from 'dayjs';
import { IAttendanceStatus, ICampus, IService, IUserReportType } from '@store/types';
import Utils from '@utils/index';
import useRole from '@hooks/role';
import { useGetCampusesQuery } from '@store/services/campus';
import { IUserReportProps } from '../../Workforce-management/user-reports';
import { router } from 'expo-router';
import PickerSelect from '~/components/ui/picker-select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { useColorScheme } from '~/lib/useColorScheme';

interface WorkforceSummaryProps {
    servicesIsSuccess: boolean;
    services: IService[];
}

const WorkForceSummary: React.FC<WorkforceSummaryProps> = ({ services, servicesIsSuccess }) => {
    const { user } = useRole();
    const { isDarkColorScheme: isDarkMode } = useColorScheme();

    const { data: campuses, isSuccess: campusIsSuccess, isLoading: campusesLoading } = useGetCampusesQuery();
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
        () => services && services.filter(service => dayjs().unix() > dayjs(service.clockInStartTime).unix()),
        [services, servicesIsSuccess]
    );

    const sortedCampuses = React.useMemo<ICampus[] | undefined>(
        () =>
            campuses && [
                { _id: 'global', campusName: 'Global' } as any,
                ...Utils.sortStringAscending(campuses, 'campusName'),
            ],
        [campusIsSuccess]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    const campusName = React.useMemo<ICampus['campusName'] | undefined>(
        () => sortedCampuses?.find(a => a._id === campusId)?.campusName ?? '',
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

            router.push({ pathname: '/workforce-summary/user-report', params: reportState as any });
        };

    return (
        <ViewWrapper scroll onRefresh={refresh} refreshing={gspReportIsLoading} className="flex-1 gap-4">
            <View className="px-1 justify-around static gap-4 w-full mb-4">
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        value={campusId}
                        labelKey="campusName"
                        placeholder="Select Campus"
                        onValueChange={setCampus}
                        isLoading={campusesLoading}
                        items={sortedCampuses || []}
                    />
                </View>
                <View className="flex-1">
                    <View className="flex-1">
                        <PickerSelect
                            valueKey="_id"
                            labelKey="name"
                            value={serviceId}
                            customLabel={(service: IService) =>
                                `${service.name} - ${dayjs(service.clockInStartTime).format('DD MMM YYYY')}`
                            }
                            onValueChange={setService}
                            placeholder="Select Service"
                            items={sortedServices || []}
                        />
                    </View>
                </View>
            </View>
            <Accordion type="single" collapsible className="w-full max-w-lg px-2" defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <View className="flex-row items-center flex-1">
                            <Icon
                                size={20}
                                name="globe"
                                type="font-awesome"
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                                style={{ marginRight: 12 }}
                            />
                            <ListItem.Content>
                                <Text>{campusName || campusId} Workforce</Text>
                            </ListItem.Content>
                        </View>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <View className="py-3 flex-row flex-wrap gap-4">
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
                        </View>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        <View className="flex-row items-center flex-1">
                            <Icon
                                size={20}
                                type="font-awesome"
                                name="calendar-check-o"
                                style={{ marginRight: 12 }}
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            />
                            <ListItem.Content>
                                <Text>{campusName || campusId} Service Attendance</Text>
                            </ListItem.Content>
                        </View>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <View className="py-3 flex-row flex-wrap gap-4">
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
                        </View>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>
                        <View className="flex-row items-center flex-1">
                            <Icon
                                size={20}
                                type="ionicon"
                                name="person-add"
                                style={{ marginRight: 12 }}
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            />
                            <ListItem.Content>
                                <Text>{campusName || campusId} Guests Attendance</Text>
                            </ListItem.Content>
                        </View>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <View className="py-3 flex-row flex-wrap gap-4">
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
                        </View>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>
                        <View className="flex-row items-center flex-1">
                            <Icon
                                size={20}
                                type="ionicon"
                                name="bus-outline"
                                style={{ marginRight: 12 }}
                                color={isDarkMode ? THEME_CONFIG.lightGray : THEME_CONFIG.darkGray}
                            />
                            <ListItem.Content>
                                <Text>{campusName || campusId} Bus Count (Pick up)</Text>
                            </ListItem.Content>
                        </View>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <View className="py-3 flex-row flex-wrap gap-4">
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
                        </View>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </ViewWrapper>
    );
};

export default React.memo(WorkForceSummary);
