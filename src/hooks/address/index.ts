import React from 'react';
import { extractCountries, extractLGAs, extractStates } from '../../utils/handleStateAndLGA';

export const useAddress = () => {
    const [stateId, setStateId] = React.useState<number>(1);

    const countries = React.useMemo(() => extractCountries(), []);
    const states = React.useMemo(() => extractStates(), []);
    const lgas = React.useMemo(() => extractLGAs(stateId), [stateId]);

    return {
        lgas,
        states,
        countries,
        setStateId,
    };
};
