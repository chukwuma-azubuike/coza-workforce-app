import { useMemo } from 'react';
import { useGetZonesQuery } from '~/store/services/roast-crm';

const useZoneIndex = () => {
    const { data: zones } = useGetZonesQuery();

    const assimilationStagesIndex = useMemo(
        () => (zones ? Object.fromEntries(zones?.map(zones => [zones._id, zones.name])) : {}),
        [zones]
    );

    return assimilationStagesIndex;
};

export default useZoneIndex;
