import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    Stack,
    VStack,
    WarningOutlineIcon,
} from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';

const RegisterStepOne: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
                                <FormControl.Label>
                                    First name
                                </FormControl.Label>
                                <InputComponent placeholder="John" isRequired />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Email</FormControl.Label>
                                <InputComponent
                                    type="email"
                                    isRequired
                                    keyboardType="email-address"
                                    placeholder="jondoe@gmail.com"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct email format
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Phone number
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    keyboardType="phone-pad"
                                    placeholder="07066846465"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct phone number format
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Department
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    isDisabled
                                    placeholder="Quality Control"
                                />
                                <FormControl.Label>Address</FormControl.Label>
                                <InputComponent
                                    placeholder="Enter your home address"
                                    isRequired
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Occupation
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    placeholder="Enter your occupation"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <ButtonComponent
                                    onPress={() =>
                                        navigation.navigate('RegisterStepTwo')
                                    }
                                    mt={4}
                                >
                                    Continue
                                </ButtonComponent>
                            </Stack>
                        </FormControl>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepOne;
