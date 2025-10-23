import React from 'react';
import LottieView from 'lottie-react-native';
import If from '../../composite/if-container';
import useRole from '@hooks/role';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

const Error: React.FC<{
    message?: string;
    width?: number;
    refresh?: () => void;
    isLoading?: boolean;
}> = ({ message = 'Network error', width = 300, refresh, isLoading }) => {
    const handleRefresh = () => {
        refresh && refresh();
    };

    const {
        user: { gender },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const EMPTY_MESSAGE = message?.replace('TypeError: ', '');
    const lottieFile = require('~/assets/json/error.json');

    return (
        <View className="items-center flex-1 justify-center">
            <View className="items-center gap-4 justify-center">
                <LottieView
                    loop
                    autoPlay
                    resizeMode="cover"
                    source={lottieFile}
                    style={{ width, height: width - 100 }}
                />
                <Text className="text-muted-foreground text-xl">
                    {isCampusPastor || isGlobalPastor
                        ? `${EMPTY_MESSAGE} ${gender === 'M' ? 'sir' : 'ma'}`
                        : EMPTY_MESSAGE}
                </Text>
                <If condition={refresh && true}>
                    <Button className="mt-4 w-24 !h-10" size="sm" isLoading={isLoading} onPress={handleRefresh}>
                        Retry
                    </Button>
                </If>
            </View>
        </View>
    );
};

export default React.memo(Error);
