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

const RegisterStepThree: React.FC<NativeStackScreenProps<ParamListBase>> = ({
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
                                    Next of Kin
                                </FormControl.Label>
                                <InputComponent
                                    placeholder="Enter the name of your next of kin"
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
                                    keyboardType="phone-pad"
                                    placeholder="Enter your next of kin's phone number"
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
                                    placeholder="Enter your place of work"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Gender</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    placeholder="Enter your gender"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Date of Birth
                                </FormControl.Label>
                                <InputComponent isRequired placeholder="DOB" />
                                <HStack
                                    space={4}
                                    justifyContent="space-between"
                                >
                                    <ButtonComponent
                                        onPress={() => navigation.goBack()}
                                        width={160}
                                        secondary
                                        mt={4}
                                    >
                                        Go back
                                    </ButtonComponent>
                                    <ButtonComponent
                                        onPress={() =>
                                            navigation.navigate(
                                                'RegisterStepFour'
                                            )
                                        }
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

export default RegisterStepThree;
