import React from 'react';
import { Center, Text } from 'native-base';
const LottieView = require('lottie-react-native');
import If from '../../composite/if-container';
import ButtonComponent from '../button';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';

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

    const { isDarkMode } = useAppColorMode();

    const lottieFile = isDarkMode
        ? require('@assets/json/empty-dark.json')
        : require('@assets/json/empty.json');

    return (
        <Center>
            <LottieView loop autoPlay style={{ width }} resizeMode="cover" source={lottieFile} />
            <Text fontSize="md" color="gray.400" semi-bold>
                {isCampusPastor || isGlobalPastor
                    ? `${message ? message : EMPTY_MESSAGE} ${gender === 'M' ? 'sir' : 'ma'}`
                    : message
                    ? message
                    : EMPTY_MESSAGE}
            </Text>
            <If condition={refresh && true}>
                <ButtonComponent mt={8} secondary size="sm" width={100} isLoading={isLoading} onPress={handleRefresh}>
                    Reload
                </ButtonComponent>
            </If>
        </Center>
    );
};

export default Empty;
