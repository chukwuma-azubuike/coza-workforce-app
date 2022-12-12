import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Clocker from './clocker';
import ViewWrapper from '../../../components/layout/viewWrapper';
import TopNav from './top-nav';
import { usePreventGoBack } from '../../../hooks/navigation';

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    usePreventGoBack();

    return (
        <ViewWrapper>
            <>
                <TopNav {...navigation} />
                <Clocker />
            </>
        </ViewWrapper>
    );
};

export default Home;
