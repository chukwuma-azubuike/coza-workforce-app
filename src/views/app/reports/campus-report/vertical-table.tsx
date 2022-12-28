import { Box, HStack, Text, VStack } from 'native-base';
import React from 'react';
import { THEME_CONFIG } from '../../../../config/appConfig';

type Props = {
    title: string;
    children?: any;
    alignItemsCenter?: boolean;
    tableData: {
        headers: string[];
        rows: {}[];
    };
};

const Table: React.FC<Props> = ({
    title,
    tableData,
    children,
    alignItemsCenter = true,
}) => {
    return (
        <Box w="100%" marginTop={'30px'}>
            <Text fontSize={'18px'} fontWeight={'700'} marginBottom={'15px'}>
                {title}
            </Text>

            {children}

            <Box w="100%">
                <VStack space={'2px'}>
                    <HStack space={'2px'} w={'100%'}>
                        {tableData?.headers?.map((item, index) => (
                            <Box
                                key={`${item}-${index}`}
                                alignItems={
                                    alignItemsCenter ? 'center' : 'flex-start'
                                }
                                backgroundColor={THEME_CONFIG?.purple}
                                padding={'10px'}
                                w={`${100 / tableData?.headers?.length}%`}
                                _text={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                }}
                            >
                                {item}
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
                                    backgroundColor={THEME_CONFIG?.lightPurple}
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

export default Table;
