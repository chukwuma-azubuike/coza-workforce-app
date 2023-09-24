import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { StatCardComponent } from '@components/composite/card';
import { BarChart, PieChart, StackedHistogram } from '@components/composite/chart';
import { ResponsiveGrid } from '@components/layout/responsive-grid';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon, ScreenHeight } from '@rneui/base';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetServicesQuery } from '@store/services/services';
import moment from 'moment';
import { Center, HStack, Stack } from 'native-base';
import React from 'react';

const CGWCReport: React.FC<NativeStackScreenProps<ParamListBase>> = () => {
    const DATA = [
        // Present
        [
            { campusName: 'guzape', value: 130 },
            { campusName: 'lagos', value: 142 },
            { campusName: 'mararaba', value: 165 },
            { campusName: 'gwarimpa', value: 190 },
            { campusName: 'maitama', value: 130 },
            { campusName: 'ilorin', value: 142 },
            { campusName: 'portHarcourt', value: 165 },
            { campusName: 'karu', value: 190 },
            { campusName: 'lugbe', value: 130 },
            { campusName: 'wuse', value: 142 },
            { campusName: 'gwagwalada', value: 165 },
            { campusName: 'kubwa', value: 190 },
        ],
        //Late
        [
            { campusName: 'guzape', value: 130 },
            { campusName: 'lagos', value: 172 },
            { campusName: 'mararaba', value: 195 },
            { campusName: 'gwarimpa', value: 120 },
            { campusName: 'maitama', value: 100 },
            { campusName: 'ilorin', value: 152 },
            { campusName: 'portHarcourt', value: 115 },
            { campusName: 'karu', value: 90 },
            { campusName: 'lugbe', value: 50 },
            { campusName: 'wuse', value: 42 },
            { campusName: 'gwagwalada', value: 95 },
            { campusName: 'kubwa', value: 90 },
        ],
        // Absent
        [
            { campusName: 'guzape', value: 130 },
            { campusName: 'lagos', value: 142 },
            { campusName: 'mararaba', value: 165 },
            { campusName: 'gwarimpa', value: 190 },
            { campusName: 'maitama', value: 130 },
            { campusName: 'ilorin', value: 142 },
            { campusName: 'portHarcourt', value: 165 },
            { campusName: 'karu', value: 190 },
            { campusName: 'lugbe', value: 130 },
            { campusName: 'wuse', value: 142 },
            { campusName: 'gwagwalada', value: 165 },
            { campusName: 'kubwa', value: 190 },
        ],
    ] as any;

    const tickets = [
        { campusName: 'guzape', value: 10 },
        { campusName: 'lagos', value: 12 },
        { campusName: 'mararaba', value: 15 },
        { campusName: 'gwarimpa', value: 10 },
        { campusName: 'maitama', value: 10 },
        { campusName: 'ilorin', value: 12 },
        { campusName: 'portHarcourt', value: 15 },
        { campusName: 'karu', value: 10 },
        { campusName: 'lugbe', value: 10 },
        { campusName: 'wuse', value: 12 },
        { campusName: 'gwagwalada', value: 15 },
        { campusName: 'kubwa', value: 10 },
    ];

    const ticketCategories = [
        { x: 1, y: 4, label: 'Sleeping' },
        { x: 2, y: 5, label: 'Talking' },
        { x: 3, y: 7, label: 'Use of Phone' },
    ];

    const [campusId, setCampusId] = React.useState<string>();
    const [serviceId, setServiceId] = React.useState<string>();
    const [userCategory, setUserCategory] = React.useState<string>('WORKERS');
    const { data: campuses, isLoading: campusLoading, isFetching: campusIsFetching } = useGetCampusesQuery();
    const { data: services, refetch: refetchServices, isLoading: servicesLoading } = useGetServicesQuery({});

    const pastServices = React.useMemo(
        () => services?.filter(service => moment(service.clockInStartTime).unix() < moment().unix()),
        [services]
    );

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

    return (
        <ViewWrapper pt={6} pb={40} scroll>
            <HStack w="100%" space={4} px={3} mb={4} >
                <SelectComponent
                    w={300}
                    selectedValue={userCategory}
                    onValueChange={handleUserCategory}
                    dropdownIcon={
                        <HStack mr={2} space={2}>
                            <Icon type="entypo" name="chevron-small-down" color={THEME_CONFIG.lightGray} />
                        </HStack>
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
                    w={300}
                    onValueChange={handleCampusChange}
                    selectedValue={campusId}
                    dropdownIcon={
                        <HStack mr={2} space={2}>
                            <Icon type="entypo" name="chevron-small-down" color={THEME_CONFIG.lightGray} />
                        </HStack>
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
                    w={300}
                    placeholder="Choose session"
                    selectedValue={serviceId}
                    onValueChange={handleService}
                >
                    <SelectItemComponent
                        key="all-sessions"
                        label="All Sessions"
                        value={undefined as unknown as string}
                    />
                    {pastServices?.map((service, index) => (
                        <SelectItemComponent
                            value={service._id}
                            key={`service-${index}`}
                            label={`${service.name} - ${
                                service.serviceTime ? moment(service.serviceTime).format('DD-MM-YYYY') : ''
                            }`}
                            isLoading={servicesLoading}
                        />
                    ))}
                </SelectComponent>
            </HStack>
            <ResponsiveGrid rowCount={2}>
                <Center height={ScreenHeight / 2}>
                    <Stack flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <StatCardComponent
                            label="Present"
                            iconName="groups"
                            iconType="material"
                            isLoading={false}
                            value={200}
                            bold
                            width="48%"
                            iconColor={THEME_CONFIG.primary}
                            marginActive={false}
                        />
                        <StatCardComponent
                            label="Late"
                            iconName="groups"
                            iconType="material"
                            isLoading={false}
                            value={25}
                            bold
                            width="48%"
                            iconColor="orange"
                            marginActive={false}
                        />
                    </Stack>
                    <Stack flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <StatCardComponent
                            label="Early"
                            iconName="groups"
                            iconType="material"
                            isLoading={false}
                            value={150}
                            width="48%"
                            bold
                            marginActive={false}
                        />
                        <StatCardComponent
                            label="Absent"
                            iconName="groups"
                            iconType="material"
                            isLoading={false}
                            value={25}
                            bold
                            width="48%"
                            iconColor={THEME_CONFIG.rose}
                            marginActive={false}
                        />
                    </Stack>
                    <Stack flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        <StatCardComponent
                            label="Number of Tickets"
                            iconName="groups"
                            iconType="material"
                            isLoading={false}
                            value={25}
                            bold
                            width={['100%', '50%']}
                            marginActive={false}
                        />
                    </Stack>
                </Center>
                <StackedHistogram
                    stackColors={[THEME_CONFIG.primary, 'orange', THEME_CONFIG.rose]}
                    entityKey="campusName"
                    title="Attendance"
                    valueKey="value"
                    data={DATA}
                />
            </ResponsiveGrid>
            <ResponsiveGrid rowCount={2}>
                <BarChart
                    horizontal
                    barColor={THEME_CONFIG.rose}
                    entityKey="campusName"
                    title="Non-Compliance"
                    valueKey="value"
                    data={tickets}
                />
                <PieChart data={ticketCategories} title="Non-Compliance Categories" />
            </ResponsiveGrid>
        </ViewWrapper>
    );
};

export default CGWCReport;

interface GSPCGWCAttendanceReport {
    present: [
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number }
    ];
    late: [
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number }
    ];
    absent: [
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number },
        { campusName: string; value: number }
    ];
}

type GSPCGWCTicketReport = [
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number },
    { campusName: string; value: number }
];

type GSPCGWCTicketCategoryReport = [
    { category: string; value: number },
    { category: string; value: number },
    { category: string; value: number },
    { category: string; value: number },
    { category: string; value: number }
];
