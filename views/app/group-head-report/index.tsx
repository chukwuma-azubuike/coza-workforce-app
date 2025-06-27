import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import ErrorBoundary from '@components/composite/error-boundary';
import { useCustomBackNavigation, usePreventGoBack } from '@hooks/navigation';
import useRole from '@hooks/role';
import Utils from '@utils/index';
import useScreenFocus from '@hooks/focus';
import { GroupHeadReportSummary } from '../home/campus-pastors/report-summary';
import { useAppDispatch } from '@store/hooks';
import { userActionTypes } from '@store/services/users';
import { useGetUserByIdQuery } from '@store/services/account';
import { useGetLatestServiceQuery } from '@store/services/services';
import useGeoLocation from '@hooks/geo-location';
import Geolocation from '@react-native-community/geolocation';
import GhClocker from '../home/workers/gh-clocker';

const GroupHeadReports: React.FC<NativeStackScreenProps<ParamListBase>> = () => {
    const dispatch = useAppDispatch();
    const { user } = useRole();

    usePreventGoBack();

    const { data: currentUserData, refetch: refetchCurrentUser } = useGetUserByIdQuery(user?._id);

    const { refetch, data: latestService } = useGetLatestServiceQuery(user?.campus?._id as string, {
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
            <GhClocker
                showReport
                isInRange={isInRange}
                refreshLocation={refresh}
                refreshTrigger={refreshTrigger}
                setRefreshTrigger={setRefreshTrigger}
                deviceCoordinates={deviceCoordinates}
                verifyRangeBeforeAction={verifyRangeBeforeAction}
            />
            <GroupHeadReportSummary
                campusId={user?.campus?._id}
                refetchService={handleRefresh}
                serviceId={latestService?._id as string}
            />
        </ErrorBoundary>
    );
};

export default GroupHeadReports;
