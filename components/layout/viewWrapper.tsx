import React from 'react';
import {
    KeyboardAvoidingView,
    RefreshControl,
    ViewProps,
    ScrollViewProps,
    useColorScheme,
    ScrollView,
    Platform,
    KeyboardAvoidingViewProps,
} from 'react-native';
import Empty from '../atoms/empty';
import { View } from 'react-native';
import { cn } from '~/lib/utils';

interface IViewWrapper
    extends ScrollViewProps,
        ViewProps,
        Partial<React.ForwardRefExoticComponent<ViewProps & React.RefAttributes<unknown>>> {
    scroll?: boolean;
    noPadding?: boolean;
    refreshing?: boolean;
    avoidKeyboard?: boolean;
    avoidKeyboardOffset?: number;
    onRefresh?: (args?: any) => void;
    avoidKeyboardBehavior?: KeyboardAvoidingViewProps['behavior'];
}

enum THEME {
    light = 'white',
    dark = 'black',
}

const ViewWrapper: React.FC<IViewWrapper> = props => {
    const { scroll, onRefresh, refreshing, noPadding, avoidKeyboard, avoidKeyboardOffset, avoidKeyboardBehavior } =
        props;
    const ActiveView = scroll ? ScrollView : View;
    const scheme = useColorScheme() as keyof typeof THEME;

    return (
        <>
            {avoidKeyboard ? (
                <KeyboardAvoidingView
                    keyboardVerticalOffset={avoidKeyboardOffset}
                    contentContainerStyle={{ position: 'relative' }}
                    style={{
                        flex: 1,
                        backgroundColor: THEME[scheme],
                    }}
                    behavior={Platform.OS === 'ios' ? avoidKeyboardBehavior || 'position' : undefined}
                >
                    <ActiveView
                        {...props}
                        className={cn('bg-background', props.className)}
                        refreshControl={
                            onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                        }
                        style={{
                            paddingHorizontal: noPadding ? 0 : 6,
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        {props.children ? props.children : <Empty />}
                    </ActiveView>
                </KeyboardAvoidingView>
            ) : (
                <ActiveView
                    {...props}
                    className={cn('bg-background', props.className)}
                    refreshControl={
                        onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                    }
                    style={{
                        flex: 1,
                        paddingHorizontal: noPadding ? 0 : 6,
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    {props.children ? props.children : <Empty />}
                </ActiveView>
            )}
        </>
    );
};

export default ViewWrapper;
