import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    Input,
    Stack,
    VStack,
} from 'native-base';

const Login = () => {
    return (
        <Center flex={1}>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Heading textAlign="left">Hey, welcome back.</Heading>
                <Box alignItems="center" w="100%">
                    <FormControl>
                        <Stack w="100%" space="xl">
                            <Input
                                w="100%"
                                size="xl"
                                type="email"
                                placeholder="jondoe@gmail.com"
                            />
                            <Input
                                w="100%"
                                size="xl"
                                type="password"
                                placeholder="password"
                            />
                        </Stack>
                    </FormControl>
                </Box>
            </VStack>
        </Center>
    );
};

export default Login;
