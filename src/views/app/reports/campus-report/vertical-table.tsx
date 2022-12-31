import { Box, HStack, Text, VStack } from 'native-base';
import React from 'react';

type Props = {
    title: string;
    children?: any;
    alignItemsCenter?: boolean;
    tableData: {
        headers: string[];
        rows: {}[];
    };
};

const VerticalTable: React.FC<Props> = ({
    title,
    tableData,
    children,
    alignItemsCenter = true,
}) => {
    return (
        <Box>
            <Text fontSize="md" mb={4} color="gray.600">
                {title}
            </Text>
            {children}
            <Box w="100%">
                <VStack space={'2px'}>
                    <HStack space={'2px'}>
                        {tableData?.headers?.map((item, index) => (
                            <Box
                                key={`${item}-${index}`}
                                alignItems={
                                    alignItemsCenter ? 'center' : 'flex-start'
                                }
                                w={`${100 / tableData?.headers?.length}%`}
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
                                    w={`${100 / tableData?.headers?.length}%`}
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
            </Box>
        </Box>
    );
};

export default VerticalTable;
