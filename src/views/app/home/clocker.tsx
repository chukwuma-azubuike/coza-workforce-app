import React, { useState } from 'react';
import { Box, Center, VStack } from 'native-base';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import { CampusAttendanceSummary, TeamAttendanceSummary } from './attendance-summary';
import useGeoLocation from '../../../hooks/geo-location';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { Dimensions, Platform } from 'react-native';
import useRole from '../../../hooks/role';
import If from '../../../components/composite/if-container';
import { HomeContext } from '.';
import { ICampusCoordinates } from '../../../store/services/attendance';
import { CampusTicketSummary } from './ticket-summary';
import Loading from '../../../components/atoms/loading';

const Clocker: React.FC = () => {
    const [deviceCoordinates, setDeviceCoordinates] = useState<GeoCoordinates>(null as unknown as GeoCoordinates);

    const {
        latestService: { data },
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
            },
            error => {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [deviceCoordinates?.latitude, deviceCoordinates?.longitude, data?.coordinates.lat]);

    const { isAHOD, isHOD, isCampusPastor, user } = useRole();

    const vh = Dimensions.get('window').height;

    const isIOS = Platform.OS === 'ios';

    return (
        <Center px={4} pt={8} _dark={{ bg: 'black' }} flex={1}>
            <Timer />
            <If condition={isCampusPastor}>
                <CampusAttendanceSummary />
                <CampusTicketSummary />
            </If>
            {!user ? (
                <Loading />
            ) : (
                <If condition={!isCampusPastor}>
                    <VStack h={vh - (isIOS ? 380 : 320)} alignItems="center" justifyContent="space-between">
                        <ClockButton deviceCoordinates={deviceCoordinates} isInRange={isInRange || false} />
                        <CampusLocation />
                        <If condition={isAHOD || isHOD}>
                            <TeamAttendanceSummary />
                        </If>
                        <ClockStatistics />
                    </VStack>
                </If>
            )}
        </Center>
    );
};

export default Clocker;
