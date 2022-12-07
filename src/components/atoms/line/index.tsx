import { Box, IBoxProps } from 'native-base';
import { ResponsiveValue } from 'native-base/lib/typescript/components/types';
import React from 'react';

interface LineComponent extends IBoxProps {
    color: string;
    width: ResponsiveValue<
        | 'lg'
        | 'md'
        | 'sm'
        | 'xs'
        | 'xl'
        | '2xl'
        | (string & {})
        | (number & {})
        | 'none'
        | '3xl'
        | 'full'
    >;
    height: ResponsiveValue<
        | 'lg'
        | 'md'
        | 'sm'
        | 'xs'
        | 'xl'
        | '2xl'
        | (string & {})
        | (number & {})
        | 'none'
        | '3xl'
        | 'full'
    >;
}

export const Line: React.FC<LineComponent> = props => {
    const { color, width, height } = props;
    return <Box {...{ width, height }} bgColor={color} {...props} />;
};
