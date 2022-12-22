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
