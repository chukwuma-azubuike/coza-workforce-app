import { useMemo } from 'react';
import { useGetAssimilationSubStagesQuery } from '~/store/services/roast-crm';

const useAssimilationStageIndex = () => {
    const { data: assimilationSubStages } = useGetAssimilationSubStagesQuery();

    const assimilationSubStagesIndex = useMemo(
        () =>
            assimilationSubStages
                ? Object.fromEntries(assimilationSubStages?.map(stage => [stage._id, stage.label]))
                : {},
        [assimilationSubStages]
    );

    return assimilationSubStagesIndex;
};

export default useAssimilationStageIndex;
