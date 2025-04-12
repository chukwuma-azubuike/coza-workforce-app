import { View } from "react-native";
import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import { FormControl } from 'native-base';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { ICGWCFeedbackPayload } from '@store/types';
import { SubmitCGWCFeedbackSchema } from '@utils/schemas';
import { useSubmitCGWCFeedbackMutation } from '@store/services/cgwc';
import TextAreaComponent from '@components/atoms/text-area';
import RatingComponent from '@components/composite/rating';
import useRole from '@hooks/role';

const CGWCFeedback: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { navigate } = navigation;
    const params = route.params as { CGWCId: string; rating: number };
    const CGWCId = params?.CGWCId;
    const { setModalState } = useModal();
    const {
        user: { userId },
    } = useRole();

    const [submitFeedback, { isLoading, error, data, reset }] = useSubmitCGWCFeedbackMutation();

    const onSubmit: FormikConfig<ICGWCFeedbackPayload>['onSubmit'] = async (values, { resetForm }) => {
        const result = await submitFeedback(values);

        if ('data' in result) {
            setModalState({
                message: 'Feedback submitted',
                status: 'success',
            });
            reset();
            resetForm({ values: INITIAL_VALUES });
            navigate('CGWC Details', { rating: values.rating, CGWCId });
        }

        if ('error' in result) {
            setModalState({
                message: result?.error?.data?.message || 'Oops something went wrong',
                status: 'info',
            });
        }
    };

    const INITIAL_VALUES: ICGWCFeedbackPayload = {
        userId,
        CGWCId,
        comment: '',
        rating: params?.rating,
    } as ICGWCFeedbackPayload;

    return (
        <ViewWrapper scroll noPadding pt={4}>
            <View space="lg" alignItems="flex-start" w="100%" mb={24} className="px-4">
                <View alignItems="center" w="100%">
                    <Formik<ICGWCFeedbackPayload>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={SubmitCGWCFeedbackSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched, setFieldValue }) => {
                            const handleRating = (value: number) => {
                                setFieldValue('rating', value);
                            };

                            return (
                                <View w="100%" space={4}>
                                    <FormControl isRequired isInvalid={!!errors?.rating && touched.rating}>
                                        <FormControl.Label>Overall rating</FormControl.Label>
                                        <RatingComponent defaultRating={params?.rating} onFinishRating={handleRating} />
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
                                            {errors?.rating}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.comment && touched.comment}>
                                        <FormControl.Label>Comment</FormControl.Label>
                                        <TextAreaComponent
                                            placeholder="Comment"
                                            value={values.comment}
                                            onChangeText={handleChange('comment')}
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
                                            {errors?.comment}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <ButtonComponent
                                            mt={4}
                                            isLoading={isLoading}
                                            isLoadingText="Submitting..."
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit Feedback
                                        </ButtonComponent>
                                    </FormControl>
                                </View>
                            );
                        }}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CGWCFeedback);
