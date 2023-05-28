import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { CampusAttendance, LeadersAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '../../../components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole, { ROLES } from '../../../hooks/role';
import useMediaQuery from '../../../hooks/media-query';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '../../../hooks/focus';
// import If from '../../../components/composite/if-container';
// import StaggerButtonComponent from '../../../components/composite/stagger';

const Attendance: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor, isQcHOD } = useRole();
    const { isMobile } = useMediaQuery();
    const navigation = props.navigation;

    const params = props.route.params as { role: ROLES; route: string };

    const isLeader = Array.isArray(params?.role) && params?.role.includes(ROLES.HOD || ROLES.AHOD);
    const isWorker = params?.role === ROLES.worker;

    const ROUTES = [
        { key: 'myAttendance', title: 'My Attendance' },
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'campusAttendance', title: 'Campus Attendance' },
        { key: 'leadersAttendance', title: 'Leaders Attendance' },
    ];

    const renderScene = SceneMap({
        myAttendance: MyAttendance,
        teamAttendance: TeamAttendance,
        campusAttendance: CampusAttendance,
        leadersAttendance: LeadersAttendance,
    });

    // const goToExport = () => {
    //     navigation.navigate('Export Data', { type: 'ATTENDANCE' });
    // };

    const [index, setIndex] = React.useState(0);

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const routeFocus = () => {
        if (isLeader) {
            setIndex(allRoutes.findIndex(route => route.key === 'leadersAttendance'));
        }
        if (isWorker) {
            setIndex(allRoutes.findIndex(route => route.key === 'campusAttendance'));
        }
        if (params?.route) {
            setIndex(allRoutes.findIndex(route => route.key === params?.route));
        }
    };

    useScreenFocus({
        onFocus: routeFocus,
    });

    React.useEffect(() => {
        routeFocus();
    }, []);

    return (
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: allRoutes }}
                tabBarScroll={allRoutes.length > 2 && isMobile}
            />
            {/* TODO: Uncomment one resolved with IOS */}
            {/* <If condition={isCampusPastor || isGlobalPastor || isQcHOD}>
                <StaggerButtonComponent
                    buttons={[
                        {
                            color: 'green.600',
                            iconName: 'download-outline',
                            handleClick: goToExport,
                            iconType: 'ionicon',
                        },
                    ]}
                />
            </If> */}
        </ViewWrapper>
    );
};

export default Attendance;
