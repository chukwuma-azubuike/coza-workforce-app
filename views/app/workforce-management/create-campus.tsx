import { View } from 'react-native';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { useCreateCampusMutation } from '@store/services/campus';
import { ICreateCampusPayload } from '@store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateCampusSchema } from '@utils/schemas';
import TextAreaComponent from '@components/atoms/text-area';
import DateTimePicker from '~/components/composite/date-time-picker';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { useAddress } from '@hooks/address';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';

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
                    duration: 3,
                });
                resetForm({ values: INITIAL_VALUES });
                router.back();
            }

            if ('error' in result) {
                setModalState({
                    message: `${(error as any)?.data?.message}`,
                    defaultRender: true,
                    status: 'error',
                    duration: 6,
                });
            }
            // eslint-disable-next-line no-catch-shadow, no-shadow
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 6,
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
        <ViewWrapper scroll noPadding>
            <View className="px-4 gap-6 items-start w-20">
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
                                        <TextAreaComponent
                                            value={values.description}
                                            onChangeText={handleChange('description')}
                                        />
                                        {!!errors?.description && (
                                            <FormErrorMessage>{errors?.description}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Country</Label>
                                        <SelectComponent
                                            isDisabled
                                            valueKey="name"
                                            displayKey="name"
                                            selectedValue={values.country}
                                            placeholder="Choose Country"
                                            items={countries || []}
                                            onValueChange={handleChange('country') as any}
                                        >
                                            {countries?.map((country, index) => (
                                                <SelectItemComponent
                                                    value={country.name}
                                                    label={country.name}
                                                    key={`${country}-${index}`}
                                                />
                                            ))}
                                        </SelectComponent>
                                        {!!errors?.country && <FormErrorMessage>{errors?.country}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>State</Label>
                                        <SelectComponent
                                            valueKey="name"
                                            displayKey="name"
                                            selectedValue={values.state}
                                            placeholder="Choose State"
                                            items={states || []}
                                            onValueChange={handleStateSelect as any}
                                        >
                                            {states?.map((state, index) => (
                                                <SelectItemComponent
                                                    value={state.name}
                                                    label={state.name}
                                                    key={`${state}-${index}`}
                                                />
                                            ))}
                                        </SelectComponent>
                                        {!!errors?.state && <FormErrorMessage>{errors?.state}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>LGA</Label>
                                        <SelectComponent
                                            valueKey="name"
                                            displayKey="name"
                                            items={lgas || []}
                                            placeholder="Choose LGA"
                                            selectedValue={values.LGA}
                                            onValueChange={handleChange('LGA') as any}
                                        >
                                            {lgas?.map((lga, index) => (
                                                <SelectItemComponent
                                                    value={lga.name}
                                                    label={lga.name}
                                                    key={`${lga}-${index}`}
                                                />
                                            ))}
                                        </SelectComponent>
                                        {!!errors?.LGA && <FormErrorMessage>{errors?.LGA}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>Address</Label>
                                        <TextAreaComponent
                                            value={values.address}
                                            onChangeText={handleChange('address')}
                                        />
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
                                        {!!errors?.dateOfBirth && (
                                            <FormErrorMessage>{errors?.dateOfBirth}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="justify-between flex-row">
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
