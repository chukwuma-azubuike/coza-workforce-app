import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik } from 'formik';
import moment from 'moment';
import { VStack, Text, HStack, Divider, FormControl } from 'native-base';
import React from 'react';
import ButtonComponent from '@components/atoms/button';
import TextAreaComponent from '@components/atoms/text-area';
import If from '@components/composite/if-container';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import {
    ICampusReport,
    IGSPReportPayload,
    useGetCampusReportSummaryQuery,
    useSubmitGSPReportMutation,
} from '@store/services/reports';
import {
    IAttendanceReportPayload,
    IChildCareReportPayload,
    IGuestReportPayload,
    IReportStatus,
    ISecurityReportPayload,
    IServiceReportPayload,
    ITransferReportPayload,
} from '@store/types';
import Utils from '@utils/index';
import { GSPReportSchema } from '@utils/schemas';
import HorizontalTable from '@components/composite/tables/horizontal-table';
import VerticalTable from '@components/composite/tables/vertical-table';

const CampusReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as ICampusReport & { campusName: string };
    const { serviceId, campusId } = params;
    const { user, isCampusPastor, isGlobalPastor } = useRole();

    const { data, refetch, isLoading, isFetching, isSuccess, isError } = useGetCampusReportSummaryQuery(
        {
            serviceId: serviceId as string,
            campusId: campusId as string,
        },
        {
            refetchOnFocus: true,
        }
    );

    useScreenFocus({
        onFocus: refetch,
    });

    const reportsNotApproved = React.useMemo(
        () =>
            data?.departmentalReport?.find(
                (report: any) =>
                    report.status === IReportStatus.PENDING || report.status === IReportStatus.REVIEW_REQUESTED
            ),
        [data?.departmentalReport]
    );

    const serviceAttendance = React.useMemo(() => {
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Ushery Board')
            ?.report as unknown as IAttendanceReportPayload;

        if (!rawData) return { headers: [], rows: [] };

        if (data?.departmentalReport) {
            return {
                headers: ['Male', 'Female', 'Infants', 'Total'],
                rows: [
                    {
                        male: +rawData?.maleGuestCount,
                        female: +rawData?.femaleGuestCount,
                        infants: +rawData?.infants,
                        total: +rawData?.total,
                    },
                ],
            };
        }

        return { headers: [], rows: [] };
    }, [data]);

    const guestsAttendance = React.useMemo(() => {
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'PCU')
            ?.report as unknown as IGuestReportPayload;

        if (!rawData) return { headers: [], column: [] };

        if (data?.departmentalReport) {
            return {
                headers: ['First Timers', 'New Converts'],
                column: {
                    firstTimers: +rawData?.firstTimersCount,
                    newConverts: +rawData?.newConvertsCount,
                },
            };
        }

        return { headers: [], column: [] };
    }, [data]);

    const childCareReportData = React.useMemo(() => {
        if (data?.departmentalReport) {
            const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Children Ministry')
                ?.report as IChildCareReportPayload;

            if (!rawData) return { headers: [], rows: [] };

            const rows = Object.entries(rawData).map(elm => {
                if (elm[0] === 'age12_above' || elm[0] === 'age6_11' || elm[0] === 'age3_5' || elm[0] === 'age1_2') {
                    return {
                        age: Utils.capitalizeFirstChar(elm[0], '_').split(' ').join(' - ').split('Age').join('Age '),
                        male: +elm[1].male,
                        female: +elm[1].female,
                        total: +elm[1].male + +elm[1].female,
                    };
                }
            });
            return {
                headers: ['Age', 'Male', 'Female', 'Sub total'],
                rows: Utils.filter(rows, undefined),
            };
        }

        return { headers: [], rows: [] };
    }, [data]);

    const carCount = React.useMemo(() => {
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Traffic & Security')
            ?.report as unknown as ISecurityReportPayload;

        if (!rawData) return { headers: [], rows: [] };

        const rows = Object.entries(rawData).map(elm => {
            if (elm[0] === 'locations') {
                return elm[1];
            }
        });

        return {
            headers: ['Car Park', 'Car Count'],
            rows: Utils.filter(
                rows.flatMap(elm => {
                    return elm;
                }),
                undefined
            ).map(elm => {
                return { ...elm, total: +elm.minorCount + +elm.adultCount };
            }),
        };
    }, [data]);

    const busCount = React.useMemo(() => {
        if (data?.departmentalReport) {
            const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'COZA Transfer Service')
                ?.report as ITransferReportPayload;

            if (!rawData) return { headers: [], rows: [] };

            const rows = Object.entries(rawData).map(elm => {
                if (elm[0] === 'locations') {
                    return elm[1];
                }
            });

            return {
                headers: ['Location', 'Adults', 'Children', 'Total'],
                rows: Utils.filter(
                    rows.flatMap(elm => {
                        return elm;
                    }),
                    undefined
                ).map(elm => {
                    return { ...elm, total: +elm.minorCount + +elm.adultCount };
                }),
            };
        }

        return { headers: [], rows: [] };
    }, [data]);

    const [serviceTime, setServiceTime] = React.useState<{
        start: IServiceReportPayload['serviceStartTime'];
        end: IServiceReportPayload['serviceEndTime'];
    }>();

    const serviceObservation = React.useMemo(() => {
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Programme Coordination')
            ?.report as unknown as IServiceReportPayload;

        if (!rawData) {
            setServiceTime({
                start: '',
                end: '',
            });
            return { headers: [], rows: [] };
        }

        if (data?.departmentalReport) {
            setServiceTime({
                start: rawData?.serviceStartTime,
                end: rawData?.serviceEndTime,
            });

            return {
                headers: ['Observations'],
                rows: [
                    {
                        observations: rawData?.observations ? rawData?.observations : 'null',
                    },
                ],
            };
        }

        return { headers: [], rows: [] };
    }, [data, serviceId]);

    const incidentReport = React.useMemo(() => {
        if (data?.incidentReport.length) {
            const rawData = data?.incidentReport;

            if (!rawData) return { headers: [], rows: [] };

            const rows = rawData?.map(elm => {
                return {
                    department: elm?.departmentName,
                    incident: elm?.incidentReport?.details,
                };
            });

            return {
                headers: ['Department', 'Incident'],
                rows,
            };
        }

        return { headers: [], rows: [] };
    }, [data]);

    const handleRefresh = () => {
        serviceId && refetch();
    };

    const submittedReports = React.useMemo(
        () => data?.departmentalReport.filter(report => report?.report?.status === 'SUBMITTED'),
        [data]
    );
    const submittedReportIds = React.useMemo(
        () => submittedReports?.map(report => report?.report?._id),
        [submittedReports]
    );
    const incidentReportIds = React.useMemo(
        () => data?.incidentReport.map(report => report?.incidentReport?._id),
        [data]
    );

    const INITIAL_VALUES = {
        campusId,
        serviceId,
        userId: user?._id,
        incidentReportIds,
        submittedReportIds,
        campusCoordinatorComment: '',
        status: IReportStatus.GSP_SUBMITTED,
    };

    const [submitGSPReport, { error, isLoading: isSubmitLoading, reset }] = useSubmitGSPReportMutation();
    const { setModalState } = useModal();
    const { goBack } = useNavigation();

    const onSubmit = async (values: IGSPReportPayload) => {
        if (!!reportsNotApproved) {
            return setModalState({
                message: 'All reports need to be approved before submitting',
                status: 'info',
            });
        }
        const result = await submitGSPReport(values);

        if ('data' in result) {
            setModalState({
                message: 'Submitted to GSP',
                status: 'success',
            });
            reset();
            goBack();
        }

        if ('error' in result) {
            setModalState({
                message: error?.data?.message || 'Something went wrong',
                status: 'error',
            });
        }
    };

    return (
        <ViewWrapper py={10} scroll noPadding refreshing={isLoading} onRefresh={handleRefresh}>
            {isGlobalPastor && (
                <Text bold fontSize="3xl" mb={4} ml={4}>
                    {params?.campusName}
                </Text>
            )}
            <VStack px={4} space={10}>
                <Divider />
                <VerticalTable
                    isLoading={isLoading || isFetching}
                    title="Service Attendance"
                    tableData={serviceAttendance}
                />
                <Divider />
                <HorizontalTable
                    isLoading={isLoading || isFetching}
                    title="Guests Attendance"
                    tableData={guestsAttendance}
                />
                <Divider />
                <VerticalTable
                    isLoading={isLoading || isFetching}
                    title="Childcare Report"
                    tableData={childCareReportData}
                />
                <Divider />
                <VerticalTable isLoading={isLoading || isFetching} title="Car Count" tableData={carCount} />
                <Divider />
                <VerticalTable isLoading={isLoading || isFetching} title="Bus Count (Pick Up)" tableData={busCount} />
                <Divider />
                <VerticalTable
                    alignItemsCenter={false}
                    tableData={serviceObservation}
                    isLoading={isLoading || isFetching}
                    title="Service Programme Observation"
                >
                    <HStack
                        marginBottom={3}
                        paddingBottom={2}
                        borderBottomWidth={1}
                        borderBottomColor="gray.300"
                        justifyContent={'space-between'}
                    >
                        <Text>Start Time:</Text>
                        <Text color="primary.500" bold>
                            {serviceTime?.start ? moment(serviceTime?.start).format('LT') : '--:--'}
                        </Text>
                        <Text>End Time:</Text>
                        <Text color="primary.500" bold>
                            {serviceTime?.end ? moment(serviceTime?.end).format('LT') : '--:--'}
                        </Text>
                    </HStack>
                </VerticalTable>
                <Divider />
                <VerticalTable isLoading={isLoading || isFetching} title="Incidents" tableData={incidentReport} />
                <Divider />
                <If condition={isGlobalPastor}>
                    {data?.campusCoordinatorComment && (
                        <VStack pb={10} w="full" space={2}>
                            <Text alignSelf="flex-start" bold>
                                For the GSP's attention
                            </Text>
                            <Text flexWrap="wrap">{data?.campusCoordinatorComment}</Text>
                        </VStack>
                    )}
                </If>
                <If condition={isCampusPastor}>
                    <Formik<IGSPReportPayload>
                        onSubmit={onSubmit}
                        validationSchema={GSPReportSchema}
                        initialValues={INITIAL_VALUES as unknown as IGSPReportPayload}
                    >
                        {({ errors, handleChange, handleSubmit }) => {
                            return (
                                <VStack space={2}>
                                    <FormControl isRequired isInvalid={!!errors?.campusCoordinatorComment}>
                                        <FormControl.Label>For the GSP's attention</FormControl.Label>
                                        <TextAreaComponent
                                            minHeight={150}
                                            placeholder="Comment"
                                            onChangeText={handleChange('campusCoordinatorComment')}
                                        />
                                        <FormControl.ErrorMessage
                                            fontSize="2xl"
                                            mt={3}
                                            leftIcon={
                                                <Icon
                                                    size={16}
                                                    name="warning"
                                                    type="antdesign"
                                                    color={THEME_CONFIG.error}
                                                />
                                            }
                                        >
                                            {errors?.campusCoordinatorComment}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl minHeight={180}>
                                        <ButtonComponent
                                            isLoading={isSubmitLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit to GSP
                                        </ButtonComponent>
                                    </FormControl>
                                </VStack>
                            );
                        }}
                    </Formik>
                </If>
            </VStack>
        </ViewWrapper>
    );
};

export default CampusReport;
