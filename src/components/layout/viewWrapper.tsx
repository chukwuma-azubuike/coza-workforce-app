import React, { ReactChildren } from 'react';
import { RefreshControl, View, ScrollView, ViewProps, ScrollViewProps } from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';

interface IViewWrapper
    extends ScrollViewProps,
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

    return (
        <ActiveView
            {...props}
            style={{ flex: 1, padding: noPadding ? 0 : 6, paddingVertical: 16, backgroundColor: 'white' }}
            refreshControl={onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />}
        >
            {props.children ? props.children : <Empty />}
        </ActiveView>
    );
};

export default ViewWrapper;
