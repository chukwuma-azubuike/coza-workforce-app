import React from 'react';
import { View } from 'react-native';
import { ViewProps } from 'react-native';

interface IHStackComponent extends ViewProps {
    space?: number;
}

const HStackComponent: React.FC<IHStackComponent> = ({ children, space, ...props }) => {
    return (
        <View
            {...props}
            style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: (space || 1) * 2,
                justifyContent: 'space-between',
                ...(props.style as {}),
            }}
        >
            {children}
        </View>
    );
};

export default HStackComponent;
