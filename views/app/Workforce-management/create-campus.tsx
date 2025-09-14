import { View } from 'react-native';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { useCreateCampusMutation } from '@store/services/campus';
import { ICreateCampusPayload } from '@store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateCampusSchema } from '@utils/schemas';
import DateTimePicker from '~/components/composite/date-time-picker';
import { useAddress } from '@hooks/address';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import { Textarea } from '~/components/ui/textarea';
import PickerSelect from '~/components/ui/picker-select';

const CreateCampus: React.FC = () => {
    const { setModalState } = useModal();

    const [createCampus, { isLoading, error }] = useCreateCampusMutation();

    const submitForm: FormikConfig<ICreateCampusPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await createCampus({
                ...values,
                coordinates: { lat: +values.coordinates.lat, long: +values.coordinates.long },
            });

            if ('data' in result) {
                setModalState({
                    message: 'Campus successfully created',
                    defaultRender: true,
                    status: 'success',
                    duration: 1,
                });
                resetForm({ values: INITIAL_VALUES });
                router.back();
            }

            if ('error' in result) {
                setModalState({
                    message: `${(error as any)?.data?.message}`,
                    defaultRender: true,
                    status: 'error',
                    duration: 1,
                });
            }
            // eslint-disable-next-line no-catch-shadow, no-shadow
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 1,
            });
        }
    };

    const INITIAL_VALUES: ICreateCampusPayload = {
        campusName: '',
        description: '',
        address: '',
        LGA: '',
        state: '',
        country: 'Nigeria',
        dateOfBirth: '',
        coordinates: {
            long: 0,
            lat: 0,
        },
    };

    const { lgas, states, setStateId, countries } = useAddress();

    return (
        <ViewWrapper scroll noPadding avoidKeyboard>
            <View className="px-4 gap-6 items-start w-full pt-4">
                <View className="items-center w-full">
                    <Formik<ICreateCampusPayload>
                        validateOnChange
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCampusSchema}
                    >
                        {({ errors, touched, values, handleChange, setFieldValue, handleSubmit }) => {
                            const handleStateSelect = (value: any) => {
                                const stateId = states.findIndex(state => state.name === value) + 1;
                                setFieldValue('state', value);
                                setStateId(stateId);
                            };

                            return (
                                <View className="gap-1 w-full">
                                    <View>
                                        <Label>Campus Name</Label>
                                        <Input value={values.campusName} onChangeText={handleChange('campusName')} />
                                        {!!errors?.campusName && (
                                            <FormErrorMessage>{errors?.campusName}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={values.description}
                                            onChangeText={handleChange('description')}
                                        />
                                        {!!errors?.description && (
                                            <FormErrorMessage>{errors?.description}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Country</Label>
                                        <PickerSelect
                                            disabled
                                            valueKey="name"
                                            labelKey="name"
                                            items={countries}
                                            value={values.country}
                                            placeholder="Choose Country"
                                            onValueChange={handleChange('country') as any}
                                        />
                                        {!!errors?.country && <FormErrorMessage>{errors?.country}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>State</Label>
                                        <PickerSelect
                                            valueKey="name"
                                            labelKey="name"
                                            items={states}
                                            value={values.state}
                                            placeholder="Choose State"
                                            onValueChange={handleStateSelect as any}
                                        />
                                        {!!errors?.state && <FormErrorMessage>{errors?.state}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>LGA</Label>
                                        <PickerSelect
                                            items={lgas}
                                            valueKey="name"
                                            labelKey="name"
                                            value={values.LGA}
                                            placeholder="Choose LGA"
                                            onValueChange={handleChange('LGA') as any}
                                        />
                                        {!!errors?.LGA && <FormErrorMessage>{errors?.LGA}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>Address</Label>
                                        <Textarea value={values.address} onChangeText={handleChange('address')} />
                                        {!!errors?.address && <FormErrorMessage>{errors?.address}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <DateTimePicker
                                            mode="date"
                                            className="flex-1"
                                            label="Date of Birth"
                                            minimumDate={new Date()}
                                            error={errors.dateOfBirth}
                                            touched={touched.dateOfBirth}
                                            placeholder="Enter date of birth"
                                            onConfirm={handleChange('dateOfBirth') as unknown as (value: Date) => void}
                                        />
                                    </View>
                                    <View className="justify-between flex-row gap-4">
                                        <View className="flex-1">
                                            <Label>Latitude</Label>
                                            <Input
                                                value={values?.coordinates?.lat as unknown as string}
                                                onChangeText={handleChange('coordinates.lat')}
                                            />
                                            {!!errors?.coordinates?.lat && (
                                                <FormErrorMessage>{errors?.coordinates?.lat}</FormErrorMessage>
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <Label>Longitude</Label>
                                            <Input
                                                value={values?.coordinates?.long as unknown as string}
                                                onChangeText={handleChange('coordinates.long')}
                                            />
                                            {!!errors?.coordinates?.long && (
                                                <FormErrorMessage>{errors?.coordinates?.long}</FormErrorMessage>
                                            )}
                                        </View>
                                    </View>
                                    <View>
                                        <Button
                                            className="mt-2"
                                            isLoading={isLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit
                                        </Button>
                                    </View>
                                </View>
                            );
                        }}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default CreateCampus;
