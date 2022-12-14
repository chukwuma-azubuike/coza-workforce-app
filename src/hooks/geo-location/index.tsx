import { GeoCoordinates } from 'react-native-geolocation-service';
import { ICampusCoordinates } from '../../store/services/attendance';

const distanceBetweenTwoCoordinates = (
    deviceCoordinates: GeoCoordinates,
    campusCoordinates: ICampusCoordinates
) => {
    let { latitude: deviceLatitude, longitude: deviceLongitude } =
        deviceCoordinates;
    let { latitude: campusLatitude, longitude: campusLongitude } =
        campusCoordinates;

    deviceLongitude = (deviceLongitude * Math.PI) / 180;
    campusLongitude = (campusLongitude * Math.PI) / 180;
    deviceLatitude = (deviceLatitude * Math.PI) / 180;
    campusLatitude = (campusLatitude * Math.PI) / 180;

    // Haversine formula
    const longitudeDifference = Math.abs(campusLongitude - deviceLongitude);
    const latitudeDifference = Math.abs(campusLatitude - deviceLatitude);
    const arc =
        Math.pow(Math.sin(latitudeDifference / 2), 2) +
        Math.cos(deviceLatitude) *
            Math.cos(campusLatitude) *
            Math.pow(Math.sin(longitudeDifference / 2), 2);

    const curve = 2 * Math.asin(Math.sqrt(arc));

    // Radius of earth in kilometers. Use 3956 for miles
    const EARTH_RADIUS = 6371;

    return curve * EARTH_RADIUS * 1000; // Distance in meters.
};

interface IUseGeoLocationArgs {
    rangeToClockIn: number;
    deviceCoordinates: GeoCoordinates;
    campusCoordinates: ICampusCoordinates;
}

const useGeoLocation = (props: IUseGeoLocationArgs) => {
    const { deviceCoordinates, campusCoordinates, rangeToClockIn } = props;

    let distance = Infinity;

    const isInRange = () => {
        if (deviceCoordinates && campusCoordinates) {
            try {
                distance = distanceBetweenTwoCoordinates(
                    deviceCoordinates,
                    campusCoordinates
                );
                if (distance <= +rangeToClockIn) {
                    return true;
                }
                return false;
            } catch (err) {
                return false;
            }
        }
    };

    return {
        isInRange: isInRange(),
        distance,
    };
};

export default useGeoLocation;
