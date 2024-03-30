import React from 'react';
import { View } from 'react-native';
import { ViewProps } from 'react-native';

interface IHStackComponent extends ViewProps {
    space?: number;
}

const VStackComponent: React.FC<IHStackComponent> = ({ children, space, ...props }) => {
    return (
        <View
            {...props}
            style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                gap: (space || 1) * 2,
                flexDirection: 'column',
                justifyContent: 'space-between',
                ...(props.style as {}),
            }}
        >
            {children}
        </View>
    );
};

export default React.memo(VStackComponent);
