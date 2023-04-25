import React, { ReactChildren } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ViewProps } from 'react-native';
// import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';
import { IScrollViewProps, ScrollView, View } from 'native-base';
import { useHeaderHeight } from '@react-navigation/elements';

interface IViewWrapper
    extends IScrollViewProps,
        ViewProps,
        Partial<React.ForwardRefExoticComponent<InterfaceViewProps & React.RefAttributes<unknown>>> {
    children?: JSX.Element | ReactChildren | React.ReactNode;
    scroll?: boolean;
    noPadding?: boolean;
    refreshing?: boolean;
    onRefresh?: (args?: any) => void;
}

const ViewWrapper = (props: IViewWrapper) => {
    const { scroll, onRefresh, refreshing, noPadding } = props;
    const ActiveView = scroll ? ScrollView : View;

    const height = useHeaderHeight();

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            keyboardVerticalOffset={height}
            behavior={Platform.OS === 'ios' ? 'height' : undefined}
        >
            <ActiveView
                _dark={{ background: 'black' }}
                _light={{ background: 'white' }}
                style={{ flex: 1, padding: noPadding ? 0 : 6, paddingVertical: 16, paddingBottom: 0 }}
                refreshControl={
                    onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                }
                flex={1}
                {...props}
            >
                {props.children ? props.children : <Empty />}
            </ActiveView>
        </KeyboardAvoidingView>
    );
};

export default ViewWrapper;
