import { Text } from '~/components/ui/text';
import React from 'react';
import { IIconTypes } from '@utils/types';
import { Icon } from '@rneui/themed';
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import { CountUp } from 'use-count-up';
import { FlatListSkeleton, ProfileSkeleton } from '../../layout/skeleton';
import useAppColorMode from '@hooks/theme/colorMode';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils';

interface ICardComponentProps extends ViewProps {
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
            className="py-2"
            {...props}
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
                <View className="gap-4">
                    {props.header && <View className="pt-4">{props.header}</View>}
                    {props.divider && props.header && <Separator />}
                    <View className="px-4">{props.children}</View>
                    {props.divider && props.footer && <Separator />}
                    {props.footer && <View className="pb-4">{props.footer}</View>}
                </View>
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
    cardProps?: ViewProps;
    width?: string | string[] | number | number[];
}

export const StatCardComponent: React.FC<IStatCardComponentProps> = React.memo(props => {
    const {
        iconColor = THEME_CONFIG.success,
        percent,
        isLoading,
        onPress,
        bold,
        marginActive = true,
        cardProps,
    } = props;

    return (
        <CardComponent className={cn('h-32', marginActive && 'm-2')} {...cardProps}>
            {isLoading ? (
                <FlatListSkeleton count={2} />
            ) : (
                <TouchableOpacity onPress={props.onPress} style={{ margin: marginActive ? 4 : 0 }} activeOpacity={0.6}>
                    <View className="justify-between border-none w-full">
                        <View className="w-full justify-between h-28">
                            <View className="justify-between w-full items-center">
                                <Text className="font-bold text-5xl text-primary ">
                                    <CountUp isCounting duration={2} end={props?.value ? +props?.value : 0} />
                                </Text>
                                <Text className={cn('font-light text-green-500')} style={{ color: iconColor }}>
                                    {percent && `${props.suffix}${percent ? '%' : ''}`}
                                </Text>
                            </View>
                            <View className="items-center justify-between w-full">
                                <Text className={cn('font-light text-muted-foreground font-2xl', bold && 'font-bold')}>
                                    {props.label}
                                </Text>
                                {props.iconName && (
                                    <Icon name={props.iconName} type={props.iconType} color={iconColor} size={25} />
                                )}
                            </View>
                        </View>
                    </View>
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
                <FlatListSkeleton count={6} />
            ) : (
                <View className="w-full items-center justify-center px-4 gap-2 bg-muted-background rounded-xl border border-border">
                    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
                        <View className="gap-1 items-center justify-center p-3">
                            <Text className="font-semibold text-center">{props.label}</Text>
                            <Text className="font-bold text-4xl">{props?.value}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
        <View className="my-6 p-4 border rounded-md flex-row items-center justify-between justify-items-center border-gray-200">
            {summaryList.map((item, index) => (
                <View key={index} className="items-center justify-center my-2">
                    <Text className="text-base">{item.title}</Text>
                    <Text className="text-2xl">{item.value}</Text>
                </View>
            ))}
        </View>
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
        <View>
            <View className="w-full p-4 flex-wrap flex-row items-stretch justify-items-center justify-between">
                {summaryList?.map((item, index) => (
                    <View key={index} className="items-center justify-center my-2 w-1/2">
                        <View className="gap-2 w-full rounded-sm justify-center" style={{ flex: item.flex }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onPress(item)}>
                                <View className="gap-1 items-center p-3">
                                    <Text className="text-base font-semibold text-center">{item.title}</Text>
                                    <Text className="font-bold">{item.value}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
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
