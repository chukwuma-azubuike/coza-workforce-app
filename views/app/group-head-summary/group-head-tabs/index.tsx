import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
// import { SceneMap } from 'react-native-tab-view';
import { GroupHeadTeamAttendance, GroupHeadTeamPermissionsList, GroupHeadTeamTicketsList } from './lists';
import useMediaQuery from '@hooks/media-query';
import { ROLES } from '@hooks/role';
import useScreenFocus from '@hooks/focus';
import ViewWrapper from '@components/layout/viewWrapper';
import TabComponent from '@components/composite/tabs';
import { IPermission, ITicket } from '@store/types';
import GroupHeadReports from './reports';

const GroupHeadDepartmentActivies: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { isMobile } = useMediaQuery();
    const navigation = props.navigation;

    const { setOptions } = navigation;

    const params = props.route.params as {
        role: ROLES;
        route: string;
        permissions: IPermission;
        tickets: ITicket;
        screenName: string;
        _id: string;
        campusId: string;
        tab: number;
        title: string;
    };

    const ROUTES = [
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'teamPermissions', title: 'Team Permissions' },
        { key: 'teamTickets', title: 'Team Tickets' },
        { key: 'teamReports', title: 'Team Reports' },
    ];

    const groupData = { departmentId: params._id, screenName: params.screenName };
    const reportData = { departmentId: params._id, departmentName: params.title, screenName: params.screenName };

    //TODO: Considering for performance optimisation
    // const renderScene = SceneMap({
    //     teamAttendance: () => <GroupHeadTeamAttendance departmentId={params._id} />,
    //     teamPermissions: () => <GroupHeadTeamPermissionsList params={groupData} />,
    //     teamTickets: () => <GroupHeadTeamTicketsList departmentId={params._id} />,
    //     teamReports: () => <GroupHeadReports params={reportData} />,
    // });

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'teamAttendance':
                return <GroupHeadTeamAttendance departmentId={params._id} />;
            case 'teamPermissions':
                return <GroupHeadTeamPermissionsList params={groupData} />;
            case 'teamTickets':
                return <GroupHeadTeamTicketsList departmentId={params._id} />;
            case 'teamReports':
                return <GroupHeadReports params={reportData} />;
            default:
                return null;
        }
    };

    const [index, setIndex] = React.useState(0);

    const allRoutes = React.useMemo(() => {
        return ROUTES;
    }, []);

    useScreenFocus({
        onFocus: () => setOptions({ title: params.screenName }),
    });

    React.useEffect(() => {
        if (params?.tab) {
            setIndex(params.tab);
        }
    }, []);

    return (
        <ViewWrapper className="flex-1">
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: allRoutes }}
                tabBarScroll={allRoutes.length > 2 && isMobile}
            />
            {/* TODO: Uncomment one resolved with IOS */}
        </ViewWrapper>
    );
};

export default GroupHeadDepartmentActivies;
