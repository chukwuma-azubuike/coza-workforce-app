import { Text } from "~/components/ui/text";
import { View } from "react-native";
import React from 'react';
import Empty from '../../atoms/empty';
import If from '../if-container';
import { FlatListSkeleton } from '../../layout/skeleton';

type Props = {
    title: string;
    children?: any;
    isLoading?: boolean;
    alignItemsCenter?: boolean;
    tableData: {
        headers: string[];
        rows: any[];
    };
};

const VerticalTable: React.FC<Props> = ({ title, children, isLoading, tableData, alignItemsCenter = true }) => {
    return (
        <View>
            <Text textAlign="left" fontSize="md" _light={{ color: 'gray.600' }} _dark={{ color: 'gray.200' }} mb={2}>
                {title}
            </Text>
            {children}
            <View w="100%">
                <If condition={isLoading}>
                    <FlatListSkeleton />
                </If>
                <If condition={!isLoading}>
                    {tableData.rows.length ? (
                        <View space={'2px'}>
                            <View space={'2px'}>
                                {tableData?.headers?.map((item, index) => (
                                    <View
                                        alignItems={alignItemsCenter ? 'center' : 'flex-start'}
                                        w={`${100 / tableData?.headers?.length}%`}
                                        key={`${item}-${index}`}
                                        bg="primary.600"
                                        textAlign="left"
                                        p={3}
                                    >
                                        <Text textAlign="left" color="white">
                                            {item}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            {tableData?.rows?.map((row, index) => (
                                <View key={`row-data-${index}`} space={'2px'} w={'100%'}>
                                    {Object.values(row)?.map(item => (
                                        <View
                                            alignItems={alignItemsCenter ? 'center' : 'flex-start'}
                                            padding={'10px'}
                                            w={`${100 / tableData?.headers?.length}%`}
                                            _text={{
                                                fontSize: '15px',
                                                fontWeight: '500',
                                            }}
                                            textAlign="left"
                                            _light={{ color: 'gray.700', bgColor: 'gray.200' }}
                                            _dark={{ color: 'gray.300', bgColor: 'gray.900' }}
                                        >
                                            {item}
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Empty width={120} />
                    )}
                </If>
            </View>
        </View>
    );
};

export default React.memo(VerticalTable);
