import { View } from 'react-native';
import ViewWrapper from '~/components/layout/viewWrapper';
import { Formik, FormikConfig } from 'formik';
import React from 'react';
import useModal from '@hooks/modal/useModal';
import { ICongressPayload } from '@store/types';
import { CreateCongressSchema } from '@utils/schemas';
import dayjs from 'dayjs';
import { useCreateCongressMutation } from '@store/services/congress';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import DateTimePicker from '~/components/composite/date-time-picker';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';

const CreateCongress: React.FC = () => {
    const { setModalState } = useModal();

    const [createCongress, { isLoading, data, reset }] = useCreateCongressMutation();

    const onSubmit: FormikConfig<ICongressPayload>['onSubmit'] = async (values, { resetForm }) => {
        const name = values.name;
        const endDate = dayjs(values.endDate).unix();
        const startDate = dayjs(values.startDate).unix();

        const result = await createCongress({
            name,
            endDate,
            startDate,
        });

        if ('data' in result) {
            setModalState({
                message: 'Congress successfully created',
                status: 'success',
            });
            reset();
            router.push({ pathname: '/congress', params: data as any });
            resetForm({ values: INITIAL_VALUES });
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICongressPayload = {
        name: '',
        endDate: undefined,
        startDate: undefined,
    } as any;

    return (
        <ViewWrapper scroll noPadding className="flex-1 pt-4">
            <View className="px-4 gap-8 items-start w-full py-6">
                <Formik<ICongressPayload>
                    validateOnChange
                    onSubmit={onSubmit}
                    initialValues={INITIAL_VALUES}
                    validationSchema={CreateCongressSchema}
                >
                    {({ errors, values, handleChange, handleSubmit, touched, isValid, dirty }) => (
                        <View className="gap-6">
                            <View className="gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={values.name}
                                    placeholder="Service Name"
                                    onChangeText={handleChange('name')}
                                />
                                {!!errors?.name && touched.name && <FormErrorMessage>{errors?.name}</FormErrorMessage>}
                            </View>
                            <View className="justify-between flex-row gap-4 w-full">
                                <View className="flex-1">
                                    <DateTimePicker
                                        mode="date"
                                        label="Start date"
                                        error={errors.startDate}
                                        touched={touched.startDate}
                                        placeholder="Enter start date"
                                        onConfirm={handleChange('startDate') as unknown as (value: Date) => void}
                                    />
                                    {!!errors.startDate && touched.startDate && (
                                        <FormErrorMessage>{errors?.startDate}</FormErrorMessage>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <DateTimePicker
                                        mode="date"
                                        label="End date"
                                        error={errors.endDate}
                                        touched={touched.endDate}
                                        placeholder="Enter end date"
                                        minimumDate={dayjs(values?.startDate || undefined).toDate()}
                                        onConfirm={handleChange('endDate') as unknown as (value: Date) => void}
                                    />
                                    {!!errors.endDate && touched.endDate && (
                                        <FormErrorMessage>{errors?.endDate}</FormErrorMessage>
                                    )}
                                </View>
                            </View>

                            <View>
                                <Button
                                    className="mt-4"
                                    isLoading={isLoading}
                                    disabled={!dirty || !isValid}
                                    onPress={handleSubmit as (event: any) => void}
                                >
                                    Create Congress 🚀
                                </Button>
                            </View>
                        </View>
                    )}
                </Formik>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCongress);
