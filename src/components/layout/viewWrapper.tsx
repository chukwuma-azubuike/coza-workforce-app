import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ViewProps,
    ScrollViewProps,
    useColorScheme,
} from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';
import { useHeaderHeight } from '@react-navigation/elements';
import { ScrollView } from 'react-native';
import { View } from 'react-native';

interface IViewWrapper
    extends ScrollViewProps,
        ViewProps,
        Partial<React.ForwardRefExoticComponent<InterfaceViewProps & React.RefAttributes<unknown>>> {
    scroll?: boolean;
    noPadding?: boolean;
    refreshing?: boolean;
    onRefresh?: (args?: any) => void;
}

enum THEME {
    light = 'white',
    dark = 'black',
}

const ViewWrapper: React.FC<IViewWrapper> = props => {
    const { scroll, onRefresh, refreshing, noPadding } = props;
    const ActiveView = scroll ? ScrollView : View;

    const height = useHeaderHeight();
    const scheme = useColorScheme() as keyof typeof THEME;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            keyboardVerticalOffset={height}
            behavior={Platform.OS === 'ios' ? 'height' : undefined}
        >
            <ActiveView
                {...props}
                refreshControl={
                    onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                }
                style={{
                    ...(props.style as {}),
                    flex: 1,
                    paddingHorizontal: noPadding ? 0 : 6,
                    backgroundColor: THEME[scheme],
                }}
            >
                {props.children ? props.children : <Empty />}
            </ActiveView>
        </KeyboardAvoidingView>
    );
};

export default React.memo(ViewWrapper);
