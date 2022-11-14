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
    const handleContinuePress = () => navigation.navigate('RegisterStepTwo');

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
                                <FormControl.Label>
                                    First name
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'person-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="John"
                                    isRequired
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Last name</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'person-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Doe"
                                    isRequired
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Email</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'mail-outline',
                                        type: 'ionicon',
                                    }}
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
                                    leftIcon={{
                                        name: 'call-outline',
                                        type: 'ionicon',
                                    }}
                                    keyboardType="phone-pad"
                                    placeholder="07066846465"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct phone number format
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Address</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'home',
                                        type: 'antdesign',
                                    }}
                                    placeholder="Enter your home address"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Department
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'organization',
                                        type: 'octicon',
                                    }}
                                    isDisabled
                                    isRequired
                                    placeholder="Quality Control"
                                />
                                <ButtonComponent
                                    onPress={handleContinuePress}
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
