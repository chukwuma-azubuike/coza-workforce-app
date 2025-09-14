import { View } from 'react-native';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { useGetGraphAttendanceReportsQuery, useGetGSPReportQuery } from '@store/services/reports';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import dayjs from 'dayjs';
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
import PickerSelect from '~/components/ui/picker-select';

const TIME_RANGES = ['Weekly', 'Monthly', 'Quaterly'];

const ChurchGrowth: React.FC = () => {
    const { user } = useRole();
    const { data: campuses, isSuccess: campusIsSuccess, isLoading: campusesLoading } = useGetCampusesQuery();
    const { refetch: latestServiceRefetch } = useGetLatestServiceQuery(user?.campus?._id as string);
    const { data: services, isSuccess: servicesIsSuccess, isLoading: servicesLoading } = useGetServicesQuery({});

    const handleRefresh = () => {
        attendanceReportRefetch();
    };

    const [campusId, setCampusId] = React.useState<ICampus['_id']>('global');
    const [timeRange, setTimeRange] = React.useState<string>();

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

    React.useEffect(() => {
        sortedServices && setServiceId(sortedServices[0]._id);
    }, [sortedServices]);

    return (
        <>
            <View className="px-4 w-full static top-6 gap-6 mb-8">
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        value={campusId}
                        labelKey="campusName"
                        onValueChange={setCampus}
                        placeholder="Select Campus"
                        isLoading={campusesLoading}
                        items={sortedCampuses || []}
                    />
                </View>
                <View className="flex-1">
                    <PickerSelect
                        value={timeRange}
                        items={TIME_RANGES || []}
                        onValueChange={setTimeRange}
                        placeholder="Select Time Range"
                    />
                </View>
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        labelKey="name"
                        value={serviceId}
                        onValueChange={setService}
                        placeholder="Select Service"
                        isLoading={servicesLoading}
                        items={sortedServices || []}
                        customLabel={(service: IService) =>
                            `${service.name} - ${dayjs(service.clockInStartTime).format('DD MMM YYYY')}`
                        }
                    />
                </View>
            </View>
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
