import { useMemo } from 'react';
import { useGetCampusesQuery } from '~/store/services/campus';

const useCampusIndex = () => {
    const { data: campuses } = useGetCampusesQuery();

    const assimilationStagesIndex = useMemo(
        () => (campuses ? Object.fromEntries(campuses?.map(campus => [campus._id, campus.campusName])) : {}),
        [campuses]
    );

    return assimilationStagesIndex;
};

export default useCampusIndex;
