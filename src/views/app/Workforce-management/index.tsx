import React from 'react';
import useRole from '@hooks/role';
import { useNavigation } from '@react-navigation/native';
import useScreenFocus from '@hooks/focus';
import ViewWrapper from '@components/layout/viewWrapper';

const WorkforceSummary: React.FC = () => {
    const { isHOD, isAHOD, isSuperAdmin, isCampusPastor, isGlobalPastor, isQC, isInternshipHOD } = useRole();
    const { navigate } = useNavigation();

    const handleReroute = () => {
        // QC condition comes first as QC can also be HOD or AHOD
        if (isCampusPastor || isQC || isInternshipHOD) {
            return navigate('Campus workforce' as never);
        }
        if (isHOD || isAHOD) {
            return navigate('Workforce management' as never);
        }
        if (isGlobalPastor || isSuperAdmin) {
            return navigate('Global workforce' as never);
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

export default WorkforceSummary;
