import React from 'react';
import { Platform } from 'react-native';
import ViewWrapper from '@components/layout/viewWrapper';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '@components/composite/tabs';
import { IAttendance, IPermission, ITicket, IUser } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import Utils from '@utils/index';
// import { useGetPermissionsQuery } from '@store/services/permissions';
// import { PermissionListRow } from '../../permissions/permissions-list';
import { TicketListRow } from '../../tickets/ticket-list';
import useFetchMoreData from '@hooks/fetch-more-data';
import { useGetTicketsQuery } from '@store/services/tickets';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { myAttendanceColumns } from '../../attendance/flatListConfig';
import { UserReportContext } from './context';
import UserProfileBrief from './UserProfile';
import Loading from '@components/atoms/loading';
import useScreenFocus from '@hooks/focus';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
const isAndroid = Platform.OS === 'android';

// const UserPermissionsList: React.FC<{ userId: IUser['_id'] }> = React.memo(({ userId }) => {
//     const permissionsColumns: IFlatListColumn[] = [
//         {
//             dataIndex: 'dateCreated',
//             render: (_: IPermission, key) => <PermissionListRow type="own" {..._} key={key} />,
//         },
//     ];

//     const [page, setPage] = React.useState<number>(1);

//     const { data, isLoading, isFetching, isSuccess } = useGetPermissionsQuery(
//         { requestor: userId, limit: 20, page },
//         { skip: !userId, refetchOnMountOrArgChange: true }
//     );

//     const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

//     const fetchMoreData = () => {
//         if (!isFetching && !isLoading) {
//             if (data?.length) {
//                 setPage(prev => prev + 1);
//             } else {
//                 setPage(prev => prev - 1);
//             }
//         }
//     };

//     return (
//         <ErrorBoundary>
//             <FlatListComponent
//                 data={moreData}
//                 refreshing={isFetching}
//                 columns={permissionsColumns}
//                 fetchMoreData={fetchMoreData}
//                 isLoading={isLoading || isFetching}
//             />
//         </ErrorBoundary>
//     );
// });

const UserTicketsList: React.FC<{ userId: IUser['_id'] }> = React.memo(({ userId }) => {
    const ticketColumns: IFlatListColumn[] = [
        {
            dataIndex: '_id',
            render: (_: ITicket, key) => <TicketListRow type="own" {..._} key={key} />,
        },
    ];

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isFetching, isSuccess } = useGetTicketsQuery(
        { userId, limit: 20, page },
        {
            skip: !userId,
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const memoizedData = React.useMemo(() => Utils.groupListByKey(moreData || [], 'createdAt'), [moreData]);

    return (
        <ErrorBoundary>
            <FlatListComponent
                data={memoizedData}
                refreshing={isFetching}
                fetchMoreData={fetchMoreData}
                columns={ticketColumns}
                isLoading={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});

const UserAttendanceList: React.FC<{ userId: IUser['_id'] }> = React.memo(({ userId }) => {
    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isFetching, isSuccess } = useGetAttendanceQuery(
        {
            limit: 20,
            userId,
            page,
        },
        { skip: !userId, refetchOnMountOrArgChange: true }
    );

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: '_id' });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    return (
        <ErrorBoundary>
            <FlatListComponent
                padding={isAndroid ? 3 : true}
                fetchMoreData={fetchMoreData}
                columns={myAttendanceColumns}
                data={moreData as IAttendance[]}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

const ROUTES = [
    { key: 'userAttendance', title: 'Attendance' },
    { key: 'userTickets', title: 'Tickets' },
    // { key: 'userPermissions', title: 'Permissions' },
];

const UserReportDetailsPage: React.FC<NativeStackScreenProps<ParamListBase>> = ({ route }) => {
    const params = route.params as { userId: string };
    const userId = params?.userId;

    const renderScene = SceneMap({
        userTickets: () => <UserTicketsList userId={userId} />,
        userAttendance: () => <UserAttendanceList userId={userId} />,
        // userPermissions: () => <UserPermissionsList userId={userId} />,
    });

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            {!userId ? (
                <Loading />
            ) : (
                <>
                    <UserProfileBrief userId={userId} isMobileView={true} />
                    <TabComponent
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        navigationState={{ index, routes: ROUTES }}
                    />
                </>
            )}
        </ViewWrapper>
    );
};

export default UserReportDetailsPage;
