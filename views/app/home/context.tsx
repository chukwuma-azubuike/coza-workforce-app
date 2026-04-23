import * as React from 'react';
import { LocationObjectCoords } from 'expo-location';
import { IAttendance, IService } from '@store/types';

export interface IInitialHomeState {
    latestService: {
        data?: IService;
        isError: boolean;
        isSuccess: boolean;
        isLoading: boolean;
    };
    latestAttendance: {
        latestAttendanceIsError: boolean;
        latestAttendanceData?: IAttendance[];
        latestAttendanceIsSuccess: boolean;
        latestAttendanceIsLoading: boolean;
    };
    currentCoordinate: LocationObjectCoords;
}

export const HomeContext = React.createContext({} as IInitialHomeState);

export default HomeContext;
