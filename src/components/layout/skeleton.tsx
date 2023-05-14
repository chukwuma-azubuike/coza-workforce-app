import React from 'react';
import { Center, HStack, Skeleton, Stack, VStack } from 'native-base';
import ViewWrapper from './viewWrapper';

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
                <Skeleton.Text px="4" rounded="md" _dark={{ bg: 'gray.800' }} _light={{ bg: 'gray.100' }} />
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
                <Skeleton.Text px="4" rounded="md" _dark={{ bg: 'gray.800' }} _light={{ bg: 'gray.100' }} />
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

export const ProfileSkeleton: React.FC<{
    count?: number;
}> = ({ count = 6 }) => {
    return (
        <Center w="full" p={0}>
            <Skeleton
                h={24}
                w={24}
                mb={3}
                rounded="full"
                _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                _light={{ bg: 'gray.100', startColor: 'gray.200' }}
            />
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

export const ProfileSkeletonMini: React.FC<{
    count?: number;
}> = ({ count = 4 }) => {
    return (
        <HStack w="full" p={0} space={4} alignItems="center">
            <Skeleton
                h={32}
                w={32}
                mb={3}
                rounded="full"
                _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                _light={{ bg: 'gray.100', startColor: 'gray.200' }}
            />
            <VStack flex={1}>
                {Array.from(Array(count).keys()).map((elm, idx) => (
                    <Skeleton
                        h="6"
                        w="50%"
                        my={1.5}
                        rounded="md"
                        overflow="hidden"
                        key={`elm-${idx}`}
                        _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                        _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                    />
                ))}
            </VStack>
        </HStack>
    );
};

export const FlexListSkeleton: React.FC<{
    count?: number;
}> = ({ count = 1 }) => {
    return (
        <ViewWrapper>
            {Array.from(Array(count).keys()).map((elm, idx) => (
                <Stack key={idx} flexDirection="row" alignItems="center" justifyItems="center" my={1}>
                    <Skeleton
                        h="2"
                        flex={1}
                        rounded="md"
                        overflow="hidden"
                        _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                        _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                    />
                    <Skeleton
                        h="2"
                        ml="12"
                        flex={1}
                        rounded="md"
                        overflow="hidden"
                        _dark={{ bg: 'gray.800', startColor: 'gray.900' }}
                        _light={{ bg: 'gray.100', startColor: 'gray.200' }}
                    />
                </Stack>
            ))}
        </ViewWrapper>
    );
};

// <Stack key={index} ml={4} flexDirection="row" alignItems="center" justifyItems="center" my={2}>
//     <Heading size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
//         {item.name}
//     </Heading>
//     <Text
//         ml="12"
//         flexWrap="wrap"
//         fontWeight="400"
//         _dark={{ color: 'gray.400' }}
//         _light={{ color: 'gray.600' }}
//     >
//         {item.value}
//     </Text>
// </Stack>
