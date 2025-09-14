import React, { forwardRef } from 'react';
import {
    KeyboardAvoidingView,
    RefreshControl,
    ScrollView,
    View,
    ViewProps,
    useColorScheme,
    Platform,
    KeyboardAvoidingViewProps,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Empty from '../atoms/empty';
import { cn } from '~/lib/utils';

interface IViewWrapperProps extends ViewProps {
    scroll?: boolean;
    noPadding?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    avoidKeyboard?: boolean;
    avoidKeyboardOffset?: number;
    avoidKeyboardBehavior?: KeyboardAvoidingViewProps['behavior'];
}

const THEME = { light: 'white', dark: 'black' } as const;

const ViewWrapper = forwardRef<any, IViewWrapperProps>(
    (
        {
            scroll = false,
            noPadding = false,
            refreshing = false,
            onRefresh,
            avoidKeyboard = false,
            avoidKeyboardOffset = 30,
            avoidKeyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
            style,
            className,
            children,
            ...rest
        },
        ref
    ) => {
        const Container: React.ComponentType<any> = scroll ? ScrollView : View;
        const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

        const content = scroll ? (
            // default ScrollView when not avoiding keyboard
            <KeyboardAwareScrollView
                innerRef={ref as any}
                enableOnAndroid={false}
                extraScrollHeight={avoidKeyboardOffset}
                contentContainerStyle={[{ paddingHorizontal: noPadding ? 0 : 6 }, style]}
                refreshControl={
                    onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                className={cn('bg-background', className)}
                {...rest}
            >
                {children ?? <Empty />}
            </KeyboardAwareScrollView>
        ) : (
            // non-scrollable view
            <View
                ref={ref}
                {...rest}
                className={cn('bg-background', className)}
                style={[{ paddingHorizontal: noPadding ? 0 : 6 }, style]}
            >
                {children ?? <Empty />}
            </View>
        );

        if (avoidKeyboard) {
            return (
                <KeyboardAvoidingView
                    style={{ flex: 1, position: 'relative', backgroundColor: THEME[scheme] }}
                    keyboardVerticalOffset={avoidKeyboardOffset}
                    behavior={avoidKeyboardBehavior}
                >
                    {content}
                </KeyboardAvoidingView>
            );
        }

        return content;
    }
);

export default ViewWrapper;
