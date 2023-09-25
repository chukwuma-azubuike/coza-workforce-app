import Loading from '@components/atoms/loading';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useMediaQuery from '@hooks/media-query';
import useAppColorMode from '@hooks/theme/colorMode';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import React, { FC } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import {
    VictoryChart,
    VictoryBar,
    VictoryAxis,
    VictoryStack,
    VictoryLabel,
    VictoryVoronoiContainer,
    VictoryPie,
    VictoryLegend,
} from 'victory-native';

export type IStackedHistogramData = {
    [key in string]: number;
}[][];

interface StackedHistogramProps {
    xAxisLabel?: string;
    yAxisLabel?: string;
    data: IStackedHistogramData;
    entityKey: string;
    valueKey: string;
    title: string;
    height?: number;
    isLoading?: boolean;
    stackColors: string[];
}

interface BarChartProps {
    xAxisLabel?: string;
    yAxisLabel?: string;
    data: any[];
    entityKey: string;
    valueKey: string;
    title: string;
    barColor?: string;
    isLoading?: boolean;
    horizontal?: boolean;
}

export const BarChart: FC<BarChartProps> = ({
    data,
    xAxisLabel = '',
    yAxisLabel = '',
    entityKey,
    valueKey,
    title,
    horizontal,
    isLoading,
    barColor = THEME_CONFIG.primary,
}) => {
    const tickFormat = React.useMemo(() => data?.flatMap(item => item[entityKey]), [data, entityKey]);
    const tickValues = React.useMemo(() => data?.flatMap(item => item[valueKey]), [data, valueKey]);
    const { isDarkMode } = useAppColorMode();
    const { isMobile } = useMediaQuery();

    return (
        <View style={[styles.container, isMobile && { width: '100%' }]}>
            <Text
                style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    textAlign: 'center',
                    color: isDarkMode ? THEME_CONFIG.lightGray : 'black',
                }}
            >
                {title}
            </Text>
            {isLoading ? (
                <Loading />
            ) : (
                <ScrollView horizontal={true}>
                    <VictoryChart
                        height={600}
                        animate={{
                            duration: 2000,
                            onLoad: { duration: 1000 },
                        }}
                        horizontal={horizontal}
                        containerComponent={<VictoryVoronoiContainer />}
                        width={isMobile ? ScreenWidth - 20 : ScreenWidth / 2 - 20}
                    >
                        <VictoryBar
                            data={data}
                            x={entityKey}
                            y={valueKey}
                            barWidth={26}
                            labels={({ datum }) => datum[valueKey]}
                            style={{ data: { fill: barColor }, labels: { fill: 'white', angle: -90 } }}
                            labelComponent={
                                <VictoryLabel
                                    dy={-80}
                                    dx={-2}
                                    textAnchor="middle"
                                    verticalAnchor="middle"
                                    style={{ fill: 'white', fontSize: 20 }}
                                />
                            }
                        />
                        <VictoryAxis
                            label={xAxisLabel}
                            style={{
                                axisLabel: {
                                    fontSize: 16,
                                },
                                tickLabels: {
                                    fontSize: 14,
                                    angle: -60,
                                    textAnchor: 'end',
                                    padding: 10,
                                    fill: isDarkMode ? 'white' : 'black',
                                },
                            }}
                            tickValues={tickValues}
                            tickFormat={tickFormat}
                        />
                        <VictoryAxis
                            dependentAxis
                            label={yAxisLabel}
                            style={{
                                axisLabel: {
                                    fontSize: 16,
                                },
                                tickLabels: {
                                    padding: 20,
                                    fontSize: 16,
                                    fill: isDarkMode ? 'white' : 'black',
                                    textAnchor: 'end', // Anchor labels at the end
                                },
                                axis: {
                                    stroke: 'none',
                                },
                            }}
                        />
                    </VictoryChart>
                </ScrollView>
            )}
        </View>
    );
};

export const StackedHistogram: FC<StackedHistogramProps> = ({
    data,
    xAxisLabel = '',
    yAxisLabel = '',
    entityKey,
    valueKey,
    stackColors,
    title,
    isLoading,
    height = ScreenHeight / 2,
}) => {
    const tickFormat = React.useMemo(() => data?.flatMap(item => item.map(key => key[entityKey])), [data, entityKey]);
    const tickValues = React.useMemo(() => data?.flatMap(item => item.map(key => key[valueKey])), [data, valueKey]);
    const { isDarkMode } = useAppColorMode();
    const { isMobile } = useMediaQuery();

    return (
        <ViewWrapper style={[styles.container, { height }]}>
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: isDarkMode ? THEME_CONFIG.lightGray : 'black',
                }}
            >
                {title}
            </Text>
            {isLoading ? (
                <Loading />
            ) : (
                <ScrollView horizontal={true}>
                    <VictoryChart
                        height={height - 46}
                        width={isMobile ? ScreenWidth * 1.8 : ScreenWidth - 500}
                        animate={{
                            duration: 2000,
                            onLoad: { duration: 1000 },
                        }}
                        containerComponent={<VictoryVoronoiContainer />}
                    >
                        <VictoryStack>
                            {data?.map((series, index) => (
                                <VictoryBar
                                    key={index}
                                    data={series}
                                    x={entityKey}
                                    y={valueKey}
                                    width={40}
                                    labels={({ datum }) => datum[valueKey]}
                                    barWidth={26}
                                    style={{
                                        labels: { fill: 'white', angle: -90 },
                                        data: { fill: stackColors[index] },
                                    }}
                                    labelComponent={
                                        <VictoryLabel
                                            dy={0}
                                            dx={-30}
                                            style={{ fill: 'white', fontSize: 20 }}
                                            verticalAnchor="middle"
                                            textAnchor="middle"
                                        />
                                    }
                                />
                            ))}
                        </VictoryStack>
                        <VictoryAxis
                            label={xAxisLabel}
                            style={{
                                axisLabel: {
                                    fontSize: 16,
                                },
                                tickLabels: {
                                    fontSize: 16,
                                    angle: -20,
                                    textAnchor: 'end',
                                    padding: 2,
                                    fill: isDarkMode ? 'white' : 'black',
                                },
                                axis: { height: 700 },
                            }}
                            tickValues={tickValues}
                            tickFormat={tickFormat}
                        />
                        <VictoryAxis
                            dependentAxis
                            label={yAxisLabel}
                            style={{
                                axisLabel: {
                                    fontSize: 16,
                                    padding: 40,
                                },
                                tickLabels: {
                                    fontSize: 16,
                                    padding: 20,
                                    fill: isDarkMode ? 'white' : 'black',
                                    textAnchor: 'end', // Anchor labels at the end
                                },
                                axis: {
                                    stroke: 'none',
                                },
                            }}
                        />
                        <VictoryLegend
                            gutter={20}
                            colorScale={stackColors}
                            orientation="horizontal"
                            data={[{ name: 'Early' }, { name: 'Late' }, { name: 'Absent' }]}
                            style={{
                                labels: { fill: isDarkMode ? 'white' : 'black', fontSize: 18 },
                            }}
                        />
                    </VictoryChart>
                </ScrollView>
            )}
        </ViewWrapper>
    );
};

interface IPieChartProps {
    title?: string;
    isLoading?: boolean;
    data: { label: string; x: number; y: number }[];
}

export const PieChart: React.FC<IPieChartProps> = props => {
    const { isMobile } = useMediaQuery();
    const { isDarkMode } = useAppColorMode();

    const totalData = React.useMemo(
        () => props.data?.map((datum: { y: number }) => datum.y).reduce((a, b) => a + b),
        [props.data]
    );

    return (
        <View style={[styles.container]}>
            <Text
                style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    textAlign: 'center',
                    color: isDarkMode ? THEME_CONFIG.lightGray : 'black',
                }}
            >
                {props.title}
            </Text>
            {props.isLoading ? (
                <Loading />
            ) : (
                <VictoryPie
                    {...props}
                    height={600}
                    data={props.data}
                    style={{ labels: { fill: 'white', fontSize: 18 } }}
                    width={isMobile ? ScreenWidth : ScreenWidth / 2}
                    labelRadius={isMobile ? ScreenWidth / 10 : ScreenWidth / 20}
                    radius={({ datum }) => (isMobile ? ScreenWidth / 6 : ScreenWidth / 12) + datum.y * 20}
                    labelComponent={
                        <VictoryLabel text={({ datum }) => `${datum.label} \n (${(datum.y / totalData) * 100})%   `} />
                    }
                    colorScale={[
                        THEME_CONFIG.primary,
                        'orange',
                        THEME_CONFIG.rose,
                        THEME_CONFIG.primaryLight,
                        THEME_CONFIG.gray,
                        THEME_CONFIG.lightGray,
                    ]}
                    labelPlacement="parallel"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 6,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
});
