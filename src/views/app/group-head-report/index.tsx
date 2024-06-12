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
import { View } from 'react-native';
import Clocker from '../home/workers/clocker';

const GroupHeadReportss: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
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

    const { user, isGlobalPastor } = useRole();

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

    const { refresh, isInRange, deviceCoordinates, verifyRangeBeforeAction } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
    });

    const [refreshTrigger, setRefreshTrigger] = React.useState<boolean>(false);

    const handleRefresh = () => {
        refresh();
        refetchCurrentUser();
        refetch();
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

    return (
        <ErrorBoundary>
            <Clocker
                isInRange={isInRange}
                refreshLocation={refresh}
                refreshTrigger={refreshTrigger}
                setRefreshTrigger={setRefreshTrigger}
                deviceCoordinates={deviceCoordinates}
                verifyRangeBeforeAction={verifyRangeBeforeAction}
            />
            <CampusReportSummary
                campusId={user?.campus?._id}
                refetchService={handleRefresh}
                serviceId={latestService?._id as string}
            />
        </ErrorBoundary>
    );
};

export default GroupHeadReportss;
