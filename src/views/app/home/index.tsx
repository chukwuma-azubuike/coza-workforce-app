import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Clocker from './clocker';
import ViewWrapper from '../../../components/layout/viewWrapper';
import TopNav from './top-nav';
import { usePreventGoBack } from '../../../hooks/navigation';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import useRole from '../../../hooks/role';
import { IAttendance, IService } from '../../../store/types';
import { useGetLatestAttendanceByUserIdQuery } from '../../../store/services/attendance';
import If from '../../../components/composite/if-container';
import GSPView from './global-senior-pastors';
import Utils from '../../../utils';
import { HomeSkeleton } from '../../../components/layout/skeleton';
import { CampusReportSummary } from './report-summary';

interface IInitialHomeState {
    latestService: {
        data: IService | undefined;
        isError: boolean;
        isSuccess: boolean;
        isLoading: boolean;
    };
    latestAttendance: {
        latestAttendanceData: IAttendance | undefined;
        latestAttendanceIsError: boolean;
        latestAttendanceIsSuccess: boolean;
        latestAttendanceIsLoading: boolean;
    };
}

export const HomeContext = React.createContext({} as IInitialHomeState);

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    usePreventGoBack();

    const { user, isGlobalPastor, isCampusPastor } = useRole();

    const { data, isError, isSuccess, isLoading, refetch } =
        useGetLatestServiceQuery(user?.campus.id as string, {
            skip: !user,
            refetchOnMountOrArgChange: true,
        });

    const {
        data: latestAttendanceData,
        isError: latestAttendanceIsError,
        isSuccess: latestAttendanceIsSuccess,
        isLoading: latestAttendanceIsLoading,
        refetch: latestAttendanceRefetch,
    } = useGetLatestAttendanceByUserIdQuery(user?.userId as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    const initialState = {
        latestService: { data, isError, isSuccess, isLoading },
        latestAttendance: {
            latestAttendanceData,
            latestAttendanceIsError,
            latestAttendanceIsSuccess,
            latestAttendanceIsLoading,
        },
    };

    const handleRefresh = () => {
        if (!isGlobalPastor) {
            refetch();
            latestAttendanceRefetch();
        }
    };

    React.useEffect(() => {
        Utils.checkLocationPermission();
        Utils.requestLocationPermission();
    }, []);

    return (
        <HomeContext.Provider value={initialState}>
            {!user ? (
                <ViewWrapper>
                    <HomeSkeleton />
                </ViewWrapper>
            ) : (
                <>
                    <ViewWrapper
                        scroll
                        flex={1}
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                    >
                        <If condition={user ? true : false}>
                            <TopNav {...navigation} />
                            <If condition={!isGlobalPastor}>
                                <Clocker />
                            </If>
                            <If condition={isGlobalPastor}>
                                <GSPView />
                            </If>
                        </If>
                    </ViewWrapper>
                    <If condition={isCampusPastor}>
                        <ViewWrapper noPadding maxH={320}>
                            <CampusReportSummary serviceId={data?.id} />
                        </ViewWrapper>
                    </If>
                </>
            )}
        </HomeContext.Provider>
    );
};

export default Home;
