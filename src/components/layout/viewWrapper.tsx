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
    children?: JSX.Element | ReactChildren;
    scroll?: boolean;
    refreshing?: boolean;
    onRefresh?: (args?: any) => void;
}

const ViewWrapper = (props: IViewWrapper) => {
    const { scroll, onRefresh, refreshing } = props;
    const ActiveView = scroll ? ScrollView : View;

    return (
        <ActiveView
            pt={6}
            flex={1}
            {...props}
            height="full"
            _light={{ bg: 'white' }}
            _dark={{ bg: 'black' }}
            refreshControl={
                <RefreshControl
                    onRefresh={onRefresh}
                    refreshing={refreshing as boolean}
                />
            }
        >
            {props.children ? props.children : <Empty />}
        </ActiveView>
    );
};

export default ViewWrapper;
