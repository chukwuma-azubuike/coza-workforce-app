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
                <View className="rounded-lg max-w-xs mx-auto p-10 gap-8 items-center">
                    <Text className="font-semibold text-center">Oops something broke!</Text>
                    <Button size="sm" variant="outline" onPress={resetError} className="!w-min">
                        Retry
                    </Button>
                </View>
            )}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default React.memo(ErrorBoundary);
