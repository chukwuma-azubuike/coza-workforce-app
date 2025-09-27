import { useMemo } from 'react';
import { useGetAssimilationStagesQuery } from '~/store/services/roast-crm';

const useAssimilationStageIndex = () => {
    const { data: assimilationStages } = useGetAssimilationStagesQuery();

    const assimilationStagesIndex = useMemo(
        () =>
            assimilationStages ? Object.fromEntries(assimilationStages?.map(stage => [stage._id, stage.label])) : {},
        [assimilationStages]
    );

    return assimilationStagesIndex;
};

export default useAssimilationStageIndex;
