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
    const handleBackPress = () => navigation.goBack();
    const handleContinuePress = () => navigation.navigate('RegisterStepFour');

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
                                <FormControl.Label>Facebook</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'facebook',
                                        type: 'material',
                                    }}
                                    placeholder="Enter your facebook handle"
                                    isRequired
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Instagram</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'logo-instagram',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter your instagram handle"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Twitter</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'logo-twitter',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter your twitter handle"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>

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

export default RegisterStepThree;
