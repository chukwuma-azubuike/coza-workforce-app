import React from 'react';
import { Box, Center, Skeleton, VStack } from 'native-base';

export const HomeSkeleton: React.FC = () => {
    return (
        <Center w="full" p={0}>
            <VStack
                w="90%"
                maxW="400"
                space={8}
                overflow="hidden"
                rounded="md"
                _dark={{
                    borderColor: 'coolGray.500',
                }}
                _light={{
                    borderColor: 'coolGray.200',
                }}
            >
                <Skeleton h="40" rounded="md" />
                <Skeleton.Text px="4" rounded="md" />
                <Skeleton px="4" my="4" rounded="md" />
                <Skeleton h="40" rounded="md" />
                <Skeleton.Text px="4" rounded="md" />
                <Skeleton px="4" my="4" rounded="md" />
            </VStack>
        </Center>
    );
};

export const FlatListSkeleton: React.FC<{
    count?: number;
}> = ({ count = 6 }) => {
    return (
        <Center w="full" p={0}>
            <VStack
                w="90%"
                maxW="400"
                space={6}
                overflow="hidden"
                rounded="md"
                _dark={{
                    borderColor: 'coolGray.500',
                }}
                _light={{
                    borderColor: 'coolGray.200',
                }}
                py={6}
            >
                {Array.from(Array(count).keys()).map((elm, idx) => (
                    <Box key={`elm-${idx}`}>
                        <Skeleton h="8" rounded="md" />
                        <Skeleton h="0.5" rounded="md" />
                    </Box>
                ))}
            </VStack>
        </Center>
    );
};
