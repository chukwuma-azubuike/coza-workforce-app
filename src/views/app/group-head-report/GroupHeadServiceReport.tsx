import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Stack } from 'native-base';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import { FlatListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import { useCustomBackNavigation, usePreventGoBack } from '@hooks/navigation';
import useRole from '@hooks/role';
import { useGetGHCampusByIdQuery } from '@store/services/campus';
import Utils from '@utils';
import useScreenFocus from '@hooks/focus';
import { CampusReportSummary } from '../home/campus-pastors/report-summary';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectCurrentUser, userActionTypes } from '@store/services/users';
import { useGetUserByIdQuery } from '@store/services/account';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import { useGetAttendanceQuery } from '@store/services/attendance';
import useGeoLocation from '@hooks/geo-location';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { IAttendance, IService } from '@store/types';
import { Platform, View } from 'react-native';
import Clocker from '../home/workers/clocker';
import { HomeContext } from '../home';

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
        skip: !user,
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
            userId: latestService && (user?.userId as string), // Passing the userId an undefined value negates the call
            serviceId: latestService?._id,
        },
        {
            skip: !latestService, // Fetch only if there is a service available
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
        refetch();
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

    useCustomBackNavigation({ targetRoute: 'More' });

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
                    />
                    <CampusReportSummary
                        campusId={user?.campus?._id}
                        refetchService={handleRefresh}
                        serviceId={latestService?._id as string}
                    />
                </ErrorBoundary>
            </ViewWrapper>
        </HomeContext.Provider>
    );
};

export default GroupHeadServiceReport;
