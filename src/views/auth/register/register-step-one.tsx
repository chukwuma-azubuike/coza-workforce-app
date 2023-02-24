import React from 'react';
import { Alert, Box, Center, FormControl, Heading, Stack, VStack, WarningOutlineIcon } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';

const RegisterStepOne: React.FC<IRegistrationPageStep> = ({
    values,
    errors,
    setFieldError,
    handleChange,
    onStepPress,
    handlePressFoward,
}) => {
    const handlePress = () => {
        const fields = ['phoneNumber', 'address', 'firstName', 'lastName'];
        handlePressFoward(fields, values, onStepPress, 1, setFieldError);
    };

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl isRequired>
                                <FormControl.Label>First name</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'person-outline',
                                        type: 'ionicon',
                                    }}
                                    onChangeText={handleChange('firstName')}
                                    placeholder="John"
                                    isRequired
                                    value={values.firstName}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Last name</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'person-outline',
                                        type: 'ionicon',
                                    }}
                                    onChangeText={handleChange('lastName')}
                                    value={values.lastName}
                                    placeholder="Doe"
                                    isRequired
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Email</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'mail-outline',
                                        type: 'ionicon',
                                    }}
                                    onChangeText={handleChange('email')}
                                    type="email"
                                    isDisabled
                                    isRequired
                                    value={values.email}
                                    keyboardType="email-address"
                                    placeholder="jondoe@gmail.com"
                                />
                            </FormControl>
                            <FormControl isRequired isInvalid={errors?.phoneNumber ? true : false}>
                                <FormControl.Label>Phone number</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'call-outline',
                                        type: 'ionicon',
                                    }}
                                    type="number"
                                    onChangeText={handleChange('phoneNumber')}
                                    keyboardType="phone-pad"
                                    placeholder="Enter your phone number"
                                />
                                <FormControl.ErrorMessage
                                    fontSize="2xl"
                                    mt={3}
                                    leftIcon={
                                        <Icon size={16} name="warning" type="antdesign" color={THEME_CONFIG.error} />
                                    }
                                >
                                    {errors?.phoneNumber}
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={errors?.address ? true : false}>
                                <FormControl.Label>Address</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'home',
                                        type: 'antdesign',
                                    }}
                                    onChangeText={handleChange('address')}
                                    placeholder="Enter your home address"
                                />
                                <FormControl.ErrorMessage
                                    fontSize="2xl"
                                    mt={3}
                                    leftIcon={
                                        <Icon size={16} name="warning" type="antdesign" color={THEME_CONFIG.error} />
                                    }
                                >
                                    {errors?.address}
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Department</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'organization',
                                        type: 'octicon',
                                    }}
                                    isDisabled
                                    isRequired
                                    value={values.departmentName}
                                    placeholder="Quality Control"
                                />
                            </FormControl>
                            <ButtonComponent onPress={handlePress} mt={4}>
                                Continue
                            </ButtonComponent>
                        </Stack>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepOne;
