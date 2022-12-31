import { Box, HStack, Text, VStack } from 'native-base';
import React from 'react';

type Props = {
    title: string;
    tableData: {
        headers: string[];
        column: {};
    };
};

const HorizontalTable: React.FC<Props> = ({ title, tableData }) => {
    return (
        <Box>
            <Text fontSize="md" mb={4} color="gray.600">
                {title}
            </Text>

            <Box w="100%">
                <HStack space={'2px'}>
                    <VStack space={'2px'} w="40%">
                        {tableData?.headers?.map((item, index) => (
                            <Box
                                key={`${item}-${index}`}
                                alignItems="flex-start"
                                bg="primary.600"
                                p={3}
                            >
                                <Text color="white">{item}</Text>
                            </Box>
                        ))}
                    </VStack>

                    <VStack space={'2px'} w={'59%'}>
                        {Object.values(tableData?.column)?.map(
                            (item, index) => (
                                <Box
                                    key={`${item}-${index}`}
                                    alignItems="center"
                                    bg="gray.100"
                                    w={'100%'}
                                    p={3}
                                >
                                    {item}
                                </Box>
                            )
                        )}
                    </VStack>
                </HStack>
            </Box>
        </Box>
    );
};

export default HorizontalTable;
