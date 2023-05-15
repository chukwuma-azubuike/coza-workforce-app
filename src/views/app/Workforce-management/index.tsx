import React from 'react';
import useRole from '../../../hooks/role';
import { useNavigation } from '@react-navigation/native';
import useScreenFocus from '../../../hooks/focus';
import ViewWrapper from '../../../components/layout/viewWrapper';

const WorkforceSummary: React.FC = () => {
    const { isHOD, isAHOD, isSuperAdmin, isCampusPastor, isGlobalPastor, isQC } = useRole();

    const { navigate, getState } = useNavigation();

    const history = getState().history as any[];
    const rerouteList = ['Campus workforce', 'Global workforce'];
    const lastRoute = history ? history[history?.length - 1].key.split('-')[0] : 'More';

    const handleReroute = () => {
        if (isHOD || isAHOD) {
            return navigate('Workforce management' as never);
        }
        if (isCampusPastor || isQC) {
            return navigate('Campus workforce' as never);
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
