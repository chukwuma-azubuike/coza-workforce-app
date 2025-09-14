import { View } from 'react-native';
import { Formik, FormikConfig } from 'formik';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { ICongressInstantMessage } from '@store/types';
import { CreateCongressInstantMessageSchema } from '@utils/schemas';
import { useCreateCongressInstantMessagesMutation } from '@store/services/congress';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';

const CreateCongressInstantMessage: React.FC = () => {
    const params = useLocalSearchParams() as unknown as { CongressId: string };
    const CongressId = params?.CongressId;
    const { setModalState } = useModal();

    const [createCongressInstantMessage, { isLoading, error, data, reset }] =
        useCreateCongressInstantMessagesMutation();

    const onSubmit: FormikConfig<ICongressInstantMessage>['onSubmit'] = async (values, { resetForm }) => {
        const result = await createCongressInstantMessage({ ...values, cgwcId: CongressId });

        if ('data' in result) {
            setModalState({
                message: 'Message successfully created',
                status: 'success',
            });
            reset();
            resetForm({ values: INITIAL_VALUES });
            router.push({ pathname: '/congress/congress-details', params: data as any });
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICongressInstantMessage = {
        CongressId,
        title: '',
        message: '',
        messageLink: '',
        status: 'PENDING',
    } as ICongressInstantMessage;

    return (
        <ViewWrapper scroll noPadding className="flex-1 pt-4">
            <View className="items-center w-full gap-6 px-4">
                <View className="items-center w-full">
                    <Formik<ICongressInstantMessage>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCongressInstantMessageSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched }) => (
                            <View className="w-full gap-4">
                                <View>
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="Title"
                                        value={values.title}
                                        onChangeText={handleChange('title')}
                                    />
                                    {!!errors?.title && touched.title && (
                                        <FormErrorMessage>{errors?.title}</FormErrorMessage>
                                    )}
                                </View>

                                <View>
                                    <Label>Message</Label>
                                    <Textarea
                                        value={values.message}
                                        placeholder="Message"
                                        onChangeText={handleChange('message')}
                                    />
                                    {!!errors?.message && touched.message && (
                                        <FormErrorMessage>{errors?.message}</FormErrorMessage>
                                    )}
                                </View>

                                <View>
                                    <Button isLoading={isLoading} onPress={handleSubmit as (event: any) => void}>
                                        Post Instant Message
                                    </Button>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCongressInstantMessage);
