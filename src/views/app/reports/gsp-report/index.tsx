import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Divider, FormControl, HStack, Text, VStack } from 'native-base';
import { GlobalReportContext } from './context';
import { TouchableNativeFeedback } from 'react-native';
import { SelectComponent, SelectItemComponent } from '../../../../components/atoms/select';
import StatusTag from '../../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../../components/composite/flat-list';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../../config/appConfig';
import useAppColorMode from '../../../../hooks/theme/colorMode';
import { IGlobalReport, IGlobalReportList, useGetGlobalReportListQuery } from '../../../../store/services/reports';
import { useGetServicesQuery } from '../../../../store/services/services';
import { IService } from '../../../../store/types';
import moment from 'moment';
import Utils from '../../../../utils';
import useMediaQuery from '../../../../hooks/media-query';
import If from '../../../../components/composite/if-container';
import CampusReportDetails from './campusReportDetails';

export const GlobalReportListRow: React.FC<IGlobalReport> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();
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
        <TouchableNativeFeedback
            disabled={false}
            delayPressIn={0}
            onPress={handlePress}
            accessibilityRole="button"
            background={TouchableNativeFeedback.Ripple(
                isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                false,
                220
            )}
            style={{ paddingHorizontal: 20 }}
        >
            <HStack
                p={2}
                px={4}
                my={1.5}
                w="full"
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                    {props?.campusName.replace('Campus', '')}
                </Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </HStack>
        </TouchableNativeFeedback>
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

    const handleRefresh = () => {
        serviceId && !isUninitialized && refetch();
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
                            selectedValue={serviceId}
                            onValueChange={setService}
                            placeholder="Select Service"
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
                    <FlatListComponent
                        refreshing={isFetching}
                        columns={reportColumns}
                        onRefresh={handleRefresh}
                        isLoading={isLoading || isFetching}
                        data={campusReports as IGlobalReportList}
                    />
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
