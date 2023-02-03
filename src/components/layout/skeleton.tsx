import React from 'react';
import { Center, Skeleton, VStack } from 'native-base';

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
                <Skeleton
                    h="40"
                    rounded="md"
                    _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                    _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                />
                <Skeleton.Text
                    px="4"
                    rounded="md"
                    _dark={{ bg: 'gray.800' }}
                    _light={{ bg: 'gray.100' }}
                />
                <Skeleton
                    px="4"
                    my="4"
                    rounded="md"
                    _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                    _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                />
                <Skeleton
                    h="40"
                    rounded="md"
                    _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                    _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                />
                <Skeleton.Text
                    px="4"
                    rounded="md"
                    _dark={{ bg: 'gray.800' }}
                    _light={{ bg: 'gray.100' }}
                />
                <Skeleton
                    px="4"
                    my="4"
                    rounded="md"
                    _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                    _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                />
            </VStack>
        </Center>
    );
};

export const FlatListSkeleton: React.FC<{
    count?: number;
}> = ({ count = 6 }) => {
    return (
        <Center w="full" p={0}>
            {Array.from(Array(count).keys()).map((elm, idx) => (
                <Skeleton
                    h="8"
                    my={3}
                    w="90%"
                    rounded="md"
                    overflow="hidden"
                    key={`elm-${idx}`}
                    _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                    _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                />
            ))}
        </Center>
    );
};
