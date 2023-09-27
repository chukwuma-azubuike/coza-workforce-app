import If from '@components/composite/if-container';
import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface IResponsiveGrid extends Partial<View['props']> {
    gap?: number;
    rowCount?: number;
    children: ReactNode;
}

export const ResponsiveGrid: React.FC<IResponsiveGrid> = ({ gap = 10, children, rowCount, ...props }) => {
    const windowWidth = Dimensions.get('window').width;

    return (
        <View style={[props?.style, styles.container, windowWidth < 600 && styles.smallScreen]} {...props}>
            <If condition={!rowCount}>{children}</If>
            <If condition={!!rowCount}>
                {React.Children.map(children, (child, index) => (
                    <View key={index} style={{ flexBasis: `${100 / (rowCount || 3)}%`, padding: gap }}>
                        {child}
                    </View>
                ))}
            </If>
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

interface IGridItem {
    flexBasis?: string;
    padding?: number;
}

export const GridItem: React.FC<IGridItem> = ({ children, flexBasis, padding = 10 }) => {
    return <View style={[itemStyles.container, { flexBasis, padding }]}>{children}</View>;
};

const itemStyles = StyleSheet.create({
    container: {
        padding: 10,
        flexBasis: '33%',
    },
});
