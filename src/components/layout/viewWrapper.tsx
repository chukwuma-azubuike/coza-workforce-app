import React, { ReactChildren } from 'react';
import { IScrollViewProps, ScrollView, View } from 'native-base';
import { RefreshControl, ViewProps } from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';

interface IViewWrapper
    extends IScrollViewProps,
        ViewProps,
        Partial<
            React.ForwardRefExoticComponent<
                InterfaceViewProps & React.RefAttributes<unknown>
            >
        > {
    children?: JSX.Element | ReactChildren | React.ReactNode;
    scroll?: boolean;
    noPadding?: boolean;
    refreshing?: boolean;
    onRefresh?: (args?: any) => void;
}

const ViewWrapper = (props: IViewWrapper) => {
    const { scroll, onRefresh, refreshing, noPadding } = props;
    const ActiveView = scroll ? ScrollView : View;

    return (
        <ActiveView
            pt={noPadding ? 0 : 6}
            flex={1}
            {...props}
            height="full"
            _light={{ bg: props.bg ? props.bg : 'white' }}
            _dark={{ bg: props.bg ? props.bg : 'black' }}
            refreshControl={
                onRefresh && (
                    <RefreshControl
                        onRefresh={onRefresh}
                        refreshing={refreshing as boolean}
                    />
                )
            }
        >
            {props.children ? props.children : <Empty />}
        </ActiveView>
    );
};

export default ViewWrapper;
