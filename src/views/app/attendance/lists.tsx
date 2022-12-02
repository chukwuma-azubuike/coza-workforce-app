import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import {
    columns,
    data,
    teamAttendanceData,
    teamAttendanceDataColumns,
} from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';

export const MyAttendance: React.FC = () => {
    return (
        <>
            <MonthPicker />
            <FlatListComponent columns={columns} data={data} />
        </>
    );
};

export const TeamAttendance: React.FC = () => {
    return (
        <>
            <MonthPicker />
            <FlatListComponent
                columns={teamAttendanceDataColumns}
                data={teamAttendanceData}
            />
        </>
    );
};

export const CampusAttendance: React.FC = () => {
    return (
        <>
            <MonthPicker />
            <FlatListComponent columns={columns} data={data} />
        </>
    );
};
