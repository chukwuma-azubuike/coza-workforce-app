import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Formik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import If from '@components/composite/if-container';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import { IGSPReportPayload, useGetCampusReportSummaryQuery, useSubmitGSPReportMutation } from '@store/services/reports';
import {
    IAttendanceReportPayload,
    IChildCareReportPayload,
    IGuestReportPayload,
    IReportStatus,
    ISecurityReportPayload,
    IServiceReportPayload,
    ITransferReportPayload,
} from '@store/types';
import Utils from '@utils';
import { GSPReportSchema } from '@utils/schemas';
import HorizontalTable from '@components/composite/tables/horizontal-table';
import VerticalTable from '@components/composite/tables/vertical-table';
import { Separator } from '~/components/ui/separator';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';

interface ICampusReportProps {
    campusId: string;
    serviceId: string;
    campusName: string;
}

const CampusReportDetails: React.FC<ICampusReportProps> = props => {
    const { serviceId, campusId, campusName } = props;
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
                message: (error as any)?.data?.message || 'Something went wrong',
                status: 'error',
            });
        }
    };

    return (
        <ViewWrapper className="py-6" scroll noPadding refreshing={isLoading} onRefresh={handleRefresh}>
            <Text className="font-bold text-2xl mb-2 ml-2">{campusName}</Text>
            <View className="px-4 gap-5">
                <Separator />
                <VerticalTable
                    isLoading={isLoading || isFetching}
                    title="Service Attendance"
                    tableData={serviceAttendance}
                />
                <Separator />
                <HorizontalTable
                    isLoading={isLoading || isFetching}
                    title="Guests Attendance"
                    tableData={guestsAttendance}
                />
                <Separator />
                <VerticalTable
                    isLoading={isLoading || isFetching}
                    title="Childcare Report"
                    tableData={childCareReportData}
                />
                <Separator />
                <VerticalTable isLoading={isLoading || isFetching} title="Car Count" tableData={carCount} />
                <Separator />
                <VerticalTable isLoading={isLoading || isFetching} title="Bus Count (Pick Up)" tableData={busCount} />
                <Separator />
                <VerticalTable
                    textWrap
                    tableData={serviceObservation}
                    isLoading={isLoading || isFetching}
                    title="Service Programme Observation"
                >
                    <View className="mb-2 pb-2 border border-border justify-between">
                        <Text>Start Time:</Text>
                        <Text className="font-bold text-primary">
                            {serviceTime?.start ? dayjs(serviceTime?.start).format('h:mm A') : '--:--'}
                        </Text>
                        <Text>End Time:</Text>
                        <Text className="font-bold text-primary">
                            {serviceTime?.end ? dayjs(serviceTime?.end).format('h:mm A') : '--:--'}
                        </Text>
                    </View>
                </VerticalTable>
                <Separator />
                <VerticalTable isLoading={isLoading || isFetching} title="Incidents" tableData={incidentReport} />
                <Separator />
                <If condition={isGlobalPastor}>
                    {data?.campusCoordinatorComment && (
                        <View className="gap-2 w-full pb-5">
                            <Text className="font-bold items-start">For the GSP's attention</Text>
                            <Text className="line-clamp-none">{data?.campusCoordinatorComment}</Text>
                        </View>
                    )}
                </If>
                <If condition={isCampusPastor}>
                    <Formik<IGSPReportPayload>
                        onSubmit={onSubmit}
                        validationSchema={GSPReportSchema}
                        initialValues={INITIAL_VALUES as unknown as IGSPReportPayload}
                    >
                        {({ errors, handleChange, handleSubmit, isValid }) => {
                            return (
                                <View className="gap-1">
                                    <View>
                                        <Label>For the GSP's attention</Label>
                                        <Textarea
                                            placeholder="Comment"
                                            onChangeText={handleChange('campusCoordinatorComment')}
                                        />
                                        {!!errors?.campusCoordinatorComment && (
                                            <FormErrorMessage>{errors?.campusCoordinatorComment}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Button
                                            disabled={!isValid}
                                            isLoading={isSubmitLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit to GSP
                                        </Button>
                                    </View>
                                </View>
                            );
                        }}
                    </Formik>
                </If>
            </View>
        </ViewWrapper>
    );
};

export default CampusReportDetails;
