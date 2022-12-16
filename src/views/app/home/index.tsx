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

    const { user } = useRole();

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
        refetch();
        latestAttendanceRefetch();
    };

    return (
        <HomeContext.Provider value={initialState}>
            <ViewWrapper
                scroll
                refreshing={isLoading}
                onRefresh={handleRefresh}
            >
                <>
                    <TopNav {...navigation} />
                    <Clocker />
                </>
            </ViewWrapper>
        </HomeContext.Provider>
    );
};

export default Home;
