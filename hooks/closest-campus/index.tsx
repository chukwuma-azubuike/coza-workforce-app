import React from 'react';
import { ICampusCoordinates } from '@store/services/attendance';
import { useGetCampusesQuery } from '@store/services/campus';
import CampusTree from '@utils/campusTree';

const useClosestCampus = (deviceCoordinates: ICampusCoordinates) => {
    const { data } = useGetCampusesQuery(undefined, { pollingInterval: 10000 });

    const campusCoordinates = React.useMemo(
        () => data?.map(campus => [campus.coordinates.long, campus.coordinates.lat]),
        [data]
    );

    const campusTree = campusCoordinates && new CampusTree(campusCoordinates);

    const query = [deviceCoordinates.longitude, deviceCoordinates.latitude];
    const closestCoordinatesArray = campusTree?.findClosest(query);

    const closestCampusCoordinates: ICampusCoordinates = {
        longitude: closestCoordinatesArray ? closestCoordinatesArray[0] : Infinity,
        latitude: closestCoordinatesArray ? closestCoordinatesArray[1] : Infinity,
    };

    return closestCampusCoordinates;
};

export default useClosestCampus;
