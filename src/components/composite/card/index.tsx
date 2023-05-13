import React from 'react';
import { VStack, Box, Divider, Text, HStack, IBoxProps } from 'native-base';
import { IIconTypes } from '../../../utils/types';
import { Icon } from '@rneui/themed';
import { StyleSheet, TouchableNativeFeedback } from 'react-native';
import { THEME_CONFIG } from '../../../config/appConfig';
import { CountUp } from 'use-count-up';
import { FlatListSkeleton, ProfileSkeleton } from '../../layout/skeleton';
import useAppColorMode from '../../../hooks/theme/colorMode';

interface ICardComponentProps extends IBoxProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    divider?: boolean;
}

const CardComponent: React.FC<ICardComponentProps> = props => {
    const { isLoading } = props;
    const { isLightMode } = useAppColorMode();

    return (
        <TouchableNativeFeedback
            disabled={false}
            delayPressIn={0}
            onPress={props.onPress}
            accessibilityRole="button"
            background={TouchableNativeFeedback.Ripple(
                isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                false,
                220
            )}
            // style={{ paddingHorizontal: 20 }}
        >
            <Box
                py={2}
                m={2}
                {...props}
                flex={[0, 1]}
                borderWidth={0.2}
                borderRadius={3}
                style={style.shadowProp}
                _dark={{ backgroundColor: 'gray.900' }}
                _light={{ backgroundColor: 'white', borderColor: 'gray.400' }}
            >
                {isLoading ? (
                    <ProfileSkeleton count={9} />
                ) : (
                    <VStack space="4" divider={props.divider ? <Divider /> : undefined}>
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
                )}
            </Box>
        </TouchableNativeFeedback>
    );
};

const style = StyleSheet.create({
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});

export default CardComponent;

interface IStatCardComponentProps {
    value?: number | string;
    label?: string;
    prefix?: string;
    suffix?: string;
    percent?: boolean;
    iconName?: string;
    iconColor?: string;
    iconType?: IIconTypes;
    isLoading?: boolean;
    onPress?: () => void;
}

export const StatCardComponent: React.FC<IStatCardComponentProps> = React.memo(props => {
    const { iconColor = THEME_CONFIG.success, percent, isLoading, onPress } = props;

    return (
        <CardComponent w={['45.6%', '20%']} h={135} onPress={onPress}>
            {isLoading ? (
                <FlatListSkeleton count={2} />
            ) : (
                <HStack justifyContent="space-between" borderWidth={0} w="100%">
                    <VStack w="100%" justifyContent="space-between" h={110}>
                        <HStack justifyContent="space-between" w="100%" alignItems="center">
                            <Text
                                bold
                                fontSize="4xl"
                                _dark={{ color: 'primary.500' }}
                                _light={{ color: 'primary.600' }}
                            >
                                <CountUp isCounting duration={2} end={props?.value ? +props?.value : 0} />
                            </Text>
                            <Text fontSize="md" fontWeight="light" color={iconColor ? iconColor : 'success.400'}>
                                {percent && `${props.suffix}${percent ? '%' : ''}`}
                            </Text>
                        </HStack>
                        <HStack alignItems="center" justifyContent="space-between" w="full">
                            <Text fontWeight="light" color="gray.400" fontSize="lg">
                                {props.label}
                            </Text>
                            {props.iconName && (
                                <Icon name={props.iconName} type={props.iconType} color={iconColor} size={25} />
                            )}
                        </HStack>
                    </VStack>
                </HStack>
            )}
        </CardComponent>
    );
});
