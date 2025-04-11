import React from 'react';
import LottieView from 'lottie-react-native';
import If from '../../composite/if-container';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

const Empty: React.FC<{
    message?: string;
    width?: number;
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

    const lottieFile = isDarkMode ? require('@assets/json/empty-dark.json') : require('@assets/json/empty.json');

    return (
        <View className="items-center flex-1 justify-center">
            <LottieView loop autoPlay style={{ width }} resizeMode="cover" source={lottieFile} />
            <Text className="text-muted-foreground font-light">
                {isCampusPastor || isGlobalPastor
                    ? `${message ? message : EMPTY_MESSAGE} ${gender === 'M' ? 'sir' : 'ma'}`
                    : message
                    ? message
                    : EMPTY_MESSAGE}
            </Text>
            <If condition={refresh && true}>
                <Button className="mt-4 w-24" size="sm" isLoading={isLoading} onPress={handleRefresh}>
                    Reload
                </Button>
            </If>
        </View>
    );
};

export default React.memo(Empty);
