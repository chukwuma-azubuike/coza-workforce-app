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
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from '.';

const RegisterStepOne: React.FC<IRegistrationPageStep> = ({
    values,
    handleChange,
    onStepPress,
}) => {
    const handlePress = () => onStepPress(1);

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    First name
                                </FormControl.Label>
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
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
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
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
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
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct email format
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Phone number
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'call-outline',
                                        type: 'ionicon',
                                    }}
                                    onChangeText={handleChange('phoneNumber')}
                                    value={values.phoneNumber}
                                    keyboardType="phone-pad"
                                    placeholder="07066846465"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct phone number format
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Address</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'home',
                                        type: 'antdesign',
                                    }}
                                    onChangeText={handleChange('address')}
                                    value={values.address}
                                    placeholder="Enter your home address"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>
                                    Department
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'organization',
                                        type: 'octicon',
                                    }}
                                    onChangeText={handleChange('department')}
                                    isDisabled
                                    isRequired
                                    value={values.department.name}
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
