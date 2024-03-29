import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Clocker from './workers/clocker';
import ViewWrapper from '@components/layout/viewWrapper';
import { usePreventGoBack } from '@hooks/navigation';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetAttendanceQuery } from '@store/services/attendance';
import If from '@components/composite/if-container';
import GSPView from './global-senior-pastors';
import Utils from '@utils/index';
import { CampusReportSummary } from './campus-pastors/report-summary';
import { selectCurrentUser, userActionTypes } from '@store/services/users';
import { useGetUserByIdQuery } from '@store/services/account';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import useScreenFocus from '@hooks/focus';
import useGeoLocation from '@hooks/geo-location';
import { Platform } from 'react-native';

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

export const HomeContext = React.createContext({} as IInitialHomeState);

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
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

    const { user, isGlobalPastor, isCampusPastor } = useRole();

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

    const { data: services, refetch: refetchServices, isSuccess: servicesIsSuccess } = useGetServicesQuery({});

    const { refresh, isInRange, deviceCoordinates, verifyRangeBeforeAction } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
    });

    const [refreshTrigger, setRefreshTrigger] = React.useState<boolean>(false);

    const handleRefresh = () => {
        refresh();
        refetchCurrentUser();
        refetchServices();
        if (!isGlobalPastor) {
            refetch();
            !latestAttendanceisUninitialized && latestAttendanceRefetch();
        }
        setRefreshTrigger(true);
        Utils.checkLocationPermission();
    };

    React.useEffect(() => {
        Utils.checkLocationPermission();
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

    const isIOS = Platform.OS === 'ios';

    return (
        <HomeContext.Provider value={initialState as unknown as IInitialHomeState}>
            <ViewWrapper
                pt={isIOS ? 10 : 4}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                scroll={!(isCampusPastor || isGlobalPastor)}
            >
                <If condition={!!user}>
                    <If condition={!isGlobalPastor}>
                        <Clocker
                            isInRange={isInRange}
                            refreshLocation={refresh}
                            refreshTrigger={refreshTrigger}
                            setRefreshTrigger={setRefreshTrigger}
                            deviceCoordinates={deviceCoordinates}
                            verifyRangeBeforeAction={verifyRangeBeforeAction}
                        />
                    </If>
                    <If condition={isGlobalPastor}>
                        <GSPView servicesIsSuccess={servicesIsSuccess} services={services as IService[]} />
                    </If>
                </If>
                <If condition={isCampusPastor}>
                    <CampusReportSummary
                        campusId={user?.campus?._id}
                        refetchService={handleRefresh}
                        serviceId={latestService?._id as string}
                    />
                </If>
            </ViewWrapper>
        </HomeContext.Provider>
    );
};

export default React.memo(Home);
