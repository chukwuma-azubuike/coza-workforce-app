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
import { IRegistrationPageStep } from './types';
import {
    SelectComponent,
    SelectItemComponent,
} from '../../../components/atoms/select';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';

const RegisterStepTwo: React.FC<IRegistrationPageStep> = ({
    errors,
    values,
    setFieldError,
    onStepPress,
    handleChange,
    handlePressFoward,
}) => {
    const handleBackPress = () => onStepPress(0);
    const handleContinuePress = () => {
        const fields = [
            'occupation',
            'placeOfWork',
            'nextOfKin',
            'nextOfKinPhoneNo',
            'gender',
            'maritalStatus',
        ];
        handlePressFoward(fields, values, onStepPress, 2, setFieldError);
    };

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl
                                isRequired
                                isInvalid={errors?.occupation && true}
                            >
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
                                    onChangeText={handleChange('occupation')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl
                                isRequired
                                isInvalid={errors?.placeOfWork && true}
                            >
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
                                    onChangeText={handleChange('placeOfWork')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl
                                isRequired
                                isInvalid={errors?.nextOfKin && true}
                            >
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
                                    onChangeText={handleChange('nextOfKin')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl
                                isRequired
                                isInvalid={errors?.nextOfKinPhoneNo && true}
                            >
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
                                        'nextOfKinPhoneNo'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    fontSize="2xl"
                                    mt={3}
                                    leftIcon={
                                        <Icon
                                            size={16}
                                            name="warning"
                                            type="antdesign"
                                            color={THEME_CONFIG.error}
                                        />
                                    }
                                >
                                    {errors?.nextOfKinPhoneNo}
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl
                                isRequired
                                isInvalid={errors?.gender && true}
                            >
                                <FormControl.Label>Gender</FormControl.Label>
                                <SelectComponent
                                    placeholder="Enter your gender"
                                    onValueChange={handleChange('gender')}
                                >
                                    <SelectItemComponent
                                        label="Male"
                                        value="M"
                                    />
                                    <SelectItemComponent
                                        label="Female"
                                        value="F"
                                    />
                                </SelectComponent>
                                <FormControl.ErrorMessage
                                    fontSize="2xl"
                                    mt={3}
                                    leftIcon={
                                        <Icon
                                            size={16}
                                            name="warning"
                                            type="antdesign"
                                            color={THEME_CONFIG.error}
                                        />
                                    }
                                >
                                    {errors?.gender}
                                </FormControl.ErrorMessage>
                            </FormControl>

                            <FormControl
                                isRequired
                                isInvalid={errors?.maritalStatus && true}
                            >
                                <FormControl.Label>
                                    Marital Status
                                </FormControl.Label>
                                <SelectComponent
                                    placeholder="Enter your marital status"
                                    onValueChange={handleChange(
                                        'maritalStatus'
                                    )}
                                >
                                    <SelectItemComponent
                                        label="Single"
                                        value="single"
                                    />
                                    <SelectItemComponent
                                        label="Married"
                                        value="married"
                                    />
                                </SelectComponent>
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
