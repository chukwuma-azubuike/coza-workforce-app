import { View } from "react-native";
import React from 'react';
import { FormControl } from 'native-base';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import useModal from '@hooks/modal/useModal';
import { ParamListBase } from '@react-navigation/native';
import { useCreateCampusMutation } from '@store/services/campus';
import { ICreateCampusPayload } from '@store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateCampusSchema } from '@utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextAreaComponent from '@components/atoms/text-area';
import DateTimePicker  from '~/components/composite/date-time-picker';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { useAddress } from '@hooks/address';

const CreateCampus: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigation } = props;
    const { goBack } = navigation;
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
                goBack();
            }

            if ('error' in result) {
                setModalState({
                    message: `${error?.data?.message}`,
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
            <View space="lg" alignItems="flex-start" w="100%" mb={20} className="px-4">
                <View alignItems="center" w="100%">
                    <Formik<ICreateCampusPayload>
                        validateOnChange
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCampusSchema}
                    >
                        {({ errors, values, handleChange, setFieldValue, handleSubmit }) => {
                            const handleStateSelect = (value: any) => {
                                const stateId = states.findIndex(state => state.name === value) + 1;
                                setFieldValue('state', value);
                                setStateId(stateId);
                            };

                            return (
                                <View w="100%" space={1}>
                                    <FormControl isRequired isInvalid={!!errors?.campusName}>
                                        <FormControl.Label>Campus Name</FormControl.Label>
                                        <InputComponent
                                            value={values.campusName}
                                            onChangeText={handleChange('campusName')}
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
                                            {errors?.campusName}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.description}>
                                        <FormControl.Label>Description</FormControl.Label>
                                        <TextAreaComponent
                                            value={values.description}
                                            onChangeText={handleChange('description')}
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
                                            {errors?.description}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.country}>
                                        <FormControl.Label>Country</FormControl.Label>
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
                                            {errors?.country}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.state}>
                                        <FormControl.Label>State</FormControl.Label>
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
                                            {errors?.state}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.LGA}>
                                        <FormControl.Label>LGA</FormControl.Label>
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
                                            {errors?.LGA}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.address}>
                                        <FormControl.Label>Address</FormControl.Label>
                                        <TextAreaComponent
                                            value={values.address}
                                            onChangeText={handleChange('address')}
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
                                            {errors?.address}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.dateOfBirth}>
                                        <FormControl.Label>Date of Birth</FormControl.Label>
                                        <DateTimePicker                                            fieldName="dateOfBirth"
                                            minimumDate={new Date()}
                                            onSelectDate={setFieldValue}
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
                                            {errors?.dateOfBirth}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <View justifyContent="space-between">
                                        <FormControl width={160} isRequired isInvalid={!!errors?.coordinates?.lat}>
                                            <FormControl.Label>Latitude</FormControl.Label>
                                            <InputComponent
                                                value={values?.coordinates?.lat as unknown as string}
                                                onChangeText={handleChange('coordinates.lat')}
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
                                                {errors?.coordinates?.lat}
                                            </FormControl.ErrorMessage>
                                        </FormControl>

                                        <FormControl width={160} isRequired isInvalid={!!errors?.coordinates?.long}>
                                            <FormControl.Label>Longitude</FormControl.Label>
                                            <InputComponent
                                                value={values?.coordinates?.long as unknown as string}
                                                onChangeText={handleChange('coordinates.long')}
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
                                                {errors?.coordinates?.long}
                                            </FormControl.ErrorMessage>
                                        </FormControl>
                                    </View>
                                    <FormControl>
                                        <ButtonComponent
                                            mt={4}
                                            type="submit"
                                            isLoading={isLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit
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

export default CreateCampus;
