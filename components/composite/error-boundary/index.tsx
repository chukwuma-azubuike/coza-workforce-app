import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

const ErrorBoundary: React.FC<{
    children?: ReactNode;
}> = ({ children }) => {
    return (
        <Sentry.ErrorBoundary
            fallback={({ error, resetError }) => (
                <View className="rounded-20 border-0.2 flex-1 p-10 gap-8 bg-rose-300">
                    <Text className="font-bold text-center text-2xl">Oops something broke!</Text>
                    <Button onPress={resetError}>Retry</Button>
                </View>
            )}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default React.memo(ErrorBoundary);
