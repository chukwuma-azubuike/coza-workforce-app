import moment from 'moment';
import { KeyboardAvoidingView, VStack, FormControl, Text, HStack, Divider } from 'native-base';
import React from 'react';
import TextAreaComponent from '../../../../components/atoms/text-area';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { useGetCampusReportSummaryQuery } from '../../../../store/services/reports';
import {
    IAttendanceReportPayload,
    IChildCareReportPayload,
    IGuestReportPayload,
    IIncidentReportPayload,
    ISecurityReportPayload,
    IServiceReportPayload,
    ITransferReportPayload,
} from '../../../../store/types';
import Utils from '../../../../utils';
import HorizontalTable from './horizontal-table';
import VerticalTable from './vertical-table';

interface ICampusReport {
    serviceId?: string;
}

const CampusReport: React.FC<ICampusReport> = props => {
    const { serviceId } = props;

    const [actions, setActions] = React.useState<string>('');

    const { data, refetch, isLoading, isSuccess, isError } = useGetCampusReportSummaryQuery(serviceId as string, {
        skip: !serviceId,
    });

    // const workersAttendance: WorkersAttendanceType = {
    //     headers: ['Active', 'Present', 'Late', 'Absent'],
    //     rows: [
    //         {
    //             late: 50,
    //             absent: 20,
    //             active: 200,
    //             present: 180,
    //         },
    //     ],
    // };

    const serviceAttendance = React.useMemo(() => {
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Ushery Board')
            ?.report as unknown as IAttendanceReportPayload;

        if (!rawData) return { headers: [], rows: [] };

        if (data?.departmentalReport) {
            return {
                headers: ['Male', 'Female', 'Infants', 'Total'],
                rows: [
                    {
                        male: rawData?.maleGuestCount,
                        female: rawData?.femaleGuestCount,
                        infants: rawData?.infants,
                        total: rawData?.total,
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
                    firstTimers: rawData?.firstTimersCount,
                    newConverts: rawData?.newConvertsCount,
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
                        male: elm[1].male,
                        female: elm[1].female,
                        total: elm[1].male + elm[1].male,
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
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Digital Surveillance Security')
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

    // const serviceObservation: ServiceObservationsType = {
    //     headers: ['Observations'],
    //     rows: [
    //         {
    //             observations: 'Everything went well.',
    //         },
    //     ],
    // };

    const [serviceTime, setServiceTime] = React.useState<{
        start: IServiceReportPayload['serviceStartTime'];
        end: IServiceReportPayload['serviceEndTime'];
    }>();

    const serviceObservation = React.useMemo(() => {
        const rawData = data?.departmentalReport.find(elm => elm.departmentName === 'Programme Coordinator')
            ?.report as unknown as IServiceReportPayload;

        if (!rawData) return { headers: [], rows: [] };

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
    }, [data]);

    const incidentReport = React.useMemo(() => {
        if (data?.incidentReport.length) {
            const rawData = data?.incidentReport as {
                incidentReport: IIncidentReportPayload;
            }[];

            if (!rawData) return { headers: [], rows: [] };

            const rows = rawData?.map(elm => {
                return {
                    department: elm.incidentReport.departmentName || elm.incidentReport.departmentId,
                    incident: elm.incidentReport.details,
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

    return (
        <ViewWrapper scroll noPadding refreshing={isLoading} onRefresh={handleRefresh}>
            <VStack px={4} space={10}>
                {/* <VerticalTable
                    title="Workers Attendance"
                    tableData={workersAttendance}
                /> */}
                <Divider />
                <VerticalTable isLoading={isLoading} title="Service Attendance" tableData={serviceAttendance} />
                <Divider />
                <HorizontalTable isLoading={isLoading} title="Guests Attendance" tableData={guestsAttendance} />
                <Divider />
                <VerticalTable isLoading={isLoading} title="Childcare Report" tableData={childCareReportData} />
                <Divider />
                <VerticalTable isLoading={isLoading} title="Car Count" tableData={carCount} />
                <Divider />
                <VerticalTable isLoading={isLoading} title="Bus Count (Pick Up)" tableData={busCount} />
                <Divider />
                <VerticalTable
                    title="Service Programme Observation"
                    tableData={serviceObservation}
                    alignItemsCenter={false}
                >
                    <HStack
                        marginBottom={3}
                        paddingBottom={2}
                        borderBottomWidth={1}
                        borderBottomColor="gray.300"
                        justifyContent={'space-between'}
                    >
                        <Text>Start Time -</Text>
                        <Text color="primary.600">
                            {serviceTime?.start ? moment(serviceTime?.start).format('LT') : '--:--'}
                        </Text>
                        <Text>End Time -</Text>
                        <Text color="primary.600">
                            {serviceTime?.end ? moment(serviceTime?.end).format('LT') : '--:--'}
                        </Text>
                    </HStack>
                </VerticalTable>
                <Divider />
                <VerticalTable isLoading={isLoading} title="Incidents" tableData={incidentReport} />
                <Divider />
                <KeyboardAvoidingView w="100%" marginTop={'30px'} paddingBottom={'50px'}>
                    <FormControl>
                        <FormControl.Label mb={4}>Actions/Recommendations</FormControl.Label>
                        <TextAreaComponent
                            onChangeText={text => setActions(text)}
                            placeholder="Details"
                            value={actions}
                            w="100%"
                        />
                    </FormControl>
                </KeyboardAvoidingView>
            </VStack>
        </ViewWrapper>
    );
};

export default CampusReport;
