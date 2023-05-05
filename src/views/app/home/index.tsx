import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Clocker from './workers/clocker';
import ViewWrapper from '../../../components/layout/viewWrapper';
import TopNav from './top-nav';
import { usePreventGoBack } from '../../../hooks/navigation';
import { useGetLatestServiceQuery, useGetServicesQuery } from '../../../store/services/services';
import useRole from '../../../hooks/role';
import { IAttendance, IService } from '../../../store/types';
import { ICampusCoordinates, useGetAttendanceQuery } from '../../../store/services/attendance';
import If from '../../../components/composite/if-container';
import GSPView from './global-senior-pastors';
import Utils from '../../../utils';
import { CampusReportSummary } from './campus-pastors/report-summary';
import { selectCurrentUser, userActionTypes } from '../../../store/services/users';
import { useGetUserByIdQuery } from '../../../store/services/account';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import useScreenFocus from '../../../hooks/focus';
import useGeoLocation from '../../../hooks/geo-location';
import { useGetCampusByIdQuery } from '../../../store/services/campus';

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

    const { data: currentUserData } = useGetUserByIdQuery(currentUserId);

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

    const { data: services, refetch: refetchServices, isSuccess: servicesIsSuccess } = useGetServicesQuery();

    const { data: campusData } = useGetCampusByIdQuery(user?.campus?._id);

    const selectCoordinateRef = React.useMemo(() => {
        if (latestService?.isGlobalService) return latestService?.coordinates;

        return campusData?.coordinates;
    }, [latestService, campusData]);

    const campusCoordinates = {
        latitude: selectCoordinateRef?.lat,
        longitude: selectCoordinateRef?.long,
    };

    const { refresh, isInRange, deviceCoordinates, verifyRangeBeforeAction } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
        campusCoordinates: campusCoordinates as ICampusCoordinates,
    });

    const handleRefresh = () => {
        refresh();
        if (!isGlobalPastor) {
            refetch();
            refetchServices();
            latestAttendanceRefetch();
        }
    };

    React.useEffect(() => {
        Utils.checkLocationPermission();
        Utils.requestLocationPermission();
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

    return (
        <HomeContext.Provider value={initialState as unknown as IInitialHomeState}>
            <ViewWrapper scroll={!isCampusPastor} refreshing={isLoading} onRefresh={handleRefresh}>
                <If condition={!!user}>
                    <TopNav {...navigation} />
                    <If condition={!isGlobalPastor}>
                        <Clocker
                            isInRange={isInRange}
                            refreshLocation={refresh}
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

export default Home;
