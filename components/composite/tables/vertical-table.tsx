import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import React, { ReactNode } from 'react';
import If from '../if-container';
import { FlatListSkeleton } from '../../layout/skeleton';
import { cn } from '~/lib/utils';

type Props = {
    title: string;
    children?: any;
    isLoading?: boolean;
    textWrap?: boolean;
    tableData: {
        headers: string[];
        rows: any[];
    };
};

const VerticalTable: React.FC<Props> = ({ title, children, isLoading, tableData, textWrap }) => {
    return (
        <View>
            <Text className="text-left text-base text-muted-foreground mb-2">{title}</Text>
            {children}
            <View className="w-full">
                <If condition={isLoading}>
                    <FlatListSkeleton />
                </If>
                <If condition={!isLoading}>
                    {tableData.rows.length ? (
                        <View className="space-y-1 items-center flex-1">
                            <View className="space-y-1 flex-row flex-1">
                                {tableData?.headers?.map((item, index) => (
                                    <View
                                        className={` items-center flex-1 bg-primary-600 text-left p-3`}
                                        key={`${item}-${index}`}
                                    >
                                        <Text className="text-left">{item}</Text>
                                    </View>
                                ))}
                            </View>
                            <View className="flex-1 w-full gap-1">
                                {tableData?.rows?.map((row, index) => (
                                    <View key={`row-data-${index}`} className="space-y-1 flex-1 flex-row gap-2 w-full">
                                        {Object.values(row)?.map(item => (
                                            <View
                                                className={`items-center p-2 text-left text-muted-foreground bg-muted flex-1`}
                                            >
                                                <Text className={cn('text-left', textWrap && 'line-clamp-none')}>
                                                    {(item as ReactNode) ?? ''}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <Text>None</Text>
                    )}
                </If>
            </View>
        </View>
    );
};

export default React.memo(VerticalTable);
