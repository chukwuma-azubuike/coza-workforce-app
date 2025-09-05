import React from 'react';
import Clocker from './workers/clocker';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetAttendanceQuery } from '@store/services/attendance';
import If from '@components/composite/if-container';
import GSPView from './global-senior-pastors';
import Utils from '@utils/index';
import { CampusReportSummary } from './campus-pastors/report-summary';
import { LocationObjectCoords } from 'expo-location';
import useGeoLocation from '@hooks/geo-location';
import { Platform, SafeAreaView as RNSafeAreaView, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView as SACSafeAreaView } from 'react-native-safe-area-context';

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
    currentCoordinate: LocationObjectCoords;
}

export const HomeContext = React.createContext({} as IInitialHomeState);

const Home: React.FC = () => {
    const { user, isGlobalPastor, isGroupHead, isCampusPastor } = useRole();

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
        refetchServices();
        if (!isGlobalPastor) {
            refetch();
            !latestAttendanceisUninitialized && latestAttendanceRefetch();
        }
        setRefreshTrigger(true);
        Utils.checkLocationPermission(refresh);
    };

    React.useEffect(() => {
        Utils.checkLocationPermission(refresh);
    }, []);

    const SafeAreaView = Platform.OS === 'ios' ? RNSafeAreaView : SACSafeAreaView;

    return (
        <HomeContext.Provider value={initialState as unknown as IInitialHomeState}>
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <If condition={!!user}>
                        <If condition={!isGlobalPastor}>
                            <Clocker
                                isInRange={isInRange}
                                refreshLocation={refresh}
                                refreshTrigger={refreshTrigger}
                                setRefreshTrigger={setRefreshTrigger}
                                deviceCoordinates={deviceCoordinates as any}
                                verifyRangeBeforeAction={verifyRangeBeforeAction}
                            />
                        </If>
                        <If condition={isGlobalPastor}>
                            <GSPView servicesIsSuccess={servicesIsSuccess} services={services as IService[]} />
                        </If>
                    </If>
                    <If condition={isCampusPastor}>
                        <CampusReportSummary
                            refetchService={handleRefresh}
                            campusId={user?.campus?._id as string}
                            serviceId={latestService?._id as string}
                        />
                    </If>
                </View>
            </SafeAreaView>
        </HomeContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default React.memo(Home);
