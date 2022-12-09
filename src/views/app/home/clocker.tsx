import React, { useState } from 'react';
import { Center, Text, VStack } from 'native-base';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import AttendanceSummary from './attendance-summary';
import useGeoLocation from '../../../hooks/geo-location';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { Alert } from 'react-native';
import { CLOCK_IN_MIN_DISTANCE } from '@env';

const campusCoordinates = {
    latitude: 6.5812268318052105,
    longitude: 3.3608375132246167,
};

const Clocker: React.FC = () => {
    const [deviceCoordinates, setDeviceCoordinates] = useState<GeoCoordinates>(
        null as unknown as GeoCoordinates
    );

    const { isInRange, distance } = useGeoLocation({
        deviceCoordinates,
        campusCoordinates,
    });

    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                setDeviceCoordinates(position.coords);
                Alert.alert(
                    isInRange
                        ? 'You are within range'
                        : 'You are not in range!',
                    `Latitude: ${position.coords.latitude} Longitude: ${
                        position.coords.longitude
                    } Distance: ${Math.round(
                        distance
                    )} meters. Allowed: ${CLOCK_IN_MIN_DISTANCE}`
                );
            },
            error => {
                // See error code charts below.
                Alert.alert(error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [distance]);

    return (
        <Center px={4} _dark={{ bg: 'black' }}>
            <VStack justifyContent="space-evenly" h="full" alignItems="center">
                <Text fontSize="xl" color="gray.500" fontWeight="light">
                    COZA SUNDAY
                </Text>
                <Timer />
                <VStack alignItems="center" space={8}>
                    <ClockButton isInRange={isInRange} />
                    <CampusLocation />
                </VStack>
                <AttendanceSummary />
                <ClockStatistics />
            </VStack>
        </Center>
    );
};

export default Clocker;
