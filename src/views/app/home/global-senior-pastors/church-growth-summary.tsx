import { Col, Row } from '@components/composite/row';
import { THEME_CONFIG } from '@config/appConfig';
import { Alert, HStack, Text, VStack } from 'native-base';
import React from 'react';

const ChurchGrowthSummary: React.FC = () => {
    const isSoulIncreased = true;
    const isAttendanceIncreased = true;

    const soulDifference = 10;
    const attendanceDifference = 15;

    const souls = 2024;
    const attendance = 20240;

    const currentPeriodHighestCampusAttendance = 'Lagos Campus';
    const lastPeriodHighestCampusAttendance = 'Port Harcourt Campus';

    const currentHighestGrowingCampus = 'Manchester Campus';
    const lastPeriodHighestGrowingCampus = 'Birmingham Campus';

    const currentHighestCampusAttendanceGrowthPercentage = 50;
    const lastPeriodHighestCampusAttendanceGrowthPercentage = 10;

    const pendingCampusReports = 4;

    return (
        <Alert
            p={5}
            status="info"
            colorScheme="info"
            _light={{
                backgroundColor: 'primary.200',
            }}
            _dark={{
                backgroundColor: 'primary.700',
            }}
            borderRadius={THEME_CONFIG.borderRadius}
        >
            <VStack space={4} alignItems="center">
                <VStack>
                    <Text fontSize="lg" fontWeight="medium" color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                        Celebrate you, sir!
                    </Text>
                    <Text ellipsizeMode="tail" numberOfLines={1} fontSize="md" fontWeight="medium" color="coolGray.600">
                        Look how God has been faithful to COZA Global!
                    </Text>
                </VStack>
                <Row gutter={16}>
                    <Col sm={24} md={12} lg={24}>
                        <HStack alignItems="center" justifyContent="space-between" space={2}>
                            <Text fontSize="4xl" bold color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                                {souls}
                            </Text>
                            <VStack flex={1}>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    people in church today!
                                </Text>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    that's
                                    <Text
                                        bold
                                        color={isSoulIncreased ? 'success.600' : 'rose.600'}
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >{` ${soulDifference}% `}</Text>
                                    {isSoulIncreased ? 'more' : 'less'} than last week!
                                </Text>
                            </VStack>
                        </HStack>
                    </Col>
                    <Col sm={24} md={12} lg={24}>
                        <HStack alignItems="center" justifyContent="space-between" space={2}>
                            <Text fontSize="4xl" bold color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                                {attendance}
                            </Text>
                            <VStack flex={1}>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    people in church today!
                                </Text>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    that's
                                    <Text
                                        bold
                                        color={isAttendanceIncreased ? 'success.600' : 'rose.600'}
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >{` ${attendanceDifference}% `}</Text>
                                    {isAttendanceIncreased ? 'more' : 'less'} than last week!
                                </Text>
                            </VStack>
                        </HStack>
                    </Col>
                    <Col sm={24} md={12} lg={24}>
                        <VStack alignItems="center" justifyContent="space-between">
                            <Text fontSize="xl" bold color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                                {currentPeriodHighestCampusAttendance}
                            </Text>
                            <VStack alignItems="center">
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    recorded the highest number of attendance today!
                                </Text>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    Last week, it was
                                    <Text
                                        bold
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >{` ${lastPeriodHighestCampusAttendance} `}</Text>
                                </Text>
                            </VStack>
                        </VStack>
                    </Col>

                    <Col sm={24} md={12} lg={24}>
                        <VStack alignItems="center" justifyContent="space-between">
                            <Text fontSize="xl" bold color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                                {currentHighestGrowingCampus}
                            </Text>
                            <VStack alignItems="center">
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    recorded the highest percentage increase today at
                                    <Text
                                        bold
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >{` ${currentHighestCampusAttendanceGrowthPercentage}%.`}</Text>
                                </Text>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    Last week, it was
                                    <Text
                                        bold
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >{` ${lastPeriodHighestGrowingCampus} `}</Text>
                                    with
                                    <Text
                                        bold
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >{` ${lastPeriodHighestCampusAttendanceGrowthPercentage}%.`}</Text>
                                </Text>
                            </VStack>
                        </VStack>
                    </Col>

                    <Col sm={24} md={24} lg={24} style={{ width: '100%' }}>
                        <VStack alignItems="center" justifyContent="space-between">
                            <Text fontSize="xl" bold color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                                {pendingCampusReports} Campuses
                            </Text>
                            <VStack alignItems="center">
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    recorded the highest number of attendance today!
                                </Text>
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    are
                                    <Text bold ellipsizeMode="tail" numberOfLines={1}>{` yet tosend `}</Text>in their
                                    Service report today!
                                </Text>
                            </VStack>
                        </VStack>
                    </Col>
                </Row>
            </VStack>
        </Alert>
    );
};

export default ChurchGrowthSummary;
