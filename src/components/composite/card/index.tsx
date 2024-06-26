import React from 'react';
import { VStack, Box, Divider, Text, HStack, IBoxProps, Stack, Heading, Center } from 'native-base';
import { IIconTypes } from '@utils/types';
import { Icon } from '@rneui/themed';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import { CountUp } from 'use-count-up';
import { FlatListSkeleton, ProfileSkeleton } from '../../layout/skeleton';
import useAppColorMode from '@hooks/theme/colorMode';

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
    const { backgroundColor, borderColor } = useAppColorMode();

    return (
        <View
            py={2}
            // flex={[0, 1]}
            {...props}
            // minWidth={[160, 200]}
            style={[
                {
                    flex: 1,
                    minWidth: 160,
                    borderRadius: 6,
                    borderWidth: 0.2,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                },
                style.shadowProp,
                props.style,
            ]}
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
        </View>
    );
};

export default React.memo(CardComponent);
interface IStatCardComponentProps {
    value?: number | string;
    flex?: number;
    label?: string;
    bold?: boolean;
    prefix?: string;
    suffix?: string;
    percent?: boolean;
    iconName?: string;
    iconColor?: string;
    isLoading?: boolean;
    onPress?: () => void;
    iconType?: IIconTypes;
    marginActive?: boolean;
    cardProps?: IBoxProps;
    width?: string | string[] | number | number[];
}

export const StatCardComponent: React.FC<IStatCardComponentProps> = React.memo(props => {
    const {
        iconColor = THEME_CONFIG.success,
        percent,
        isLoading,
        onPress,
        bold,
        width = ['45%', '20%'],
        marginActive = true,
        cardProps,
    } = props;

    return (
        <CardComponent width={width} m={marginActive ? 2 : 0} h={135} {...cardProps}>
            {isLoading ? (
                <FlatListSkeleton count={2} />
            ) : (
                <TouchableOpacity onPress={props.onPress} style={{ margin: marginActive ? 4 : 0 }} activeOpacity={0.6}>
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
                                <Text fontWeight={bold ? 'bold' : 'light'} color="gray.400" fontSize="lg">
                                    {props.label}
                                </Text>
                                {props.iconName && (
                                    <Icon name={props.iconName} type={props.iconType} color={iconColor} size={25} />
                                )}
                            </HStack>
                        </VStack>
                    </HStack>
                </TouchableOpacity>
            )}
        </CardComponent>
    );
});

export const SmallCardComponent: React.FC<IStatCardComponentProps> = React.memo(props => {
    const { iconColor = THEME_CONFIG.success, percent, isLoading, onPress } = props;
    return (
        <>
            {isLoading ? (
                <FlatListSkeleton count={1} />
            ) : (
                <Stack px="2" flexDirection="column" alignItems="center" justifyItems="center" my={2} w="1/2">
                    <VStack
                        space="2"
                        w="full"
                        style={style.shadowProp}
                        _dark={{ background: 'gray.800' }}
                        _light={{ background: 'white' }}
                        borderRadius={4}
                        flex={1}
                        justifyContent="center"
                    >
                        <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
                            <Stack space="1" flexDirection="column" alignItems="center" justifyItems="center" p={3}>
                                <Heading size="sm" fontWeight="500" color="gray.400" textAlign="center">
                                    {props.label}
                                </Heading>
                                <Text
                                    bold
                                    fontSize="2xl"
                                    _dark={{ color: 'primary.500' }}
                                    _light={{ color: 'primary.600' }}
                                >
                                    <CountUp isCounting duration={2} end={props?.value ? +props?.value : 0} />
                                </Text>
                            </Stack>
                        </TouchableOpacity>
                    </VStack>
                </Stack>
            )}
        </>
    );
});

interface SummaryCardProps {
    title: string;
    color: string;
    value?: string | number;
}

export const SummaryListCard: React.FC<{ summaryList: SummaryCardProps[] }> = React.memo(props => {
    const { summaryList } = props;

    return (
        <Stack
            my={6}
            padding={4}
            borderWidth={1}
            borderRadius={8}
            flexDirection="row"
            alignItems="center"
            justifyItems="center"
            justifyContent="space-between"
            _dark={{ borderColor: 'gray.200' }}
            _light={{ borderColor: 'gray.200' }}
        >
            {summaryList.map((item, index) => (
                <Stack key={index} flexDirection="column" alignItems="center" justifyItems="center" my={2}>
                    <Heading size="xs" fontWeight="400" _dark={{ color: item.color }} _light={{ color: item.color }}>
                        {item.title}
                    </Heading>
                    <Heading size="xl" _dark={{ color: item.color }} _light={{ color: item.color }}>
                        {item.value}
                    </Heading>
                </Stack>
            ))}
        </Stack>
    );
});

interface SummaryListCardFlexProps extends Omit<SummaryCardProps, 'color'> {
    _id: string;
    flex: number;
}

export const SummaryListCardFlex: React.FC<{
    summaryList?: SummaryListCardFlexProps[];
    onPress: (args?: any) => void;
}> = React.memo(props => {
    const { summaryList, onPress } = props;

    return (
        <Center>
            <Stack
                w="full"
                padding={4}
                flexWrap="wrap"
                flexDirection="row"
                alignItems="stretch"
                justifyItems="center"
                justifyContent="space-between"
            >
                {summaryList?.map((item, index) => (
                    <Stack
                        key={index}
                        px="2"
                        flexDirection="column"
                        alignItems="center"
                        justifyItems="center"
                        my={2}
                        w="1/2"
                    >
                        <VStack
                            space="2"
                            w="full"
                            style={style.shadowProp}
                            bg="white"
                            borderRadius={3}
                            flex={item.flex}
                            justifyContent="center"
                        >
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onPress(item)}>
                                <Stack space="1" flexDirection="column" alignItems="center" justifyItems="center" p={3}>
                                    <Heading
                                        size="xs"
                                        fontWeight="500"
                                        _dark={{ color: 'white' }}
                                        _light={{ color: 'black' }}
                                        textAlign="center"
                                    >
                                        {item.title}
                                    </Heading>
                                    <Heading size="md" _dark={{ color: 'white' }} _light={{ color: 'black' }}>
                                        {item.value}
                                    </Heading>
                                </Stack>
                            </TouchableOpacity>
                        </VStack>
                    </Stack>
                ))}
            </Stack>
        </Center>
    );
});

const style = StyleSheet.create({
    shadowProp: {
        shadowRadius: 2,
        shadowOpacity: 0.2,
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 0 },
    },
});
