import React from 'react';
import { Animated } from 'react-native';
import { DynamicHeader } from '@components/composite/header';

interface ICongressHeaderProps {
    title: string;
    scrollOffsetY: Animated.Value;
}

const CongressHeader: React.FC<ICongressHeaderProps> = ({ scrollOffsetY, ...props }) => {
    return <DynamicHeader animHeaderValue={scrollOffsetY} {...props} />;
};

export default CongressHeader;
