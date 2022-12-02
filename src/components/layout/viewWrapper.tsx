import React, { ReactChildren } from 'react';
import { ScrollView, View } from 'native-base';
import { ViewProps } from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';
import Empty from '../atoms/empty';

interface IViewWrapper
    extends ViewProps,
        Partial<
            React.ForwardRefExoticComponent<
                InterfaceViewProps & React.RefAttributes<unknown>
            >
        > {
    children?: JSX.Element | ReactChildren;
    scroll?: boolean;
}

const ViewWrapper = (props: IViewWrapper) => {
    const { scroll } = props;
    const ActiveView = scroll ? ScrollView : View;

    return (
        <ActiveView
            pt={6}
            flex={1}
            {...props}
            height="full"
            _dark={{ bg: 'blueGray.900' }}
            _light={{ bg: 'white' }}
            contentContainerStyle={{ paddingBottom: 48 }}
        >
            {props.children ? props.children : <Empty />}
        </ActiveView>
    );
};

export default ViewWrapper;
