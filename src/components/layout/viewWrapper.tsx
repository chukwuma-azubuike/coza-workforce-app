import React, { ReactChildren } from 'react';
import { View } from 'native-base';
import { ViewProps } from 'react-native';
import { InterfaceViewProps } from 'native-base/lib/typescript/components/basic/View/types';

interface IViewWrapper
    extends ViewProps,
        Partial<
            React.ForwardRefExoticComponent<
                InterfaceViewProps & React.RefAttributes<unknown>
            >
        > {
    children: JSX.Element | ReactChildren;
}

const ViewWrapper = (props: IViewWrapper) => {
    return (
        <View
            {...props}
            height="full"
            _dark={{ bg: 'blueGray.900' }}
            _light={{ bg: 'blueGray.50' }}
        >
            {props.children}
        </View>
    );
};

export default ViewWrapper;
