import { useMemo } from 'react';
import { useGetAssimilationStagesQuery, useGetAssimilationSubStagesQuery } from '~/store/services/roast-crm';

const useAssimilationStageIndex = () => {
    const { data: assimilationStages } = useGetAssimilationStagesQuery();

    const assimilationStagesIndex = useMemo(
        () =>
            assimilationStages ? Object.fromEntries(assimilationStages?.map(stage => [stage._id, stage.label])) : {},
        [assimilationStages]
    );

    return assimilationStagesIndex;
};

export const useAssimilationSubStageIndex = () => {
    const { data: assimilationSubStages = [] } = useGetAssimilationSubStagesQuery();

    const assimilationSubStagesIndex = useMemo(
        () => Object.fromEntries(assimilationSubStages?.map((stage, index) => [index, stage._id])),
        [assimilationSubStages]
    );

    return assimilationSubStagesIndex;
};

export const useAssimilationSubStagePositionIndex = () => {
    const { data: assimilationStages } = useGetAssimilationSubStagesQuery();

    const useAssimilationSubStagePositionIndex = useMemo(
        () =>
            assimilationStages ? Object.fromEntries(assimilationStages?.map((stage, index) => [stage._id, index])) : {},
        [assimilationStages]
    );

    return useAssimilationSubStagePositionIndex;
};

export default useAssimilationStageIndex;
