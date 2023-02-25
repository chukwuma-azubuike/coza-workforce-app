import React from 'react';
import { Center, Text } from 'native-base';
import LottieView from 'lottie-react-native';
import If from '../../composite/if-container';
import ButtonComponent from '../button';
import useRole from '../../../hooks/role';

const Empty: React.FC<{
    message?: string;
    width?: string | number;
    refresh?: () => void;
    isLoading?: boolean;
}> = ({ message, width = 320, refresh, isLoading }) => {
    const handleRefresh = () => {
        refresh && refresh();
    };

    const {
        user: { gender },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const EMPTY_MESSAGE = 'No records to show yet';

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
                {isCampusPastor || isGlobalPastor
                    ? `${message ? message : EMPTY_MESSAGE} ${gender === 'M' ? 'sir' : 'ma'}`
                    : EMPTY_MESSAGE}
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
