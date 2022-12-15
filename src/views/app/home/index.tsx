import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Clocker from './clocker';
import ViewWrapper from '../../../components/layout/viewWrapper';
import TopNav from './top-nav';
import { usePreventGoBack } from '../../../hooks/navigation';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import useRole from '../../../hooks/role';
import { IService } from '../../../store/types';

interface IInitialHomeState {
    latestService: {
        data: IService | undefined;
        isError: boolean;
        isSuccess: boolean;
        isLoading: boolean;
    };
}

export const HomeContext = React.createContext({} as IInitialHomeState);

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    usePreventGoBack();

    const { user } = useRole();

    const { data, isError, isSuccess, isLoading } = useGetLatestServiceQuery(
        user?.campus.id as string,
        { skip: !user, refetchOnMountOrArgChange: true }
    );

    const initialState = {
        latestService: { data, isError, isSuccess, isLoading },
    };

    return (
        <HomeContext.Provider value={initialState}>
            <ViewWrapper>
                <>
                    <TopNav {...navigation} />
                    <Clocker />
                </>
            </ViewWrapper>
        </HomeContext.Provider>
    );
};

export default Home;
