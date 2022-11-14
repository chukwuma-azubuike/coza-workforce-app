import React, { ReactChildren } from 'react';
import { ScrollView, View } from 'native-base';
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
    scroll?: boolean;
}

const ViewWrapper = (props: IViewWrapper) => {
    const { scroll } = props;
    return scroll ? (
        <ScrollView
            {...props}
            pt={6}
            pb={48}
            height="full"
            contentContainerStyle={{ paddingBottom: 48 }}
            _dark={{ bg: 'blueGray.900' }}
            _light={{ bg: 'blueGray.50' }}
        >
            {props.children}
        </ScrollView>
    ) : (
        <View
            {...props}
            pt={6}
            pb={48}
            height="full"
            _dark={{ bg: 'blueGray.900' }}
            _light={{ bg: 'blueGray.50' }}
        >
            {props.children}
        </View>
    );
};

export default ViewWrapper;
