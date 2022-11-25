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

const RegisterStepThree: React.FC<IRegistrationPageStep> = ({
    values,
    navigation,
    onStepPress,
    handleSubmit,
    handleChange,
}) => {
    const handleBackPress = () => onStepPress(1);
    const handleContinuePress = () => onStepPress(3);

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl isRequired>
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
                                    value={values.birthDay}
                                    onChangeText={handleChange('birthDay')}
                                />
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Facebook</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'facebook',
                                        type: 'material',
                                    }}
                                    isRequired
                                    placeholder="Enter your facebook handle"
                                    value={values.socialMedia.facebook}
                                    onChangeText={handleChange(
                                        'socialMedia.facebook'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Instagram</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'logo-instagram',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter your instagram handle"
                                    value={values.socialMedia.instagram}
                                    onChangeText={handleChange(
                                        'socialMedia.instagram'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Twitter</FormControl.Label>
                                <InputComponent
                                    isRequired
                                    leftIcon={{
                                        name: 'logo-twitter',
                                        type: 'ionicon',
                                    }}
                                    placeholder="Enter your twitter handle"
                                    value={values.socialMedia.twitter}
                                    onChangeText={handleChange(
                                        'socialMedia.twitter'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <HStack space={4} justifyContent="space-between">
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
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepThree;
