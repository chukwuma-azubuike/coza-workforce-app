import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    HStack,
    Stack,
    VStack,
    WarningOutlineIcon,
} from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from '.';

const RegisterStepTwo: React.FC<IRegistrationPageStep> = ({
    values,
    onStepPress,
    handleChange,
}) => {
    const handleBackPress = () => onStepPress(0);
    const handleContinuePress = () => onStepPress(2);

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Occupation
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    value={values.occupation}
                                    leftIcon={{
                                        name: 'briefcase-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter your occupation"
                                    onChangeText={handleChange('occupation')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Place of work
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    value={values.placeOfWork}
                                    leftIcon={{
                                        name: 'organization',
                                        type: 'octicon',
                                    }}
                                    placeholder="Enter your place of work"
                                    onChangeText={handleChange('placeOfWork')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Next of Kin
                                </FormControl.Label>
                                <InputComponent
                                    value={values.nextOfKin.name}
                                    leftIcon={{
                                        name: 'person-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter their name"
                                    isRequired
                                    onChangeText={handleChange(
                                        'nextOfKin.name'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Next of Kin Contact
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'call-outline',
                                        type: 'ionicon',
                                    }}
                                    keyboardType="phone-pad"
                                    placeholder="07066846465"
                                    onChangeText={handleChange(
                                        'nextOfKin.phoneNumber'
                                    )}
                                    value={values.nextOfKin.phoneNumber}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct phone number format
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Gender</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'male-female-outline',
                                        type: 'ionicon',
                                    }}
                                    isRequired
                                    value={values.gender}
                                    placeholder="Enter your gender"
                                    onChangeText={handleChange('gender')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>

                            <FormControl isRequired>
                                <FormControl.Label>
                                    Marital status
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'ring',
                                        type: 'material-community',
                                    }}
                                    isRequired
                                    value={values.maritalStatus}
                                    placeholder="Enter your marital status"
                                    onChangeText={handleChange('maritalStatus')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <HStack
                                    space={4}
                                    justifyContent="space-between"
                                >
                                    <ButtonComponent
                                        onPress={handleBackPress}
                                        width={160}
                                        secondary
                                        mt={4}
                                    >
                                        Go back
                                    </ButtonComponent>
                                    <ButtonComponent
                                        onPress={handleContinuePress}
                                        width={160}
                                        mt={4}
                                    >
                                        Continue
                                    </ButtonComponent>
                                </HStack>
                            </FormControl>
                        </Stack>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepTwo;
