import React from 'react';
import { Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { DynamicHeader } from '@components/composite/header';

interface ICGWCHeaderProps {
    title: string;
    scrollOffsetY: Animated.Value;
    navigation: NativeStackNavigationProp<ParamListBase, string, undefined>;
}

const CGWCHeader: React.FC<ICGWCHeaderProps> = ({ scrollOffsetY, navigation, ...props }) => {
    return <DynamicHeader animHeaderValue={scrollOffsetY} {...props} />;
};

export default CGWCHeader;
