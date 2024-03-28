import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { Text, VStack } from 'native-base';
import ButtonComponent from '../../atoms/button';

const ErrorBoundary: React.FC<{
    children?: ReactNode;
}> = ({ children }) => {
    return (
        <Sentry.ErrorBoundary
            fallback={({ error, componentStack, resetError }) => (
                <VStack
                    justifyContent="center"
                    borderColor="rose.400"
                    borderRadius="lg"
                    borderWidth={1}
                    bg="rose.100"
                    space={2}
                    w="100%"
                    p={4}
                >
                    <Text textAlign="center">Oops something broke!</Text>
                    <ButtonComponent
                        borderColor="rose.400"
                        justifyItems="center"
                        onClick={resetError}
                        variant="outline"
                        bg="rose.400"
                        color="white"
                        secondary
                        size="xs"
                    >
                        <Text textAlign="left" color="black">
                            Retry
                        </Text>
                    </ButtonComponent>
                </VStack>
            )}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default React.memo(ErrorBoundary);
