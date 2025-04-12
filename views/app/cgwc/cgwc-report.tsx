import { View } from "react-native";
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { StatCardComponent } from '@components/composite/card';
import { BarChart, IStackedHistogramData, PieChart, StackedHistogram } from '@components/composite/chart';
import { GridItem, ResponsiveGrid } from '@components/layout/responsive-grid';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useScreenFocus from '@hooks/focus';
import useMediaQuery from '@hooks/media-query';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon, ScreenWidth } from '@rneui/base';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetGraphAttendanceReportsQuery } from '@store/services/reports';
import { useGetServicesQuery } from '@store/services/services';
import flattenedObject from '@utils/flattenObject';
import dayjs from 'dayjs';
import React from 'react';

const CGWCReport: React.FC<NativeStackScreenProps<ParamListBase>> = ({ route, navigation }) => {
    const params = route.params as { CGWCId: string };
    const CGWCId = params?.CGWCId;

    const [campusId, setCampusId] = React.useState<string>();
    const [serviceId, setServiceId] = React.useState<string>();
    const [userCategory, setUserCategory] = React.useState<string>('WORKERS');
    const { data: campuses, isLoading: campusLoading, isFetching: campusIsFetching } = useGetCampusesQuery();
    const {
        data: services,
        isLoading: servicesLoading,
        refetch: refetchServices,
        isUninitialized: servicesIsUninitialized,
    } = useGetServicesQuery({ CGWCId }, { skip: !CGWCId });

    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
        isFetching: attendanceReportFetching,
    } = useGetGraphAttendanceReportsQuery({
        CGWCId, //TODO: Restore after test
        serviceId,
        campusId,
    });
    const isLoadingOrFetching = attendanceReportLoading || attendanceReportFetching;
    const transformedAttendanceReport = React.useMemo(() => {
        if (!!attendanceReport) {
            const transformedReport = {
                present: attendanceReport.present,
                late: attendanceReport.late,
                absent: attendanceReport.absent,
            };
            return Object.values(transformedReport);
        }
        return [];
    }, [attendanceReport]);

    const totalEarly = React.useMemo(
        () =>
            attendanceReport?.present
                ?.map(present => {
                    return present.value;
                })
                .reduce((a, b) => a + b),
        [attendanceReport?.present]
    );

    const totalLate = React.useMemo(
        () =>
            attendanceReport?.late
                ?.map(late => {
                    return late.value;
                })
                .reduce((a, b) => a + b),
        [attendanceReport?.late]
    );

    const totalAbsent = React.useMemo(
        () =>
            attendanceReport?.absent
                ?.map(absent => {
                    return absent.value;
                })
                .reduce((a, b) => a + b),
        [attendanceReport?.absent]
    );

    const totalPresent = (totalLate || 0) + (totalEarly || 0);

    const totalTickets = React.useMemo(
        () =>
            attendanceReport?.ticket
                ?.map(ticket => {
                    return ticket.value;
                })
                .reduce((a, b) => a + b),
        [attendanceReport?.ticket]
    );

    const pastServices = React.useMemo(
        () => services?.filter(service => dayjs(service.clockInStartTime).unix() < dayjs().unix()),
        [services]
    );

    const validCategories = React.useMemo(
        () => attendanceReport?.ticketCategory.find(campusTicketCategories => !!campusTicketCategories.value?.length),
        [attendanceReport?.ticketCategory]
    );

    const categoryTemplate = React.useMemo(() => {
        if (!!validCategories) {
            return validCategories.value.map(category => {
                return {
                    [category.name]: 0,
                };
            });
        }
        return [];
    }, [validCategories]);

    const ticketCategories = React.useMemo(() => flattenedObject(categoryTemplate), [categoryTemplate]);

    const allTicketsCategorized = React.useMemo(() => {
        const ticketDump = ticketCategories;

        attendanceReport?.ticketCategory.forEach(campusTickets => {
            campusTickets.value.forEach(ticketValue => {
                ticketDump[ticketValue.name] = ticketDump[ticketValue.name] + ticketValue.campusTicketCount;
            });
        });

        return Object.entries(ticketDump).map((category, index) => {
            return {
                x: index + 1,
                y: category[1],
                label: category[0],
            };
        });
    }, [ticketCategories, attendanceReport]);

    const handleCampusChange = (value: string) => {
        setCampusId(value);
    };
    const handleService = (value: string) => {
        setServiceId(value);
    };
    const handleUserCategory = (value: string) => {
        setUserCategory(value);
    };

    const userCategories = [
        { key: 'WORKERS', label: 'Workers' },
        { key: 'LEADERS', label: 'Leaders' },
    ];

    const { isMobile } = useMediaQuery();

    const handleRefresh = () => {
        attendanceReportRefetch();
        !servicesIsUninitialized && refetchServices();
    };

    useScreenFocus({
        onFocus: handleRefresh,
    });

    return (
        <ViewWrapper pt={6} scroll onRefresh={handleRefresh} refreshing={false}>
            <ResponsiveGrid rowCount={3}>
                <SelectComponent
                    selectedValue={userCategory}
                    onValueChange={handleUserCategory}
                    w={isMobile ? ScreenWidth : ScreenWidth / 3.5}
                    dropdownIcon={
                        <View mr={2} space={2}>
                            <Icon type="entypo" name="chevron-small-down" color={THEME_CONFIG.lightGray} />
                        </View>
                    }
                >
                    {userCategories?.map((campus, index) => (
                        <SelectItemComponent
                            value={campus.key}
                            key={`campus-${index}`}
                            label={campus.label}
                            isLoading={campusLoading || campusIsFetching}
                        />
                    ))}
                </SelectComponent>
                <SelectComponent
                    selectedValue={campusId}
                    onValueChange={handleCampusChange}
                    w={isMobile ? ScreenWidth - 36 : ScreenWidth / 3.5}
                    dropdownIcon={
                        <View mr={2} space={2}>
                            <Icon type="entypo" name="chevron-small-down" color={THEME_CONFIG.lightGray} />
                        </View>
                    }
                >
                    <SelectItemComponent value={undefined as unknown as string} label={'All Campuses'} />
                    {campuses?.map((campus, index) => (
                        <SelectItemComponent
                            value={campus._id}
                            key={`campus-${index}`}
                            label={campus.campusName}
                            isLoading={campusLoading || campusIsFetching}
                        />
                    ))}
                </SelectComponent>
                <SelectComponent
                    selectedValue={serviceId}
                    placeholder="Choose session"
                    onValueChange={handleService}
                    w={isMobile ? ScreenWidth - 36 : ScreenWidth / 3.5}
                >
                    <SelectItemComponent
                        key="all-sessions"
                        label="All Sessions"
                        isLoading={servicesLoading}
                        value={undefined as unknown as string}
                    />
                    {(pastServices || [])?.map((service, index) => (
                        <SelectItemComponent
                            value={service._id}
                            key={`service-${index}`}
                            label={`${service.name} - ${
                                service.serviceTime ? dayjs(service.serviceTime).format('DD-MM-YYYY') : ''
                            }`}
                            isLoading={servicesLoading}
                        />
                    ))}
                </SelectComponent>
            </ResponsiveGrid>
            <ResponsiveGrid>
                <GridItem flexBasis="40%">
                    <View flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <StatCardComponent
                            label="Present"
                            iconName="groups"
                            iconType="material"
                            isLoading={isLoadingOrFetching}
                            value={totalPresent}
                            bold
                            width="48%"
                            iconColor={THEME_CONFIG.primary}
                            marginActive={false}
                            cardProps={{
                                _dark: { backgroundColor: 'black', borderColor: 'gray.800', borderWidth: '1' },
                            }}
                        />
                        <StatCardComponent
                            label="Late"
                            iconName="groups"
                            iconType="material"
                            isLoading={isLoadingOrFetching}
                            value={totalLate}
                            bold
                            width="48%"
                            iconColor="orange"
                            marginActive={false}
                            cardProps={{
                                _dark: { backgroundColor: 'black', borderColor: 'gray.800', borderWidth: '1' },
                            }}
                        />
                    </View>
                    <View flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <StatCardComponent
                            label="Early"
                            iconName="groups"
                            iconType="material"
                            isLoading={isLoadingOrFetching}
                            value={totalEarly}
                            width="48%"
                            bold
                            marginActive={false}
                            cardProps={{
                                _dark: { backgroundColor: 'black', borderColor: 'gray.800', borderWidth: '1' },
                            }}
                        />
                        <StatCardComponent
                            label="Absent"
                            iconName="groups"
                            iconType="material"
                            isLoading={isLoadingOrFetching}
                            value={totalAbsent}
                            bold
                            width="48%"
                            iconColor={THEME_CONFIG.rose}
                            marginActive={false}
                            cardProps={{
                                _dark: { backgroundColor: 'black', borderColor: 'gray.800', borderWidth: '1' },
                            }}
                        />
                    </View>
                    <View flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <StatCardComponent
                            label="Number of Tickets"
                            iconType="material-community"
                            iconName="ticket-confirmation-outline"
                            iconColor={THEME_CONFIG.rose}
                            isLoading={isLoadingOrFetching}
                            value={totalTickets}
                            bold
                            width={['96%', '50%']}
                            marginActive={false}
                            cardProps={{
                                _dark: { backgroundColor: 'black', borderColor: 'gray.800', borderWidth: '1' },
                            }}
                        />
                    </View>
                </GridItem>
                <GridItem flexBasis="60%">
                    <StackedHistogram
                        stackColors={[THEME_CONFIG.primary, 'orange', THEME_CONFIG.rose]}
                        entityKey="campusName"
                        title="Attendance"
                        valueKey="value"
                        isLoading={isLoadingOrFetching}
                        data={transformedAttendanceReport as unknown as IStackedHistogramData}
                    />
                </GridItem>
            </ResponsiveGrid>
            <ResponsiveGrid rowCount={2}>
                <BarChart
                    horizontal
                    barColor={THEME_CONFIG.rose}
                    entityKey="campusName"
                    title="Campus Non-Compliance"
                    valueKey="value"
                    isLoading={isLoadingOrFetching}
                    data={attendanceReport?.ticket || []}
                />
                <PieChart
                    data={allTicketsCategorized}
                    title="Non-Compliance Categories"
                    isLoading={isLoadingOrFetching}
                />
            </ResponsiveGrid>
        </ViewWrapper>
    );
};

export default React.memo(CGWCReport);
