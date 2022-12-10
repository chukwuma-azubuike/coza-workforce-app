import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import {
    columns,
    data,
    teamAttendanceData,
    teamAttendanceDataColumns,
} from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';

export const MyAttendance: React.FC = React.memo(() => {
    return (
        <>
            <MonthPicker />
            <FlatListComponent columns={columns} data={data} />
        </>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    return (
        <>
            <MonthPicker />
            <FlatListComponent
                columns={teamAttendanceDataColumns}
                data={teamAttendanceData}
            />
        </>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    return (
        <>
            <MonthPicker />
            <FlatListComponent columns={columns} data={data} />
        </>
    );
});
