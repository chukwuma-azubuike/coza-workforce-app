import React from 'react';
import {
    KeyboardAvoidingView,
    RefreshControl,
    ViewProps,
    ScrollViewProps,
    useColorScheme,
    ScrollView,
    KeyboardAvoidingViewProps,
} from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';
import { View } from 'react-native';
import { isIOS } from '@rneui/base';

interface IViewWrapper
    extends ScrollViewProps,
        ViewProps,
        Partial<React.ForwardRefExoticComponent<InterfaceViewProps & React.RefAttributes<unknown>>> {
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
                    keyboardVerticalOffset={avoidKeyboardOffset || isIOS ? 100 : 150}
                    contentContainerStyle={{ position: 'relative' }}
                    style={{
                        flex: 1,
                        backgroundColor: THEME[scheme],
                    }}
                    behavior={isIOS ? avoidKeyboardBehavior || 'position' : undefined}
                >
                    <ActiveView
                        {...props}
                        refreshControl={
                            onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                        }
                        style={{
                            paddingHorizontal: noPadding ? 0 : 6,
                            backgroundColor: THEME[scheme],
                            ...(props.style as {}),
                        }}
                    >
                        {props.children ? props.children : <Empty />}
                    </ActiveView>
                </KeyboardAvoidingView>
            ) : (
                <ActiveView
                    {...props}
                    refreshControl={
                        onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                    }
                    style={{
                        flex: 1,
                        paddingHorizontal: noPadding ? 0 : 6,
                        backgroundColor: THEME[scheme],
                        ...(props.style as {}),
                    }}
                >
                    {props.children ? props.children : <Empty />}
                </ActiveView>
            )}
        </>
    );
};

export default ViewWrapper;
