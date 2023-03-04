import { Box, HStack, Text, VStack } from 'native-base';
import React from 'react';
import Empty from '../../../../components/atoms/empty';
import If from '../../../../components/composite/if-container';
import { FlatListSkeleton } from '../../../../components/layout/skeleton';

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
        <Box>
            <Text fontSize="md" _light={{ color: 'gray.600' }} _dark={{ color: 'gray.200' }} mb={2}>
                {title}
            </Text>
            <If condition={isLoading}>
                <FlatListSkeleton />
            </If>
            <If condition={!isLoading}>
                {tableData.column ? (
                    <Box w="100%">
                        <HStack space={'2px'}>
                            <VStack space={'2px'} w="40%">
                                {tableData?.headers?.map((item, index) => (
                                    <Box key={`${item}-${index}`} alignItems="flex-start" bg="primary.600" p={3}>
                                        <Text color="white">{item}</Text>
                                    </Box>
                                ))}
                            </VStack>

                            <VStack space={'2px'} w={'59%'}>
                                {Object.values(tableData?.column)?.map((item, index) => (
                                    <Box
                                        _light={{ color: 'gray.700', bgColor: 'gray.200' }}
                                        _dark={{ color: 'gray.300', bgColor: 'gray.900' }}
                                        key={`${item}-${index}`}
                                        alignItems="center"
                                        w={'100%'}
                                        p={3}
                                    >
                                        {item}
                                    </Box>
                                ))}
                            </VStack>
                        </HStack>
                    </Box>
                ) : (
                    <Empty width={120} />
                )}
            </If>
        </Box>
    );
};

export default HorizontalTable;
