import { FormControl, HStack } from 'native-base';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { useGetGraphAttendanceReportsQuery, useGetGSPReportQuery } from '@store/services/reports';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import moment from 'moment';
import { ICampus, IService } from '@store/types';
import Utils from '@utils/index';
import useRole from '@hooks/role';
import { useGetCampusesQuery } from '@store/services/campus';
import { LineChart } from '@components/composite/chart';
import { THEME_CONFIG } from '@config/appConfig';
import ChurchGrowthCards from './church-growth-cards';
import ChurchGrowthSummary from './church-growth-summary';
import { ScreenHeight } from '@rneui/base';
import { Col, Row } from '@components/composite/row';

const ChurchGrowth: React.FC = () => {
    const { user } = useRole();
    const { data: campuses, isSuccess: campusIsSuccess } = useGetCampusesQuery();
    const { refetch: latestServiceRefetch } = useGetLatestServiceQuery(user?.campus?._id as string);
    const { data: services, isSuccess: servicesIsSuccess } = useGetServicesQuery({});

    const handleRefresh = () => {
        attendanceReportRefetch();
    };

    const [campusId, setCampusId] = React.useState<ICampus['_id']>('global');
    const setCampus = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    const [serviceId, setServiceId] = React.useState<IService['_id']>('Global');
    const setService = (value: ICampus['_id']) => {
        setServiceId(value);
    };

    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
        isFetching: attendanceReportFetching,
    } = useGetGraphAttendanceReportsQuery({
        serviceId,
        campusId,
    });
    const isLoadingOrFetching = attendanceReportLoading || attendanceReportFetching;

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

    const TIME_RANGES = ['Weekly', 'Monthly', 'Quaterly'];

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    React.useEffect(() => {
        sortedServices && setServiceId(sortedServices[0]._id);
    }, [sortedServices]);

    return (
        <>
            <HStack justifyContent="space-around" w="100%" mb={4} space={10} px={4} position="static" top={3}>
                <FormControl isRequired w="30%">
                    <SelectComponent placeholder="Select Campus" selectedValue={campusId} onValueChange={setCampus}>
                        {sortedCampuses?.map((campus, index) => (
                            <SelectItemComponent key={index} label={campus.campusName} value={campus._id} />
                        ))}
                    </SelectComponent>
                </FormControl>
                <FormControl isRequired w="30%">
                    <SelectComponent placeholder="Select Time Range" selectedValue={campusId}>
                        {TIME_RANGES?.map((timeRange, index) => (
                            <SelectItemComponent key={`timeRange_${index}`} label={timeRange} value={timeRange} />
                        ))}
                    </SelectComponent>
                </FormControl>
                <FormControl isRequired w="30%">
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
            <Row style={{ marginVertical: 4, height: ScreenHeight / 2 }}>
                <Col sm={24} lg={10}>
                    <ChurchGrowthSummary />
                </Col>
                <Col sm={24} lg={14}>
                    <ChurchGrowthCards
                        isLoading={gspReportIsLoading}
                        guestAttendance={guestAttendance}
                        serviceAttendance={serviceAttendance}
                    />
                </Col>
            </Row>
            <ViewWrapper scroll>
                <LineChart
                    horizontal
                    barColor={THEME_CONFIG.rose}
                    entityKey="campusName"
                    title="Growth over time"
                    valueKey="value"
                    isLoading={isLoadingOrFetching}
                    data={attendanceReport?.ticket || []}
                />
            </ViewWrapper>
        </>
    );
};

export default React.memo(ChurchGrowth);
