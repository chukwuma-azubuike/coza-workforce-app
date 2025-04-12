import { Text } from '~/components/ui/text';
import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { Button, View } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import ViewWrapper from '@components/layout/viewWrapper';

const ErrorBoundary: React.FC<{
    children?: ReactNode;
}> = ({ children }) => {
    const { textColor } = useAppColorMode();
    return (
        <Sentry.ErrorBoundary
            fallback={({ error, resetError }) => (
                <ViewWrapper scroll style={{ paddingVertical: 6 }}>
                    <View className="rounded-20 border-0.2 flex-0 p-20 gap-8">
                        <Text className="font-bold text-center text-2xl">Oops something broke!</Text>
                        <Button onPress={resetError} color={textColor} title="Retry" />
                    </View>
                </ViewWrapper>
            )}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default React.memo(ErrorBoundary);
