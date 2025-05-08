import { View } from 'react-native';
import React from 'react';
import { Formik, FormikConfig } from 'formik';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { ICongressFeedbackPayload } from '@store/types';
import { SubmitCongressFeedbackSchema } from '@utils/schemas';
import { useSubmitCongressFeedbackMutation } from '@store/services/congress';
import TextAreaComponent from '@components/atoms/text-area';
import RatingComponent from '@components/composite/rating';
import useRole from '@hooks/role';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';

const CongressFeedback: React.FC = () => {
    const params = useLocalSearchParams() as unknown as { CongressId: string; rating: number };
    const CongressId = params?.CongressId;
    const { setModalState } = useModal();
    const {
        user: { userId },
    } = useRole();

    const [submitFeedback, { isLoading, error, data, reset }] = useSubmitCongressFeedbackMutation();

    const onSubmit: FormikConfig<ICongressFeedbackPayload>['onSubmit'] = async (values, { resetForm }) => {
        const result = await submitFeedback(values);

        if ('data' in result) {
            setModalState({
                message: 'Feedback submitted',
                status: 'success',
            });
            reset();
            resetForm({ values: INITIAL_VALUES });
            router.push({ pathname: '/congress/congress-details', params: { rating: values.rating, CongressId } });
        }

        if ('error' in result) {
            setModalState({
                message: (result?.error as any)?.data?.message || 'Oops something went wrong',
                status: 'info',
            });
        }
    };

    const INITIAL_VALUES: ICongressFeedbackPayload = {
        userId,
        CongressId,
        comment: '',
        rating: params?.rating,
    } as ICongressFeedbackPayload;

    return (
        <ViewWrapper scroll noPadding className="pt-2 px-2">
            <View className="items-center w-full">
                <Formik<ICongressFeedbackPayload>
                    validateOnChange
                    onSubmit={onSubmit}
                    initialValues={INITIAL_VALUES}
                    validationSchema={SubmitCongressFeedbackSchema}
                >
                    {({ errors, values, handleChange, handleSubmit, touched, setFieldValue }) => {
                        const handleRating = (value: number) => {
                            setFieldValue('rating', value);
                        };

                        return (
                            <View className="gap-6 w-full">
                                <View>
                                    <Label>Overall rating</Label>
                                    <RatingComponent defaultRating={params?.rating} onFinishRating={handleRating} />
                                    {!!errors?.rating && touched.rating && (
                                        <FormErrorMessage>{errors?.rating}</FormErrorMessage>
                                    )}
                                </View>
                                <View className="gap-4">
                                    <Label>Comment</Label>
                                    <TextAreaComponent
                                        placeholder="Comment"
                                        value={values.comment}
                                        onChangeText={handleChange('comment')}
                                    />
                                    {!!errors?.comment && touched.comment && (
                                        <FormErrorMessage>{errors?.comment}</FormErrorMessage>
                                    )}
                                </View>

                                <Button
                                    isLoading={isLoading}
                                    loadingText="Submitting..."
                                    disabled={!values.comment}
                                    onPress={handleSubmit as (event: any) => void}
                                >
                                    Submit Feedback
                                </Button>
                            </View>
                        );
                    }}
                </Formik>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CongressFeedback);
