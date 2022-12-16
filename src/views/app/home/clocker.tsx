import React, { useState } from 'react';
import { Center, Text, VStack } from 'native-base';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import AttendanceSummary from './attendance-summary';
import useGeoLocation from '../../../hooks/geo-location';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { Alert, Dimensions } from 'react-native';
import useRole from '../../../hooks/role';
import If from '../../../components/composite/if-container';
import { HomeContext } from '.';
import { ICampusCoordinates } from '../../../store/services/attendance';

const Clocker: React.FC = () => {
    const [deviceCoordinates, setDeviceCoordinates] = useState<GeoCoordinates>(
        null as unknown as GeoCoordinates
    );

    const {
        latestService: { data, isError },
    } = React.useContext(HomeContext);

    const campusCoordinates = {
        latitude: data?.coordinates.lat,
        longitude: data?.coordinates.long,
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
                // Alert.alert(
                //     `${position.coords.latitude} ${position.coords.longitude} Dist: ${distance}`
                // );
            },
            error => {
                Alert.alert(error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [deviceCoordinates?.latitude, deviceCoordinates?.longitude]);

    const { isAHOD, isHOD } = useRole();

    const vh = Dimensions.get('window').height;

    return (
        <Center px={4} pt={8} _dark={{ bg: 'black' }} flex={1}>
            <VStack
                h={vh - 220}
                alignItems="center"
                justifyContent="space-between"
            >
                <Timer />
                <ClockButton
                    deviceCoordinates={deviceCoordinates}
                    isInRange={isInRange || false}
                />
                <CampusLocation />
                <If condition={isAHOD || isHOD}>
                    <AttendanceSummary />
                </If>
                <ClockStatistics />
            </VStack>
        </Center>
    );
};

export default Clocker;
