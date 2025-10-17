import { Text } from '~/components/ui/text';
import React from 'react';
import { Input } from '~/components/ui/input';
import { IRegisterFormStepThree, IRegistrationPageStep } from './types';
import { RegisterFormContext } from './context';
import { Formik, FormikConfig } from 'formik';
import { IRegisterPayload } from '@store/types';
import { RegisterSchema_3 } from '@utils/schemas';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import DateTimePicker from '~/components/ui/date-time-picker';
import dayjs from 'dayjs';
import FilePickerUploader from '~/components/composite/file-picker-uploader';
import { S3_BUCKET_FOLDERS } from '~/constants';

const RegisterStepThree: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    if (!RegisterFormContext) return;

    const { formValues, setFormValues } = React.useContext(RegisterFormContext);

    const onSubmit: FormikConfig<IRegisterFormStepThree>['onSubmit'] = values => {
        setFormValues(prev => {
            return { ...prev, ...values };
        });

        onStepPress(3);
    };

    const onGoback = (values: IRegisterFormStepThree) => () => {
        setFormValues(prev => {
            return { ...prev, ...values };
        });

        onStepPress(1);
    };

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-4 gap-8 pt-8">
                    <Text className="text-3xl font-bold">Social</Text>
                    <View className="items-center w-full flex-1">
                        <Formik<IRegisterFormStepThree>
                            onSubmit={onSubmit}
                            validateOnMount={false}
                            validationSchema={RegisterSchema_3}
                            initialValues={formValues as IRegisterPayload}
                        >
                            {({
                                errors,
                                values,
                                touched,
                                isValid,
                                handleBlur,
                                validateForm,
                                handleChange,
                                setFieldError,
                                setFieldTouched,
                                ...props
                            }) => {
                                return (
                                    <View className="w-full gap-4 flex-1 justify-between">
                                        <ScrollView className="w-full gap-3 flex-1">
                                            <View className="w-full gap-3">
                                                <View className="gap-1">
                                                    <DateTimePicker
                                                        mode="date"
                                                        className="flex-1"
                                                        error={errors.birthDay}
                                                        touched={touched.birthDay}
                                                        label="Date of birth"
                                                        initialValue={values.birthDay}
                                                        placeholder="Enter your date of birth"
                                                        maximumDate={dayjs().subtract(18, 'years').toDate()}
                                                        minimumDate={dayjs().subtract(120, 'years').toDate()}
                                                        onConfirm={
                                                            handleChange('birthDay') as unknown as (value: Date) => void
                                                        }
                                                    />
                                                    {!!errors.birthDay && !!touched.birthDay && (
                                                        <FormErrorMessage>{errors.birthDay}</FormErrorMessage>
                                                    )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Facebook</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'facebook',
                                                            type: 'entypo',
                                                        }}
                                                        value={values?.socialMedia?.facebook}
                                                        placeholder="Enter your facebook handle"
                                                        onBlur={handleBlur('socialMedia.facebook')}
                                                        onChangeText={handleChange('socialMedia.facebook')}
                                                    />
                                                    {!!errors?.socialMedia?.facebook &&
                                                        !!touched?.socialMedia?.facebook && (
                                                            <FormErrorMessage>
                                                                {errors?.socialMedia?.facebook}
                                                            </FormErrorMessage>
                                                        )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Instagram</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'instagram',
                                                            type: 'entypo',
                                                        }}
                                                        value={values?.socialMedia?.instagram}
                                                        placeholder="Enter your instagram handle"
                                                        onBlur={handleBlur('socialMedia.instagram')}
                                                        onChangeText={handleChange('socialMedia.instagram')}
                                                    />
                                                    {!!errors?.socialMedia?.instagram &&
                                                        !!touched?.socialMedia?.instagram && (
                                                            <FormErrorMessage>
                                                                {errors?.socialMedia?.instagram}
                                                            </FormErrorMessage>
                                                        )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Twitter</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'twitter',
                                                            type: 'entypo',
                                                        }}
                                                        value={values?.socialMedia?.twitter}
                                                        placeholder="Enter your twitter handle"
                                                        onBlur={handleBlur('socialMedia.twitter')}
                                                        onChangeText={handleChange('socialMedia.twitter')}
                                                    />
                                                    {!!errors?.socialMedia?.twitter &&
                                                        !!touched?.socialMedia?.twitter && (
                                                            <FormErrorMessage>
                                                                {errors?.socialMedia?.twitter}
                                                            </FormErrorMessage>
                                                        )}
                                                </View>

                                                <View className="gap-1">
                                                    <FilePickerUploader
                                                        type="gallery"
                                                        user={formValues as any}
                                                        allowedTypes={['image/*']}
                                                        label="Upload profile picture"
                                                        onUploadSuccess={handleChange('pictureUrl')}
                                                        s3Folder={S3_BUCKET_FOLDERS.profile_pictures}
                                                    />
                                                    {errors.pictureUrl && touched.pictureUrl && (
                                                        <Text className="text-destructive">{errors.pictureUrl}</Text>
                                                    )}
                                                </View>
                                            </View>
                                        </ScrollView>
                                        <View className="w-full flex-row gap-4 mb-4">
                                            <Button variant="outline" className="flex-1" onPress={onGoback(values)}>
                                                Back
                                            </Button>
                                            <Button
                                                disabled={!isValid}
                                                onPress={() => {
                                                    onSubmit(values, props as any);
                                                }}
                                                className="flex-1"
                                            >
                                                Continue
                                            </Button>
                                        </View>
                                    </View>
                                );
                            }}
                        </Formik>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(RegisterStepThree);
