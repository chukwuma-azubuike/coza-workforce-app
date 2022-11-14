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
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';

const RegisterStepTwo: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handleBackPress = () => navigation.goBack();
    const handleContinuePress = () => navigation.navigate('RegisterStepThree');

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
                                <FormControl.Label>
                                    Occupation
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'briefcase-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter your occupation"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Place of work
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'organization',
                                        type: 'octicon',
                                    }}
                                    placeholder="Enter your place of work"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>

                                <FormControl.Label>
                                    Next of Kin
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'person-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter their name"
                                    isRequired
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
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
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct phone number format
                                </FormControl.ErrorMessage>

                                <FormControl.Label>Gender</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'male-female-outline',
                                        type: 'ionicon',
                                    }}
                                    isRequired
                                    placeholder="Enter your gender"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Marital status
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'ring',
                                        type: 'material-community',
                                    }}
                                    isRequired
                                    placeholder="Enter your marital status"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Date of Birth
                                </FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'birthday-cake',
                                        type: 'font-awesome',
                                    }}
                                    isRequired
                                    placeholder="DOB"
                                />

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
                            </Stack>
                        </FormControl>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepTwo;
