import {
    Box,
    Flex,
    HStack,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextArea,
} from 'native-base';
import React from 'react';
import { THEME_CONFIG } from '../../../../config/appConfig';
import HorizontalTable from './horizontal-table';
import {
    BusCountType,
    CarCountType,
    ServiceAttendanceType,
    WorkersAttendanceType,
    GuestsAttendanceType,
    ChildCareType,
    IncidentReportType,
    ServiceObservationsType,
} from './types';
import VerticalTable from './vertical-table';

const CampusReport: React.FC = () => {
    const [actions, setActions] = React.useState<string>('');

    const workersAttendance: WorkersAttendanceType = {
        headers: ['Active', 'Present', 'Late', 'Absent'],
        rows: [
            {
                active: 200,
                present: 180,
                late: 50,
                absent: 20,
            },
        ],
    };

    const serviceAttendance: ServiceAttendanceType = {
        headers: ['Male', 'Female', 'Infants', 'Total'],
        rows: [
            {
                male: 400,
                female: 300,
                infants: 50,
                total: 750,
            },
        ],
    };

    const guestsAttendance: GuestsAttendanceType = {
        headers: ['First Timers', 'New Converts'],
        column: {
            firstTimers: 30,
            newConverts: 10,
        },
    };

    const childCare: ChildCareType = {
        headers: ['Age', 'Male', 'Female', 'Total'],
        rows: [
            {
                age: '12&Above',
                male: 30,
                female: 35,
                total: 65,
            },
            {
                age: '6-11',
                male: 20,
                female: 25,
                total: 45,
            },
            {
                age: '3-5',
                male: 15,
                female: 20,
                total: 45,
            },
            {
                age: '1-2',
                male: 15,
                female: 15,
                total: 30,
            },
            {
                age: 'Total',
                male: 90,
                female: 95,
                total: 185,
            },
        ],
    };

    const carCount: CarCountType = {
        headers: ['Main Car Park', 'Extension', 'Total'],
        column: {
            mainCarPark: 120,
            extension: 50,
            total: 170,
        },
    };

    const busCount: BusCountType = {
        headers: ['Location', 'Adults', 'Children', 'Total'],
        rows: [
            {
                location: 'Akilo',
                adults: 30,
                children: 35,
                total: 65,
            },
            {
                location: 'Mopol 23',
                adults: 20,
                children: 25,
                total: 45,
            },
            {
                location: 'Mile 12',
                adults: 15,
                children: 15,
                total: 30,
            },
            {
                location: 'Total',
                adults: 65,
                children: 75,
                total: 140,
            },
        ],
    };

    const serviceObservation: ServiceObservationsType = {
        headers: ['Observations'],
        rows: [
            {
                observations:
                    'Everything went well. hgbjk jhjkjj hjhjk jkhjkh jkkj jhj hgh kjh jhkj gh g',
            },
        ],
    };

    const incidentsReport: IncidentReportType = {
        headers: ['Department', 'Incident(s)'],
        rows: [
            {
                department: 'Childcare',
                indident: 'None reported',
            },
            {
                department: 'Security',
                indident: 'None reported',
            },
            {
                department: 'Ushery',
                indident: 'None reported',
            },
            {
                department: 'Protocol',
                indident: 'None reported',
            },
        ],
    };

    return (
        <ScrollView
            paddingLeft={'15px'}
            paddingRight={'15px'}
            paddingBottom={'30px'}
        >
            <VerticalTable
                title="Workers Attendance"
                tableData={workersAttendance}
            />
            <VerticalTable
                title="Service Attendance"
                tableData={serviceAttendance}
            />
            <HorizontalTable
                title="Guests Attendance"
                tableData={guestsAttendance}
            />
            <VerticalTable title="Childcare Report" tableData={childCare} />
            <HorizontalTable title="Car Count" tableData={carCount} />
            <VerticalTable title="Bus Count (Pick Up)" tableData={busCount} />
            <VerticalTable
                title="Service Programme Observation"
                tableData={serviceObservation}
                alignItemsCenter={false}
            >
                <HStack
                    direction="row"
                    justifyContent={'space-between'}
                    w={'100%'}
                    marginBottom={'7px'}
                    paddingBottom={'6px'}
                    borderBottomColor={THEME_CONFIG?.darkPurple}
                    borderBottomWidth={'0.5px'}
                >
                    <Flex direction="row">
                        <Text fontSize="17px" fontWeight="400">
                            Start Time -
                        </Text>{' '}
                        <Text
                            fontSize="17px"
                            fontWeight="400"
                            color={THEME_CONFIG?.darkPurple}
                        >
                            09:00
                        </Text>
                    </Flex>
                    <Flex direction="row">
                        <Text fontSize="17px" fontWeight="400">
                            End Time -
                        </Text>{' '}
                        <Text
                            fontSize="17px"
                            fontWeight="400"
                            color={THEME_CONFIG?.darkPurple}
                        >
                            11:30
                        </Text>
                    </Flex>
                </HStack>
            </VerticalTable>
            <VerticalTable title="Incidents" tableData={incidentsReport} />
            <KeyboardAvoidingView
                w="100%"
                marginTop={'30px'}
                paddingBottom={'50px'}
            >
                <Text
                    fontSize={'18px'}
                    fontWeight={'700'}
                    marginBottom={'15px'}
                >
                    Actions/Recommendations
                </Text>
                <Box alignItems="center" w="100%">
                    <TextArea
                        value={actions}
                        onChangeText={text => setActions(text)}
                        h={100}
                        placeholder="Details"
                        w="100%"
                        fontSize={'15px'}
                        fontWeight={'500'}
                        bgColor={THEME_CONFIG?.lightPurple}
                    />
                </Box>
            </KeyboardAvoidingView>
        </ScrollView>
    );
};

export default CampusReport;
