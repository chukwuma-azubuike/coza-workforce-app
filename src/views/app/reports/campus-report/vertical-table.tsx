import { Box, HStack, Text, VStack } from 'native-base';
import React from 'react';
import Empty from '../../../../components/atoms/empty';
import If from '../../../../components/composite/if-container';
import { FlatListSkeleton } from '../../../../components/layout/skeleton';

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

const VerticalTable: React.FC<Props> = ({
    title,
    children,
    isLoading,
    tableData,
    alignItemsCenter = true,
}) => {
    return (
        <Box>
            <Text fontSize="md" color="gray.600" mb={2}>
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
                                        key={`${item}-${index}`}
                                        alignItems={
                                            alignItemsCenter
                                                ? 'center'
                                                : 'flex-start'
                                        }
                                        w={`${
                                            100 / tableData?.headers?.length
                                        }%`}
                                        bg="primary.600"
                                        p={3}
                                    >
                                        <Text color="white">{item}</Text>
                                    </Box>
                                ))}
                            </HStack>
                            {tableData?.rows?.map((row, index) => (
                                <HStack
                                    key={`row-data-${index}`}
                                    space={'2px'}
                                    w={'100%'}
                                >
                                    {Object.values(row)?.map(item => (
                                        <Box
                                            alignItems={
                                                alignItemsCenter
                                                    ? 'center'
                                                    : 'flex-start'
                                            }
                                            bg="gray.100"
                                            padding={'10px'}
                                            w={`${
                                                100 / tableData?.headers?.length
                                            }%`}
                                            _text={{
                                                fontSize: '15px',
                                                fontWeight: '500',
                                            }}
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

export default VerticalTable;
