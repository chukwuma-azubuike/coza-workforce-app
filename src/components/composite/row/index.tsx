import useMediaQuery from '@hooks/media-query';
import React from 'react';
import { View, ViewProps, StyleSheet, Dimensions } from 'react-native';

interface RowProps extends ViewProps {
    gutter?: number;
}

interface ColProps extends ViewProps {
    span?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    rowGutter?: number;
}

export const Row: React.FC<RowProps> = ({ children, gutter = 0, style, ...rest }) => {
    const marginValue = gutter / 2;
    const marginStyle = { marginLeft: marginValue, marginRight: marginValue };

    return (
        <View style={[styles.row, marginStyle, style, { rowGap: gutter, columnGap: gutter, width: '100%' }]} {...rest}>
            {React.Children.map(children, child => {
                return React.cloneElement<ColProps>(child as any, { rowGutter: gutter });
            })}
        </View>
    );
};

export const Col: React.FC<ColProps> = ({ children, span, rowGutter, sm, md, lg, xl, style, ...rest }) => {
    const screenWidth = Dimensions.get('window').width;
    const { isMobile, isTablet, isTabletPortrait } = useMediaQuery();

    console.log({ rowGutter });

    const getColWidth = (value: number | undefined) => {
        if (value === undefined) return undefined;
        return (
            ((screenWidth * (value / 24)) / screenWidth - (((rowGutter || 0) / 1400) * screenWidth) / screenWidth) *
                100 +
            '%'
        );
    };

    const derivedWidth = React.useMemo(() => {
        if (isTablet) {
            if (lg || xl) {
                return getColWidth(lg || xl);
            } else {
                return getColWidth(md || sm || span);
            }
        }
        if (isTabletPortrait) {
            if (md) {
                return getColWidth(md);
            } else {
                return getColWidth(sm || span);
            }
        }
        if (isMobile) {
            if (sm) {
                return getColWidth(sm);
            } else {
                return getColWidth(span);
            }
        }
    }, [isMobile, isTablet, isTabletPortrait, lg, xl, sm, span]);

    console.log({ derivedWidth });

    return (
        <View style={[{ width: derivedWidth }, style]} {...rest}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
});
