import { ICountry, INGState } from '../types/app';

const stateAndLGAs: INGState[] = require('../assets/json/state-and-lgas.json');
const countries: ICountry[] = require('../assets/json/countries.json');

export const extractStates = () => {
    return stateAndLGAs.map(item => {
        return { name: item.state.name, id: item.state.id };
    });
};

export const extractLGAs = (stateId?: number) => {
    if (!stateId) return [];
    return stateAndLGAs.find(item => item.state.id === stateId)?.state.locals || [];
};

export const extractCountries = () => {
    return countries.map(item => {
        return { name: item.properties.name, id: item.properties['Alpha-2'] };
    });
};
