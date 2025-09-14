import React from 'react';
import { View } from 'react-native';
import { ViewProps } from 'react-native';

interface IVStackComponent extends ViewProps {
    space?: number;
}

const VStackComponent: React.FC<IVStackComponent> = ({ children, space, ...props }) => {
    return (
        <View
            {...props}
            style={{
                flex: 1,
                gap: (space || 1) * 2,
                ...(props.style as {}),
            }}
        >
            {children}
        </View>
    );
};

export default VStackComponent;
