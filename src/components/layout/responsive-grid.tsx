import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface IResponsiveGrid extends Partial<View['props']> {
    gap?: number;
    rowCount?: number;
    children: ReactNode;
}

export const ResponsiveGrid: React.FC<IResponsiveGrid> = ({ gap = 10, children, rowCount = 3, ...props }) => {
    const windowWidth = Dimensions.get('window').width;

    return (
        <View style={[props?.style, styles.container, windowWidth < 600 && styles.smallScreen]} {...props}>
            {React.Children.map(children, (child, index) => (
                <View key={index} style={{ flexBasis: `${100 / rowCount}%`, padding: gap }}>
                    {child}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    smallScreen: {
        flexDirection: 'column',
    },
});
