import React from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';
import { Formik, FormikConfig } from 'formik';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import FormErrorMessage from '~/components/ui/error-message';
import FilePickerUploader from '~/components/composite/file-picker-uploader';
import DateTimePickerLegend from '~/components/composite/date-time-picker/date-picker';
import { S3_BUCKET_FOLDERS } from '~/constants';
import { RegisterSchema_3 } from '@utils/schemas';
import { IRegisterFormStepThree } from './types';
import { useRegisterForm } from './context';
import RegisterStepLayout from './components/register-step-layout';

const MAX_DOB = dayjs().subtract(18, 'years').toDate();
const MIN_DOB = dayjs().subtract(120, 'years').toDate();

const RegisterStepThree: React.FC = () => {
    const { formValues, goNext, goBack } = useRegisterForm();

    const onSubmit: FormikConfig<IRegisterFormStepThree>['onSubmit'] = values => goNext(values);

    // The account doesn't exist yet (no `_id`), so key the S3 object off the
    // verified email — unique per registrant — to avoid every upload colliding
    // at `.../undefined`.
    const uploaderUser = { ...(formValues as any), _id: formValues.email };

    return (
        <Formik<IRegisterFormStepThree>
            onSubmit={onSubmit}
            validateOnMount
            validationSchema={RegisterSchema_3}
            initialValues={formValues as IRegisterFormStepThree}
        >
            {({ errors, values, touched, isValid, handleBlur, handleChange, setFieldValue, handleSubmit }) => (
                <RegisterStepLayout
                    title="Social & photo"
                    subtitle="Optional — but it helps your team recognise you."
                    footer={
                        <View className="w-full flex-row gap-4">
                            <Button variant="outline" className="flex-1" onPress={() => goBack(values)}>
                                Back
                            </Button>
                            <Button className="flex-1" disabled={!isValid} onPress={handleSubmit as () => void}>
                                Continue
                            </Button>
                        </View>
                    }
                >
                    <View className="w-full gap-3">
                        <View className="gap-1">
                            <DateTimePickerLegend
                                mode="date"
                                className="flex-1"
                                label="Date of birth"
                                error={errors.birthDay as string}
                                touched={touched.birthDay as boolean}
                                initialValue={values.birthDay}
                                maximumDate={MAX_DOB}
                                minimumDate={MIN_DOB}
                                placeholder="Select your date of birth"
                                onConfirm={value => setFieldValue('birthDay', dayjs(value).toISOString())}
                            />
                        </View>

                        <View className="gap-1">
                            <Label>Facebook</Label>
                            <Input
                                leftIcon={{ name: 'facebook', type: 'entypo' }}
                                value={values?.socialMedia?.facebook}
                                placeholder="Enter your facebook handle"
                                onBlur={handleBlur('socialMedia.facebook')}
                                onChangeText={handleChange('socialMedia.facebook')}
                            />
                        </View>

                        <View className="gap-1">
                            <Label>Instagram</Label>
                            <Input
                                leftIcon={{ name: 'instagram', type: 'entypo' }}
                                value={values?.socialMedia?.instagram}
                                placeholder="Enter your instagram handle"
                                onBlur={handleBlur('socialMedia.instagram')}
                                onChangeText={handleChange('socialMedia.instagram')}
                            />
                        </View>

                        <View className="gap-1">
                            <Label>Twitter</Label>
                            <Input
                                leftIcon={{ name: 'twitter', type: 'entypo' }}
                                value={values?.socialMedia?.twitter}
                                placeholder="Enter your twitter handle"
                                onBlur={handleBlur('socialMedia.twitter')}
                                onChangeText={handleChange('socialMedia.twitter')}
                            />
                        </View>

                        <View className="gap-1">
                            <FilePickerUploader
                                type="gallery"
                                user={uploaderUser}
                                allowedTypes={['image/*']}
                                label="Upload profile picture"
                                onUploadSuccess={handleChange('pictureUrl')}
                                s3Folder={S3_BUCKET_FOLDERS.profile_pictures}
                            />
                            {!!errors.pictureUrl && !!touched.pictureUrl && (
                                <FormErrorMessage>{errors.pictureUrl}</FormErrorMessage>
                            )}
                        </View>
                    </View>
                </RegisterStepLayout>
            )}
        </Formik>
    );
};

export default React.memo(RegisterStepThree);
