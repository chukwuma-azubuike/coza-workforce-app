import React from 'react';
import { ICampusCoordinates } from '@store/services/attendance';
import { useGetCampusesQuery } from '@store/services/campus';
import CampusTree from '@utils/campusTree';

const useClosestCampus = (deviceCoordinates: ICampusCoordinates) => {
    const { data } = useGetCampusesQuery();

    const campusCoordinates = React.useMemo(() => data?.map(campus => Object.values(campus.coordinates)), [data]);

    const campusTree = campusCoordinates && new CampusTree(campusCoordinates);

    const query = [deviceCoordinates.longitude, deviceCoordinates.latitude];
    const closestCoordinatesArray = campusTree && campusTree.findClosest(query);

    const closestCampusCoordinates: ICampusCoordinates = {
        longitude: closestCoordinatesArray ? closestCoordinatesArray[0] : Infinity,
        latitude: closestCoordinatesArray ? closestCoordinatesArray[1] : Infinity,
    };

    return closestCampusCoordinates;
};

export default useClosestCampus;
