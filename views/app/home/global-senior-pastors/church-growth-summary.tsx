import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { Col, Row } from '@components/composite/row';
import { THEME_CONFIG } from '@config/appConfig';
import { Alert } from 'native-base';
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
            <View space={4} alignItems="center">
                <View>
                    <Text fontSize="lg" fontWeight="medium" color="coolGray.800" ellipsizeMode="tail" numberOfLines={1}>
                        Celebrate you, sir!
                    </Text>
                    <Text ellipsizeMode="tail" numberOfLines={1} fontSize="md" fontWeight="medium" color="coolGray.600">
                        Look how God has been faithful to COZA Global!
                    </Text>
                </View>
                <Row gutter={16}>
                    <Col sm={24} md={12} lg={24}>
                        <View alignItems="center" justifyContent="space-between" space={2}>
                            <Text
                                fontSize="4xl"
                                color="coolGray.800"
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                className="font-bold"
                            >
                                {souls}
                            </Text>
                            <View flex={1}>
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
                                        color={isSoulIncreased ? 'success.600' : 'rose.600'}
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
                                    >{` ${soulDifference}% `}</Text>
                                    {isSoulIncreased ? 'more' : 'less'} than last week!
                                </Text>
                            </View>
                        </View>
                    </Col>
                    <Col sm={24} md={12} lg={24}>
                        <View alignItems="center" justifyContent="space-between" space={2}>
                            <Text
                                fontSize="4xl"
                                color="coolGray.800"
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                className="font-bold"
                            >
                                {attendance}
                            </Text>
                            <View flex={1}>
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
                                        color={isAttendanceIncreased ? 'success.600' : 'rose.600'}
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
                                    >{` ${attendanceDifference}% `}</Text>
                                    {isAttendanceIncreased ? 'more' : 'less'} than last week!
                                </Text>
                            </View>
                        </View>
                    </Col>
                    <Col sm={24} md={12} lg={24}>
                        <View alignItems="center" justifyContent="space-between">
                            <Text
                                fontSize="xl"
                                color="coolGray.800"
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                className="font-bold"
                            >
                                {currentPeriodHighestCampusAttendance}
                            </Text>
                            <View alignItems="center">
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
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
                                    >{` ${lastPeriodHighestCampusAttendance} `}</Text>
                                </Text>
                            </View>
                        </View>
                    </Col>

                    <Col sm={24} md={12} lg={24}>
                        <View alignItems="center" justifyContent="space-between">
                            <Text
                                fontSize="xl"
                                color="coolGray.800"
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                className="font-bold"
                            >
                                {currentHighestGrowingCampus}
                            </Text>
                            <View alignItems="center">
                                <Text
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="coolGray.600"
                                >
                                    recorded the highest percentage increase today at
                                    <Text
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
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
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
                                    >{` ${lastPeriodHighestGrowingCampus} `}</Text>
                                    with
                                    <Text
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
                                    >{` ${lastPeriodHighestCampusAttendanceGrowthPercentage}%.`}</Text>
                                </Text>
                            </View>
                        </View>
                    </Col>

                    <Col sm={24} md={24} lg={24} style={{ width: '100%' }}>
                        <View alignItems="center" justifyContent="space-between">
                            <Text
                                fontSize="xl"
                                color="coolGray.800"
                                ellipsizeMode="tail"
                                numberOfLines={1}
                                className="font-bold"
                            >
                                {pendingCampusReports} Campuses
                            </Text>
                            <View alignItems="center">
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
                                    <Text
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        className="font-bold"
                                    >{` yet tosend `}</Text>
                                    in their Service report today!
                                </Text>
                            </View>
                        </View>
                    </Col>
                </Row>
            </View>
        </Alert>
    );
};

export default React.memo(ChurchGrowthSummary);
