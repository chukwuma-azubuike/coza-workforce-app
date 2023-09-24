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
    barColor = THEME_CONFIG.primary,
}) => {
    const tickFormat = React.useMemo(() => data?.flatMap(item => item[entityKey]), [data, entityKey]);
    const tickValues = React.useMemo(() => data?.flatMap(item => item[valueKey]), [data, valueKey]);
    const { isDarkMode } = useAppColorMode();

    return (
        <View style={styles.container}>
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
            <ScrollView horizontal={true}>
                <VictoryChart
                    height={400}
                    animate={{
                        duration: 2000,
                        onLoad: { duration: 1000 },
                    }}
                    width={ScreenWidth / 2 - 20}
                    horizontal={horizontal}
                    containerComponent={<VictoryVoronoiContainer />}
                >
                    <VictoryBar
                        data={data}
                        x={entityKey}
                        y={valueKey}
                        labels={({ datum }) => datum[valueKey]}
                        style={{ data: { fill: barColor }, labels: { fill: 'white', angle: -90 } }}
                        labelComponent={
                            <VictoryLabel
                                dx={-40}
                                dy={0}
                                style={{ fill: 'white' }}
                                verticalAnchor="middle"
                                textAnchor="middle"
                            />
                        }
                    />
                    <VictoryAxis
                        label={xAxisLabel}
                        style={{
                            axisLabel: {
                                fontSize: 16,
                                padding: 30,
                            },
                            tickLabels: {
                                fontSize: 12,
                                angle: -45,
                                textAnchor: 'end',
                            },
                            axis: {},
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
                                fontSize: 12,
                                textAnchor: 'end', // Anchor labels at the end
                            },
                            axis: {
                                stroke: 'none',
                            },
                        }}
                    />
                </VictoryChart>
            </ScrollView>
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
    height = ScreenHeight / 2,
}) => {
    const tickFormat = React.useMemo(() => data?.flatMap(item => item.map(key => key[entityKey])), [data, entityKey]);
    const tickValues = React.useMemo(() => data?.flatMap(item => item.map(key => key[valueKey])), [data, valueKey]);
    const { isDarkMode } = useAppColorMode();

    return (
        <View style={[styles.container, { height }]}>
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
            <ScrollView horizontal={true}>
                <VictoryChart
                    height={400}
                    width={700}
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
                                labels={({ datum }) => datum[valueKey]}
                                style={{
                                    data: { fill: stackColors[index] },
                                    labels: { fill: 'white', angle: -90 },
                                }}
                                labelComponent={
                                    <VictoryLabel
                                        dx={-40}
                                        dy={0}
                                        style={{ fill: 'white' }}
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
                                fontSize: 18,
                                padding: 30,
                            },
                            tickLabels: {
                                fontSize: 20,
                                angle: -45,
                                textAnchor: 'end',
                                height: 100,
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
                                fontSize: 18,
                                padding: 40,
                            },
                            tickLabels: {
                                fontSize: 20,
                                padding: 20,
                                textAnchor: 'end', // Anchor labels at the end
                            },
                            axis: {
                                stroke: 'none',
                            },
                        }}
                    />
                </VictoryChart>
            </ScrollView>
        </View>
    );
};

interface IPieChartProps {
    title?: string;
    data: { label: string; x: number; y: number }[];
}

export const PieChart: React.FC<IPieChartProps> = props => {
    const { isMobile } = useMediaQuery();
    const { isDarkMode } = useAppColorMode();

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
            <VictoryPie
                {...props}
                data={props.data}
                labelRadius={20}
                height={400}
                style={{ labels: { fill: 'white', fontSize: 18 } }}
                radius={({ datum }) => 40 + datum.y * 20}
                width={isMobile ? ScreenWidth - 20 : ScreenWidth / 2}
                labelComponent={<VictoryLabel text={({ datum }) => `${datum.label} (${datum.y})`} />}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white', // White background for the chart container
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
