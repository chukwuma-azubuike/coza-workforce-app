import React from 'react';
import { Center, Text } from 'native-base';
import LottieView from 'lottie-react-native';
import If from '../../composite/if-container';
import ButtonComponent from '../button';

const Empty: React.FC<{
    message?: string;
    width?: string | number;
    refresh?: () => void;
    isLoading?: boolean;
}> = ({ message, width = 320, refresh, isLoading }) => {
    const handleRefresh = () => {
        refresh && refresh();
    };

    return (
        <Center>
            <LottieView
                source={require('../../../assets/json/empty.json')}
                style={{ width }}
                resizeMode="cover"
                autoPlay
                loop
            />
            <Text fontSize="md" color="gray.400" semi-bold>
                {message ? message : 'No records to show yet'}
            </Text>
            <If condition={refresh && true}>
                <ButtonComponent secondary size="sm" width={100} isLoading={isLoading} onPress={handleRefresh}>
                    Reload
                </ButtonComponent>
            </If>
        </Center>
    );
};

export default Empty;
