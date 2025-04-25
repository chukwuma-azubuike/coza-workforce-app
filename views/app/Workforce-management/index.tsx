import React from 'react';
import useRole from '@hooks/role';
import useScreenFocus from '@hooks/focus';
import ViewWrapper from '@components/layout/viewWrapper';
import { router, useNavigation } from 'expo-router';

const WorkforceSummary: React.FC = () => {
    const { isHOD, isAHOD, isSuperAdmin, isCampusPastor, isGlobalPastor, isQC, isInternshipHOD } = useRole();
    const history = useNavigation();

    const handleReroute = () => {
        // QC condition comes first as QC can also be HOD or AHOD
        if (isCampusPastor || isQC || isInternshipHOD) {
            return router.push('/workforce-summary/campus-workforce');
        }
        if (isHOD || isAHOD) {
            return router.push('/workforce-summary/workforce-management');
        }
        if (isGlobalPastor || isSuperAdmin) {
            return router.push('/workforce-summary/global-workforce');
        }
    };

    useScreenFocus({
        onFocus: handleReroute,
    });

    React.useEffect(() => {
        handleReroute();
    }, []);

    return <ViewWrapper>{null}</ViewWrapper>;
};

export default React.memo(WorkforceSummary);
