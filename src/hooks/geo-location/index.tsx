import React from 'react';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { ICampusCoordinates } from '../../store/services/attendance';
import useClosestCampus from '../closest-campus';

const distanceBetweenTwoCoordinates = (deviceCoordinates: GeoCoordinates, campusCoordinates: ICampusCoordinates) => {
    let { latitude: deviceLatitude, longitude: deviceLongitude } = deviceCoordinates;
    let { latitude: campusLatitude, longitude: campusLongitude } = campusCoordinates;

    deviceLongitude = (deviceLongitude * Math.PI) / 180;
    campusLongitude = (campusLongitude * Math.PI) / 180;
    deviceLatitude = (deviceLatitude * Math.PI) / 180;
    campusLatitude = (campusLatitude * Math.PI) / 180;

    // Haversine formula
    const longitudeDifference = Math.abs(campusLongitude - deviceLongitude);
    const latitudeDifference = Math.abs(campusLatitude - deviceLatitude);
    const arc =
        Math.pow(Math.sin(latitudeDifference / 2), 2) +
        Math.cos(deviceLatitude) * Math.cos(campusLatitude) * Math.pow(Math.sin(longitudeDifference / 2), 2);

    const curve = 2 * Math.asin(Math.sqrt(arc));

    // Radius of earth in kilometers. Use 3956 for miles
    const EARTH_RADIUS = 6371;

    return curve * EARTH_RADIUS * 1000; // Distance in meters.
};

interface IUseGeoLocationArgs {
    rangeToClockIn: number;
    campusCoordinates: ICampusCoordinates;
}

const useGeoLocation = (props: IUseGeoLocationArgs) => {
    const { rangeToClockIn } = props;

    let distance = Infinity;

    const [nudge, setNudge] = React.useState<boolean>(false);

    const verifyRangeBeforeAction = async (
        successCallback: () => any,
        errorCallback: () => any,
        campusCoordinates: ICampusCoordinates = closestCampusCoordinates
    ) => {
        await Geolocation.getCurrentPosition(
            position => {
                if (isInRange(position?.coords, campusCoordinates)) {
                    successCallback();
                } else {
                    errorCallback();
                }
            },
            error => {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const refresh = async () => {
        setNudge(prev => !prev);

        const result = await Geolocation.getCurrentPosition(
            position => {
                setDeviceCoordinates(position?.coords);
            },
            error => {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        return result;
    };

    const [deviceCoordinates, setDeviceCoordinates] = React.useState<GeoCoordinates>(null as unknown as GeoCoordinates);

    const closestCampusCoordinates = useClosestCampus({
        latitude: deviceCoordinates?.latitude,
        longitude: deviceCoordinates?.longitude,
    });

    const isInRange = (
        deviceCoordinatesArg: GeoCoordinates = deviceCoordinates,
        campusCoordinatesArg: ICampusCoordinates = closestCampusCoordinates
    ) => {
        if (deviceCoordinatesArg && campusCoordinatesArg) {
            try {
                distance = distanceBetweenTwoCoordinates(deviceCoordinatesArg, campusCoordinatesArg);
                if (distance <= +rangeToClockIn) {
                    return true;
                }
                return false;
            } catch (err) {
                return false;
            }
        }
    };

    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                setDeviceCoordinates(position?.coords);
            },
            error => {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [deviceCoordinates?.latitude, deviceCoordinates?.longitude, nudge]);

    return {
        isInRange: !!isInRange(),
        verifyRangeBeforeAction,
        deviceCoordinates,
        distance,
        refresh,
    };
};

export default useGeoLocation;
