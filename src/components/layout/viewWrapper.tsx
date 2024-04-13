import React from 'react';
import { KeyboardAvoidingView, RefreshControl, ViewProps, ScrollViewProps, useColorScheme } from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';
import { ScrollView } from 'react-native';
import { View } from 'react-native';

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
}

enum THEME {
    light = 'white',
    dark = 'black',
}

const ViewWrapper: React.FC<IViewWrapper> = props => {
    const { scroll, onRefresh, refreshing, noPadding, avoidKeyboard, avoidKeyboardOffset } = props;
    const ActiveView = scroll ? ScrollView : View;

    const scheme = useColorScheme() as keyof typeof THEME;

    return (
        <ActiveView
            {...props}
            refreshControl={onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />}
            style={{
                flex: 1,
                paddingHorizontal: noPadding ? 0 : 6,
                backgroundColor: THEME[scheme],
                ...(props.style as {}),
            }}
        >
            {avoidKeyboard ? (
                <KeyboardAvoidingView
                    keyboardVerticalOffset={avoidKeyboardOffset}
                    contentContainerStyle={{ flex: 1, position: 'relative' }}
                    style={{ flex: 1 }}
                    behavior="position"
                >
                    {props.children ? props.children : <Empty />}
                </KeyboardAvoidingView>
            ) : props.children ? (
                props.children
            ) : (
                <Empty />
            )}
        </ActiveView>
    );
};

export default React.memo(ViewWrapper);
