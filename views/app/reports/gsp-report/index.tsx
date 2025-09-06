import { Text } from '~/components/ui/text';
import React from 'react';
import { GlobalReportContext } from './context';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import ViewWrapper from '@components/layout/viewWrapper';
import { IGlobalReport, IGlobalReportList, useGetGlobalReportListQuery } from '@store/services/reports';
import { useGetServicesQuery } from '@store/services/services';
import { IGHSubmittedReportForGSP, IService } from '@store/types';
import dayjs from 'dayjs';
import Utils from '@utils/index';
import useMediaQuery from '@hooks/media-query';
import If from '@components/composite/if-container';
import CampusReportDetails from './campusReportDetails';
import { useGetGHSubmittedReportsByServiceIdQuery } from '@store/services/grouphead';
import BottomSheetComponent from '@components/composite/bottom-sheet';
import { router } from 'expo-router';
import { Separator } from '~/components/ui/separator';
import PickerSelect from '~/components/ui/picker-select';

export const GlobalReportListRow: React.FC<IGlobalReport> = props => {
    const { isMobile } = useMediaQuery();
    const { setCampusId, setCampusName } = React.useContext(GlobalReportContext);

    const handlePress = () => {
        setCampusId(props?.campusId);
        setCampusName(props?.campusName);

        if (isMobile) {
            router.push('/reports/campus-report');
        }
    };

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            className="w-full"
            activeOpacity={0.6}
            onPress={handlePress}
            accessibilityRole="button"
        >
            <View className="px-4 justify-between bg-gray-50 dark:bg-gray-900 items-center rounded-md my-1 p-2">
                <Text>{props?.campusName.replace('Campus', '')}</Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </View>
        </TouchableOpacity>
    );
};

export const GHSubmittedReportListRowForGSP: React.FC<IGHSubmittedReportForGSP> = props => {
    const [isVisible, setIsVisible] = React.useState(false);

    const handlePress = () => {
        setIsVisible(!isVisible);
    };

    const ghName = `${props?.firstName} ${props?.lastName}`;

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <BottomSheetComponent
                title={ghName}
                isVisible={isVisible}
                toggleBottomSheet={handlePress}
                content={props.submittedReport}
            />
            <View className="px-4 py-2 my-1 rounded-md bg-gray-50 dark:bg-gray-900 items-center justify-between">
                <Text>{ghName}</Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </View>
        </TouchableOpacity>
    );
};

interface IGlobalReportPayload {
    serviceId?: string;
}

const reportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'createdAt',
        render: (_: IGlobalReport, key) => <GlobalReportListRow key={key} {..._} />,
    },
];

const ghReportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'createdAt',
        render: (_: IGHSubmittedReportForGSP, key) => <GHSubmittedReportListRowForGSP key={key} {..._} />,
    },
];

const GlobalReportDetails: React.FC<IGlobalReportPayload> = props => {
    const {
        data: services,
        isLoading: servicesLoading,
        isSuccess: servicesIsSuccess,
    } = useGetServicesQuery({ limit: 100, page: 1 });

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => dayjs().unix() > dayjs(service.clockInStartTime).unix()),
        [services, servicesIsSuccess]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    const { setServiceId, serviceId } = React.useContext(GlobalReportContext);

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    const {
        refetch,
        isLoading,
        isFetching,
        isUninitialized,
        data: campusReports,
    } = useGetGlobalReportListQuery({ serviceId }, { refetchOnMountOrArgChange: true, skip: !serviceId });

    const {
        data: ghReports,
        refetch: ghRefetch,
        isLoading: ghIsLoading,
        isFetching: ghIsFetching,
        isUninitialized: ghIsUninitialized,
    } = useGetGHSubmittedReportsByServiceIdQuery(serviceId);

    const handleRefresh = () => {
        if (serviceId) {
            !isUninitialized && refetch();
            !ghIsUninitialized && ghRefetch();
        }
    };

    React.useEffect(() => {
        if (!serviceId && sortedServices) {
            setServiceId(sortedServices[0]._id);
        }
    }, [serviceId, services]);

    const { isMobile, isTablet } = useMediaQuery();
    const { campusId, campusName } = React.useContext(GlobalReportContext);

    return (
        <ViewWrapper
            scroll
            noPadding
            className="py-4 px-2 flex-1"
            refreshing={isLoading || servicesLoading || isFetching}
        >
            <PickerSelect
                valueKey="_id"
                labelKey="name"
                value={serviceId}
                onValueChange={setService}
                items={sortedServices || []}
                placeholder="Select Service"
                customLabel={service => `${service.name} - ${dayjs(service.clockInStartTime).format('DD MMM YYYY')}`}
            />
            <View className="gap-4 pt-4 px-1 flex-1">
                <Text className="font-bold mt-2">Campus Reports</Text>
                <FlatListComponent
                    refreshing={isFetching}
                    columns={reportColumns}
                    onRefresh={handleRefresh}
                    isLoading={isLoading || isFetching}
                    data={campusReports as IGlobalReportList}
                />
                <Separator orientation="horizontal" className="my-4" />
                <Text className="font-bold">Group Head Reports</Text>
                <FlatListComponent
                    refreshing={isFetching}
                    onRefresh={handleRefresh}
                    columns={ghReportColumns}
                    isLoading={ghIsLoading || ghIsFetching}
                    data={ghReports as Array<IGHSubmittedReportForGSP>}
                />
            </View>
            <If condition={isTablet}>
                <Separator orientation="vertical" className="h-full m-4" />
                <View className="w-4/6">
                    <CampusReportDetails serviceId={serviceId} campusId={campusId} campusName={campusName} />
                </View>
            </If>
        </ViewWrapper>
    );
};

export default GlobalReportDetails;
