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
import useRole from '../../../hooks/role';
import If from '../../../components/composite/if-container';
import { HomeContext } from '.';
import { ICampusCoordinates } from '../../../store/services/attendance';

const Clocker: React.FC = () => {
    const [deviceCoordinates, setDeviceCoordinates] = useState<GeoCoordinates>(
        null as unknown as GeoCoordinates
    );

    const {
        latestService: { data },
    } = React.useContext(HomeContext);

    const campusCoordinates = {
        // latitude: data?.coordinates.lat,
        // longitude: data?.coordinates.long,
        latitude: 6.6587,
        longitude: 3.329,
    };

    const { isInRange, distance } = useGeoLocation({
        deviceCoordinates,
        rangeToClockIn: data?.rangeToClockIn as number,
        campusCoordinates: campusCoordinates as ICampusCoordinates,
    });

    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                setDeviceCoordinates(position.coords);
                Alert.alert(
                    `${position.coords.latitude} ${position.coords.longitude}`
                );
            },
            error => {
                Alert.alert(error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [deviceCoordinates?.latitude, deviceCoordinates?.longitude]);

    const { isAHOD, isHOD } = useRole();

    return (
        <Center px={4} _dark={{ bg: 'black' }}>
            <VStack justifyContent="space-evenly" h="full" alignItems="center">
                <Text
                    fontSize="lg"
                    margin={0}
                    color="gray.500"
                    fontWeight="light"
                >
                    {data?.name.toUpperCase()}
                </Text>
                <Timer />
                <VStack alignItems="center" space={8}>
                    <ClockButton
                        deviceCoordinates={deviceCoordinates}
                        isInRange={isInRange || false}
                    />
                    <CampusLocation />
                </VStack>
                <If condition={isAHOD || isHOD}>
                    <AttendanceSummary />
                </If>
                <ClockStatistics />
            </VStack>
        </Center>
    );
};

export default Clocker;
