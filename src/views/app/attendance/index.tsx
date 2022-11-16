import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import FlatListComponent from '../../../components/composite/flat-list';
import { Box } from 'native-base';
import { columns, data } from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';

const Attendance: React.FC = () => {
    return (
        <ViewWrapper>
            <Box>
                <MonthPicker />
                <FlatListComponent columns={columns} data={data} />
            </Box>
        </ViewWrapper>
    );
};

export default Attendance;
