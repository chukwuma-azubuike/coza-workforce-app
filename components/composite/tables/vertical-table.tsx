import { Box, HStack, Text, VStack } from 'native-base';
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
        <Box>
            <Text textAlign="left" fontSize="md" _light={{ color: 'gray.600' }} _dark={{ color: 'gray.200' }} mb={2}>
                {title}
            </Text>
            {children}
            <Box w="100%">
                <If condition={isLoading}>
                    <FlatListSkeleton />
                </If>
                <If condition={!isLoading}>
                    {tableData.rows.length ? (
                        <VStack space={'2px'}>
                            <HStack space={'2px'}>
                                {tableData?.headers?.map((item, index) => (
                                    <Box
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
                                    </Box>
                                ))}
                            </HStack>
                            {tableData?.rows?.map((row, index) => (
                                <HStack key={`row-data-${index}`} space={'2px'} w={'100%'}>
                                    {Object.values(row)?.map(item => (
                                        <Box
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
                                        </Box>
                                    ))}
                                </HStack>
                            ))}
                        </VStack>
                    ) : (
                        <Empty width={120} />
                    )}
                </If>
            </Box>
        </Box>
    );
};

export default React.memo(VerticalTable);
