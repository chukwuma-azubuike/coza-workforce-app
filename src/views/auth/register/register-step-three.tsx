import React from 'react';
import { Box, FormControl, Heading, HStack, Stack, Center, VStack, WarningOutlineIcon } from 'native-base';
import { InputComponent } from '@components/atoms/input';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { DateTimePickerComponent } from '@components/composite/date-picker';
import { Formik } from 'formik';
import { IRegisterPayload } from '@store/types';
import { RegisterSchema_3 } from '@utils/schemas';
import { RegisterFormContext } from '.';
import { IMGBB_ALBUM_ID } from '@config/uploadConfig';
import useUpload from '@hooks/upload';
import UploadButton from '@components/atoms/upload';

const RegisterStepThree: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const onSubmit = () => {};
    const handleBackPress = () => onStepPress(1);

    const { formValues, setFormValues } = React.useContext(RegisterFormContext);

    const { initialise, loading, isSuccess, isError, error, data, reset } = useUpload({
        albumId: IMGBB_ALBUM_ID.PROFILE_PICTURE,
    });

    React.useEffect(() => {
        if (data?.display_url && isSuccess) {
            setFormValues(prev => {
                return { ...prev, pictureUrl: data.display_url };
            });
        }
        if (isError) {
            reset();
        }
    }, [isSuccess, isError, data]);

    return (
        <ViewWrapper scroll pt={10}>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" pt={20} px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <Formik<IRegisterPayload>
                                onSubmit={onSubmit}
                                validateOnMount={false}
                                validationSchema={RegisterSchema_3}
                                initialValues={formValues as IRegisterPayload}
                            >
                                {({
                                    errors,
                                    values,
                                    touched,
                                    validateForm,
                                    handleChange,
                                    setFieldError,
                                    setFieldValue,
                                    setFieldTouched,
                                }) => {
                                    const handleContinuePress = () => {
                                        validateForm().then(e => {
                                            if (Object.keys(e).length === 0) {
                                                setFormValues(prev => {
                                                    return { ...prev, ...values };
                                                });
                                                onStepPress(3);
                                            }
                                            const errorKey = Object.keys(e)[0];
                                            setFieldTouched(errorKey);
                                            setFieldError(errorKey, 'This is a required field');
                                        });
                                    };

                                    const onSelectDate = (field: string, value: any) => setFieldValue(field, value);

                                    return (
                                        <>
                                            <FormControl isRequired isInvalid={!!errors?.birthDay && touched.birthDay}>
                                                <DateTimePickerComponent
                                                    mode="date"
                                                    fieldName="birthDay"
                                                    label="Next birthday"
                                                    onSelectDate={onSelectDate}
                                                    dateFormat="dayofweek day month"
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
                                            <FormControl>
                                                <UploadButton
                                                    mt={2}
                                                    error={error}
                                                    isSuccess={!!isSuccess}
                                                    onPress={initialise}
                                                    isLoading={loading}
                                                    data={data as any}
                                                    isError={isError}
                                                >
                                                    Upload profile picture
                                                </UploadButton>
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <HStack space={4} w="95%" justifyContent="space-between">
                                                <ButtonComponent
                                                    isDisabled={loading}
                                                    onPress={handleBackPress}
                                                    width="1/2"
                                                    secondary
                                                    mt={4}
                                                >
                                                    Go back
                                                </ButtonComponent>
                                                <ButtonComponent
                                                    isDisabled={loading}
                                                    onPress={handleContinuePress}
                                                    width="1/2"
                                                    mt={4}
                                                >
                                                    Continue
                                                </ButtonComponent>
                                            </HStack>
                                        </>
                                    );
                                }}
                            </Formik>
                        </Stack>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default React.memo(RegisterStepThree);
