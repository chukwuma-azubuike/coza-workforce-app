import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import React, { ReactNode } from 'react';
import Empty from '../../atoms/empty';
import If from '../if-container';
import { FlatListSkeleton } from '../../layout/skeleton';

type Props = {
    title: string;
    isLoading: boolean;
    tableData: {
        headers: string[];
        column: any;
    };
};

const HorizontalTable: React.FC<Props> = ({ title, tableData, isLoading }) => {
    return (
        <View>
            <Text className="text-base text-muted-foreground mb-2">{title}</Text>
            <If condition={isLoading}>
                <FlatListSkeleton />
            </If>
            <If condition={!isLoading}>
                {tableData.column ? (
                    <View className="w-full">
                        <View className="space-y-1 flex-row items-center">
                            <View className="space-y-1 gap-2">
                                {tableData?.headers?.map((item, index) => (
                                    <View key={`${item}-${index}`} className="items-start bg-primary-600 p-3">
                                        <Text className="text-white">{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View className="space-y-1 gap-2 flex-1">
                                {Object.values(tableData?.column)?.map((item, index) => (
                                    <View
                                        key={`${item}-${index}`}
                                        className="items-center w-full p-3 text-muted-foreground bg-muted"
                                    >
                                        <Text className="text-muted-foreground">{(item as ReactNode) ?? ''}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                ) : (
                    <Empty width={120} />
                )}
            </If>
        </View>
    );
};

export default React.memo(HorizontalTable);
