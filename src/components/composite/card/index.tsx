import React from 'react';
import { VStack, Box, Divider, Text, HStack } from 'native-base';
import { IIconTypes } from '../../../utils/types';
import { Icon } from '@rneui/themed';
import { StyleSheet } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { THEME_CONFIG } from '../../../config/appConfig';
import { CountUp } from 'use-count-up';

interface ICardComponentProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    divider?: boolean;
}

const CardComponent: React.FC<ICardComponentProps> = props => {
    return (
        <Shadow distance={4} style={{ borderRadius: 10 }}>
            <Box
                pt={2}
                pb={4}
                borderWidth={0.2}
                borderRadius="md"
                borderColor="gray.400"
                style={style.shadowProp}
            >
                <VStack
                    space="4"
                    divider={props.divider ? <Divider /> : undefined}
                >
                    {props.header && (
                        <Box px="4" pt="4">
                            {props.header}
                        </Box>
                    )}
                    <Box px="4">{props.children}</Box>
                    {props.footer && (
                        <Box px="4" pb="4">
                            {props.footer}
                        </Box>
                    )}
                </VStack>
            </Box>
        </Shadow>
    );
};

const style = StyleSheet.create({
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});

export default CardComponent;

interface IStatCardComponentProps {
    value: number | string;
    label?: string;
    prefix?: string;
    suffix?: string;
    iconName?: string;
    iconColor?: string;
    iconType?: IIconTypes;
}

export const StatCardComponent: React.FC<IStatCardComponentProps> = props => {
    const { iconColor = THEME_CONFIG.success } = props;

    return (
        <CardComponent>
            <HStack justifyContent="space-between" style={{ width: 140 }}>
                <VStack pr={2}>
                    <HStack
                        justifyContent="space-between"
                        style={{ width: 140 }}
                    >
                        <Text bold fontSize="4xl" color="primary.600">
                            <CountUp
                                isCounting
                                duration={2}
                                end={+props?.value}
                            />
                        </Text>
                        <Text
                            fontSize="md"
                            fontWeight="light"
                            color={!iconColor ? 'success.600' : 'success.600'}
                            style={{ color: iconColor ? iconColor : undefined }}
                        >
                            {props.suffix}
                        </Text>
                    </HStack>
                    <HStack alignItems="center" justifyContent="space-between">
                        <Text fontWeight="light" color="gray.400" fontSize="lg">
                            {props.label}
                        </Text>
                        {props.iconName && (
                            <Icon
                                name={props.iconName}
                                type={props.iconType}
                                color={iconColor}
                                size={25}
                            />
                        )}
                    </HStack>
                </VStack>
            </HStack>
        </CardComponent>
    );
};
