import React from 'react';
import { Box, FormControl, Heading, HStack, Stack, Center, VStack, WarningOutlineIcon } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { DateTimePickerComponent } from '../../../components/composite/date-picker';

const RegisterStepThree: React.FC<IRegistrationPageStep> = ({
    values,
    errors,
    onStepPress,
    handleChange,
    setFieldValue,
    setFieldError,
    handlePressFoward,
}) => {
    const handleBackPress = () => onStepPress(1);
    const handleContinuePress = () => {
        const fields = ['birthDay'];
        handlePressFoward(fields, values, onStepPress, 3, setFieldError);
    };

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" pt={32} px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl isRequired isInvalid={errors?.birthDay ? true : false}>
                                <DateTimePickerComponent
                                    fieldName="birthDay"
                                    label="Next birthday"
                                    maximumDate={new Date()}
                                    dateFormat="dayofweek day month"
                                    mode="dayMonth"
                                    onSelectDate={setFieldValue}
                                />
                                <FormControl.ErrorMessage>{errors?.birthDay}</FormControl.ErrorMessage>
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
                                    onChangeText={handleChange('socialMedia.facebook')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
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
                                    onChangeText={handleChange('socialMedia.instagram')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
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
                                    onChangeText={handleChange('socialMedia.twitter')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <HStack space={4} justifyContent="space-between">
                                <ButtonComponent onPress={handleBackPress} width={160} secondary mt={4}>
                                    Go back
                                </ButtonComponent>
                                <ButtonComponent onPress={handleContinuePress} width={160} mt={4}>
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
