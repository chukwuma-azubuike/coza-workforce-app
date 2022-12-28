import { Box, HStack, Text, VStack } from 'native-base';
import React from 'react';
import { THEME_CONFIG } from '../../../../config/appConfig';

type Props = {
    title: string;
    tableData: {
        headers: string[];
        column: {};
    };
};

const HorizontalTable: React.FC<Props> = ({ title, tableData }) => {
    return (
        <Box w="100%" marginTop={'30px'}>
            <Text fontSize={'18px'} fontWeight={'700'} marginBottom={'15px'}>
                {title}
            </Text>

            <Box w="100%">
                <HStack space={'2px'}>
                    <VStack space={'2px'} w={'75%'}>
                        {tableData?.headers?.map((item, index) => (
                            <Box
                                key={`${item}-${index}`}
                                alignItems="flex-start"
                                backgroundColor={THEME_CONFIG?.purple}
                                padding={'10px'}
                                paddingLeft={'25px'}
                                w={'100%'}
                                _text={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                }}
                            >
                                {item}
                            </Box>
                        ))}
                    </VStack>

                    <VStack space={'2px'} w={'25%'}>
                        {Object.values(tableData?.column)?.map(
                            (item, index) => (
                                <Box
                                    key={`${item}-${index}`}
                                    alignItems="center"
                                    backgroundColor={THEME_CONFIG?.lightPurple}
                                    padding={'10px'}
                                    w={'100%'}
                                    _text={{
                                        fontSize: '15px',
                                        fontWeight: '500',
                                    }}
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
