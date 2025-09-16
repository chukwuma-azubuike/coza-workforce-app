import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';

const Attendance = React.lazy(() => import('~/views/app/attendance'));

const AttendanceScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <Attendance />
        </Suspense>
    );
};

export default AttendanceScreen;
