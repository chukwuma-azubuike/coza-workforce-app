import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Divider, FormControl, HStack, VStack } from 'native-base';
import { GlobalReportContext } from './context';
import { TouchableOpacity, View } from 'react-native';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import ViewWrapper from '@components/layout/viewWrapper';
import { IGlobalReport, IGlobalReportList, useGetGlobalReportListQuery } from '@store/services/reports';
import { useGetServicesQuery } from '@store/services/services';
import { IGHSubmittedReportForGSP, IService } from '@store/types';
import moment from 'moment';
import Utils from '@utils/index';
import useMediaQuery from '@hooks/media-query';
import If from '@components/composite/if-container';
import CampusReportDetails from './campusReportDetails';
import TextComponent from '@components/text';
import VStackComponent from '@components/layout/v-stack';
import { useGetGHSubmittedReportsByServiceIdQuery } from '@store/services/grouphead';
import BottomSheetComponent from '@components/composite/bottom-sheet';

export const GlobalReportListRow: React.FC<IGlobalReport> = props => {
    const navigation = useNavigation();
    const { isMobile } = useMediaQuery();
    const { serviceId, setCampusId, setCampusName } = React.useContext(GlobalReportContext);

    const handlePress = () => {
        setCampusId(props?.campusId);
        setCampusName(props?.campusName);

        if (isMobile) {
            navigation.navigate(
                'Campus Report' as never,
                { ...props, serviceId, campusName: props?.campusName } as never
            );
        }
    };

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <HStack
                p={2}
                px={4}
                my={1}
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <TextComponent>{props?.campusName.replace('Campus', '')}</TextComponent>
                <StatusTag>{props?.status as any}</StatusTag>
            </HStack>
        </TouchableOpacity>
    );
};

export const GHSubmittedReportListRowForGSP: React.FC<IGHSubmittedReportForGSP> = props => {
    const [isVisible, setIsVisible] = React.useState(false);

    const handlePress = () => {
        setIsVisible(!isVisible);
    };

    const ghName = `${props?.firstName} ${props?.lastName}`

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
            <HStack
                p={2}
                px={4}
                my={1}
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <TextComponent>{ghName}</TextComponent>
                <StatusTag>{props?.status as any}</StatusTag>
            </HStack>
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
    } = useGetServicesQuery({ limit: 40, page: 1 });

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => moment().unix() > moment(service.clockInStartTime).unix()),
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
        <ViewWrapper py={0} px={2} noPadding refreshing={isLoading || servicesLoading || isFetching}>
            <HStack flex={1}>
                <VStack w={isMobile ? '100%' : '33%'} flex={1} space={3} pt={4}>
                    <FormControl isRequired>
                        <SelectComponent
                            valueKey="_id"
                            selectedValue={serviceId}
                            placeholder="Select Service"
                            onValueChange={setService as any}
                            displayKey={['name', 'clockInStartTime']}
                            items={sortedServices || []}
                        >
                            {sortedServices?.map((service, index) => (
                                <SelectItemComponent
                                    value={service._id}
                                    key={`service-${index}`}
                                    label={`${service.name} - ${moment(service.clockInStartTime).format(
                                        'Do MMM YYYY'
                                    )}`}
                                />
                            ))}
                        </SelectComponent>
                    </FormControl>
                    <VStackComponent>
                        <View style={{ height: '65%' }}>
                            <TextComponent bold>Campus Reports</TextComponent>
                            <FlatListComponent
                                refreshing={isFetching}
                                columns={reportColumns}
                                onRefresh={handleRefresh}
                                isLoading={isLoading || isFetching}
                                data={campusReports as IGlobalReportList}
                            />
                        </View>
                        <Divider orientation="horizontal" />
                        <>
                            <TextComponent bold style={{ marginTop: 10 }}>
                                Group Head Reports
                            </TextComponent>
                            <FlatListComponent
                                refreshing={isFetching}
                                onRefresh={handleRefresh}
                                columns={ghReportColumns}
                                isLoading={ghIsLoading || ghIsFetching}
                                data={ghReports as Array<IGHSubmittedReportForGSP>}
                            />
                        </>
                    </VStackComponent>
                </VStack>
                <If condition={isTablet}>
                    <Divider orientation="vertical" height="100%" m={4} />
                    <Box w="67%">
                        <CampusReportDetails serviceId={serviceId} campusId={campusId} campusName={campusName} />
                    </Box>
                </If>
            </HStack>
        </ViewWrapper>
    );
};

export default GlobalReportDetails;
