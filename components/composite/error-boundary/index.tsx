import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { ScrollView, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { AlertTriangle } from 'lucide-react-native';
import { Code } from '~/components/ui/typography';

const ErrorBoundary: React.FC<{ children?: ReactNode }> = ({ children }) => {
    return (
        <Sentry.ErrorBoundary
            fallback={({ error, resetError }) => {
                return (
                    <View className="bg-background border border-border rounded-2xl max-w-sm mx-auto my-6 p-6 gap-4 items-center drop-shadow-sm">
                        <AlertTriangle size={48} color="#f87171" />
                        <Text className="text-xl font-bold text-center text-foreground">Something went wrong</Text>
                        <Text className="text-center text-muted-foreground line-clamp-none">
                            An unexpected error occurred. Please try again.
                        </Text>
                        <ScrollView className="max-h-56">
                            <Code>{JSON.stringify(error)}</Code>
                        </ScrollView>
                        <View>
                            <Button size="sm" onPress={resetError} variant="secondary" className="w-full">
                                Retry
                            </Button>
                        </View>
                    </View>
                );
            }}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
};

export default React.memo(ErrorBoundary);
