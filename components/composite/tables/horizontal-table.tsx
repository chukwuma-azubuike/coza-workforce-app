import { Text } from "~/components/ui/text";
import { View } from "react-native";
import React from 'react';
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
            <Text fontSize="md" _light={{ color: 'gray.600' }} _dark={{ color: 'gray.200' }} mb={2}>
                {title}
            </Text>
            <If condition={isLoading}>
                <FlatListSkeleton />
            </If>
            <If condition={!isLoading}>
                {tableData.column ? (
                    <View w="100%">
                        <View space={'2px'}>
                            <View space={'2px'} w="40%">
                                {tableData?.headers?.map((item, index) => (
                                    <View key={`${item}-${index}`} alignItems="flex-start" bg="primary.600" p={3}>
                                        <Text color="white">{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View space={'2px'} w={'59%'}>
                                {Object.values(tableData?.column)?.map((item, index) => (
                                    <View
                                        _light={{ color: 'gray.700', bgColor: 'gray.200' }}
                                        _dark={{ color: 'gray.300', bgColor: 'gray.900' }}
                                        key={`${item}-${index}`}
                                        alignItems="center"
                                        w={'100%'}
                                        p={3}
                                    >
                                        {item}
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
