import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    Radio,
    Slider,
    Stack,
    VStack,
} from 'native-base';
import { InputComponent } from '../../../components/atoms/input';

const Login = () => {
    return (
        <Center flex={1}>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Heading textAlign="left">Hey, welcome back.</Heading>
                <Box alignItems="center" w="100%">
                    <FormControl>
                        <Stack w="100%" space="xl">
                            <InputComponent
                                type="email"
                                placeholder="jondoe@gmail.com"
                            />
                            <InputComponent
                                type="password"
                                placeholder="password"
                            />
                            <Radio.Group
                                name="myRadioGroup"
                                accessibilityLabel="favorite number"
                            >
                                <Radio value="new" my={1}>
                                    New
                                </Radio>
                                <Radio value="returning" my={1}>
                                    Returning
                                </Radio>
                            </Radio.Group>
                            {/* <Slider
                                defaultValue={70}
                                minValue={0}
                                maxValue={100}
                                accessibilityLabel="hello world"
                                step={10}
                            >
                                <Slider.Track shadow={2}>
                                    <Slider.FilledTrack />
                                </Slider.Track>
                                <Slider.Thumb shadow={3} />
                            </Slider> */}
                        </Stack>
                    </FormControl>
                </Box>
            </VStack>
        </Center>
    );
};

export default Login;
