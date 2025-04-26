import React from 'react';
import { Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { DynamicHeader } from '@components/composite/header';

interface ICongressHeaderProps {
    title: string;
    scrollOffsetY: Animated.Value;
    navigation: NativeStackNavigationProp<ParamListBase, string, undefined>;
}

const CongressHeader: React.FC<ICongressHeaderProps> = ({ scrollOffsetY, navigation, ...props }) => {
    return <DynamicHeader animHeaderValue={scrollOffsetY} {...props} />;
};

export default CongressHeader;
