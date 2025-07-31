import React, { forwardRef } from 'react';
import {
    KeyboardAvoidingView,
    RefreshControl,
    ScrollView,
    View,
    ViewProps,
    ScrollViewProps,
    useColorScheme,
    Platform,
    KeyboardAvoidingViewProps,
} from 'react-native';
import Empty from '../atoms/empty';
import { cn } from '~/lib/utils';

interface IViewWrapperProps extends ViewProps, ScrollViewProps {
    scroll?: boolean;
    noPadding?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    avoidKeyboard?: boolean;
    avoidKeyboardOffset?: number;
    avoidKeyboardBehavior?: KeyboardAvoidingViewProps['behavior'];
}

const THEME = {
    light: 'white',
    dark: 'black',
} as const;

const ViewWrapper = forwardRef<any, IViewWrapperProps>(
    (
        {
            scroll = false,
            noPadding = false,
            refreshing = false,
            onRefresh,
            avoidKeyboard = false,
            avoidKeyboardOffset = 96,
            avoidKeyboardBehavior = 'position',
            style,
            className,
            children,
            ...rest
        },
        ref
    ) => {
        const Container: React.ComponentType<any> = scroll ? ScrollView : View;
        const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

        const content = (
            <Container
                ref={ref}
                {...rest}
                className={cn('bg-background', className)}
                style={[{ paddingHorizontal: noPadding ? 0 : 6 }, style]}
                refreshControl={
                    onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
                }
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                {children ?? <Empty />}
            </Container>
        );

        if (avoidKeyboard) {
            return (
                <KeyboardAvoidingView
                    style={{
                        flex: 1,
                        position: 'relative',
                        backgroundColor: THEME[scheme],
                    }}
                    keyboardVerticalOffset={avoidKeyboardOffset}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {content}
                </KeyboardAvoidingView>
            );
        }

        return content;
    }
);

export default ViewWrapper;
