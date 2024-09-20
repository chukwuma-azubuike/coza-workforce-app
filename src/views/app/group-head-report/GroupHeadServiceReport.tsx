import ErrorBoundary from '@components/composite/error-boundary';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import useGeoLocation from '@hooks/geo-location';
import { useCustomBackNavigation, usePreventGoBack } from '@hooks/navigation';
import useRole from '@hooks/role';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useGetUserByIdQuery } from '@store/services/account';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { IGHSubmittedReport } from '@store/services/reports';
import { useGetLatestServiceQuery } from '@store/services/services';
import { selectCurrentUser, userActionTypes } from '@store/services/users';
import { IAttendance, IService } from '@store/types';
import Utils from '@utils';
import React from 'react';
import { Platform } from 'react-native';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { HomeContext } from '../home';
import { GroupHeadReportSummary } from '../home/campus-pastors/report-summary';
import Clocker from '../home/workers/clocker';

interface IInitialHomeState {
    latestService: {
        data?: IService;
        isError: boolean;
        isSuccess: boolean;
        isLoading: boolean;
    };
    latestAttendance: {
        latestAttendanceIsError: boolean;
        latestAttendanceData?: IAttendance[];
        latestAttendanceIsSuccess: boolean;
        latestAttendanceIsLoading: boolean;
    };
    currentCoordinate: GeoCoordinates;
}

const GroupHeadServiceReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const dispatch = useAppDispatch();
    const currentUserId = useAppSelector(store => selectCurrentUser(store)).userId;

    usePreventGoBack();
    const prop = props.route.params as IGHSubmittedReport;

    const {
        error,
        data: currentUserData,
        refetch: refetchCurrentUser,
        isLoading: userLoading,
        isFetching: userFetching,
    } = useGetUserByIdQuery(currentUserId);

    const { user } = useRole();

    const {
        isError,
        refetch,
        isSuccess,
        isLoading,
        data: latestService,
    } = useGetLatestServiceQuery(user?.campus?._id as string, {
        skip: !user || !!prop?.serviceId,
        refetchOnMountOrArgChange: true,
    });

    const {
        data: latestAttendanceData,
        isError: latestAttendanceIsError,
        isSuccess: latestAttendanceIsSuccess,
        isLoading: latestAttendanceIsLoading,
        isUninitialized: latestAttendanceisUninitialized,
        refetch: latestAttendanceRefetch,
    } = useGetAttendanceQuery(
        {
            userId: (latestService || prop?.serviceId) && (user?.userId as string), // Passing the userId an undefined value negates the call
            serviceId: prop?.serviceId ?? latestService?._id,
        },
        {
            skip: !latestService && !prop?.serviceId, // Fetch only if there is a service available
            refetchOnMountOrArgChange: true,
        }
    );

    const initialState = {
        latestService: { data: latestService, isError, isSuccess, isLoading },
        latestAttendance: {
            latestAttendanceData,
            latestAttendanceIsError,
            latestAttendanceIsSuccess,
            latestAttendanceIsLoading,
        },
    };

    const { refresh, isInRange, deviceCoordinates, verifyRangeBeforeAction } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
    });

    const [refreshTrigger, setRefreshTrigger] = React.useState<boolean>(false);

    const handleRefresh = () => {
        refresh();
        refetchCurrentUser();
        !prop?.serviceId && refetch();
        !latestAttendanceisUninitialized && latestAttendanceRefetch();
        setRefreshTrigger(true);
        Utils.checkLocationPermission(refresh);
    };

    React.useEffect(() => {
        Utils.checkLocationPermission(refresh);
    }, []);

    React.useEffect(() => {
        if (currentUserData) {
            dispatch({
                type: userActionTypes.SET_USER_DATA,
                payload: currentUserData,
            });
        }
    }, [currentUserData]);

    useScreenFocus({
        onFocusExit: () => {
            Geolocation.stopObserving();
        },
    });

    const now = Math.floor(Date.now() / 1000); // Current time in seconds (UNIX timestamp)

    useCustomBackNavigation({ targetRoute: prop?.serviceId ? 'GH reports history' : 'Home' });

    const isIOS = Platform.OS === 'ios';

    return (
        <HomeContext.Provider value={initialState as unknown as IInitialHomeState}>
            <ViewWrapper
                refreshing={isLoading}
                onRefresh={handleRefresh}
                style={{ paddingTop: isIOS ? 20 : 40 }}
                scroll
            >
                <ErrorBoundary>
                    <Clocker
                        isInRange={isInRange}
                        refreshLocation={refresh}
                        refreshTrigger={refreshTrigger}
                        setRefreshTrigger={setRefreshTrigger}
                        deviceCoordinates={deviceCoordinates}
                        verifyRangeBeforeAction={verifyRangeBeforeAction}
                        isGh
                        ghReport={prop}
                    />
                    <GroupHeadReportSummary
                        refetchService={handleRefresh}
                        serviceId={prop?.serviceId ?? (latestService?._id as string)}
                    />
                </ErrorBoundary>
            </ViewWrapper>
        </HomeContext.Provider>
    );
};

export default GroupHeadServiceReport;
