import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import VStackComponent from '@components/layout/v-stack';
import { THEME_CONFIG } from '@config/appConfig';
import TextComponent from '@components/text';
import { Button, Text } from 'react-native';
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
                    <VStackComponent
                        style={{
                            borderColor: THEME_CONFIG.rose,
                            borderRadius: 20,
                            borderWidth: 0.2,
                            flex: 0,
                            backgroundColor: THEME_CONFIG.lightRose,
                            padding: 20,
                        }}
                        space={8}
                    >
                        <TextComponent size="lg" bold style={{ textAlign: 'center' }}>
                            Oops something broke!
                        </TextComponent>
                        <Button onPress={resetError} color={textColor} title="Retry" />
                    </VStackComponent>
                </ViewWrapper>
            )}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default React.memo(ErrorBoundary);
