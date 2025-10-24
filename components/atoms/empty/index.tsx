import React from 'react';
import LottieView from 'lottie-react-native';
import If from '../../composite/if-container';
import useRole from '@hooks/role';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

const Empty: React.FC<{
    message?: string;
    width?: number;
    refresh?: () => void;
    isLoading?: boolean;
    className?: string;
}> = ({ message, className, width = 300, refresh, isLoading }) => {
    const handleRefresh = () => {
        refresh && refresh();
    };

    const {
        user: { gender },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const EMPTY_MESSAGE = 'No records to show yet';

    const { isDarkColorScheme } = useColorScheme();

    const lottieFile = isDarkColorScheme
        ? require('~/assets/json/empty-dark.json')
        : require('~/assets/json/empty.json');

    return (
        <View className={cn('items-center flex-1 justify-center', className)}>
            <View className="items-center justify-center">
                <LottieView
                    loop
                    autoPlay
                    resizeMode="cover"
                    source={lottieFile}
                    style={{ width, height: width < 100 ? width - 100 : width - 50 }}
                />
                <Text className="text-muted-foreground">
                    {isCampusPastor || isGlobalPastor
                        ? `${message ? message : EMPTY_MESSAGE} ${gender === 'M' ? 'sir' : 'ma'}`
                        : message
                        ? message
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

export default React.memo(Empty);
