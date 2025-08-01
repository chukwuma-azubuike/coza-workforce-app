import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '@components/composite/tabs';
import { IAttendance, ITicket, IUser } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import Utils from '@utils/index';
import { TicketListRow } from '../../tickets/ticket-list';
import useFetchMoreData from '@hooks/fetch-more-data';
import { useGetTicketsQuery } from '@store/services/tickets';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { myAttendanceColumns } from '../../attendance/flatListConfig';
import { UserReportContext } from './context';
import UserProfileBrief from './UserProfile';
import Loading from '@components/atoms/loading';
import useScreenFocus from '@hooks/focus';
import { Platform } from 'react-native';
const isAndroid = Platform.OS === 'android';

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
                columns={ticketColumns}
                fetchMoreData={fetchMoreData}
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
];

const UserReportDetails: React.FC<{ userId?: string } | undefined> = props => {
    const { userId: contextUserId } = React.useContext(UserReportContext);
    const userId = contextUserId || (props?.userId as string);

    //TODO: Considering for performance optimisation
    // const renderScene = SceneMap({
    //     userTickets: () => <UserTicketsList userId={userId} />,
    //     userAttendance: () => <UserAttendanceList userId={userId} />,
    // });

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'userTickets':
                return <UserTicketsList userId={userId} />;
            case 'userAttendance':
                return <UserAttendanceList userId={userId} />;
            default:
                return null;
        }
    };

    const [index, setIndex] = React.useState(0);

    const { setUserId } = React.useContext(UserReportContext);

    useScreenFocus({
        onFocus: () => {
            !props?.userId && setUserId(undefined);
        },
    });

    return (
        <ViewWrapper className="flex-1">
            {!userId ? (
                <Loading />
            ) : (
                <>
                    <UserProfileBrief userId={userId} />
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

export default UserReportDetails;
