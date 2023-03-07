import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Clocker from './workers/clocker';
import ViewWrapper from '../../../components/layout/viewWrapper';
import TopNav from './top-nav';
import { usePreventGoBack } from '../../../hooks/navigation';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import useRole from '../../../hooks/role';
import { IAttendance, IService } from '../../../store/types';
import { useGetAttendanceQuery } from '../../../store/services/attendance';
import If from '../../../components/composite/if-container';
import GSPView from './global-senior-pastors';
import Utils from '../../../utils';
import { HomeSkeleton } from '../../../components/layout/skeleton';
import { CampusReportSummary } from './campus-pastors/report-summary';
import { selectCurrentUser, userActionTypes } from '../../../store/services/users';
import { useGetUserByIdQuery } from '../../../store/services/account';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import useScreenFocus from '../../../hooks/focus';
import { Box } from 'native-base';

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
        data: latestService,
        isError,
        isSuccess,
        isLoading,
        refetch,
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
            userId: user?.userId as string,
            serviceId: latestService?._id,
        },
        {
            skip: !user && !latestService,
            refetchOnMountOrArgChange: true,
        }
    );

    const [deviceCoordinates, setDeviceCoordinates] = React.useState<GeoCoordinates>(null as unknown as GeoCoordinates);

    const initialState = {
        latestService: { data: latestService, isError, isSuccess, isLoading },
        latestAttendance: {
            latestAttendanceData,
            latestAttendanceIsError,
            latestAttendanceIsSuccess,
            latestAttendanceIsLoading,
        },
        currentCoordinates: deviceCoordinates,
    };

    const handleRefresh = () => {
        if (!isGlobalPastor) {
            refetch();
            latestAttendanceRefetch();
            Geolocation.watchPosition(props => {
                setDeviceCoordinates(props.coords);
            });
        }
    };

    React.useEffect(() => {
        Utils.checkLocationPermission();
        Utils.requestLocationPermission();
        Geolocation.watchPosition(({ coords }) => {
            setDeviceCoordinates(coords);
        });
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
            {!user ? (
                <ViewWrapper>
                    <HomeSkeleton />
                </ViewWrapper>
            ) : (
                <>
                    <ViewWrapper scroll={!isCampusPastor} refreshing={isLoading} onRefresh={handleRefresh}>
                        <If condition={user ? true : false}>
                            <TopNav {...navigation} />
                            <If condition={!isGlobalPastor}>
                                <Clocker />
                            </If>
                            <If condition={isGlobalPastor}>
                                <GSPView />
                            </If>
                        </If>
                        <If condition={isCampusPastor}>
                            <CampusReportSummary
                                refetchService={handleRefresh}
                                serviceId={latestService?._id}
                            />
                        </If>
                    </ViewWrapper>
                </>
            )}
        </HomeContext.Provider>
    );
};

export default Home;
