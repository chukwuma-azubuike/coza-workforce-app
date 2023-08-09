import React from 'react';
import { Box, FormControl, HStack, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import useModal from '../../../hooks/modal/useModal';
import { ParamListBase } from '@react-navigation/native';
import { useCreateCampusMutation } from '../../../store/services/campus';
import { ICreateCampusPayload } from '../../../store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateCampusSchema } from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputComponent } from '../../../components/atoms/input';
import TextAreaComponent from '../../../components/atoms/text-area';
import { DateTimePickerComponent } from '../../../components/composite/date-picker';

const CreateCampus: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigation } = props;
    const { goBack } = navigation;
    const { setModalState } = useModal();

    const [createCampus, { isLoading, error }] = useCreateCampusMutation();

    const submitForm: FormikConfig<ICreateCampusPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await createCampus(values);

            if ('data' in result) {
                setModalState({
                    message: 'Campus successfully created',
                    defaultRender: true,
                    status: 'success',
                    duration: 3,
                });
                resetForm(INITIAL_VALUES as any);
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
        country: '',
        dateOfBirth: '',
        coordinates: {
            long: 0,
            lat: 0,
        },
    };

    return (
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={20}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateCampusPayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCampusSchema}
                    >
                        {({ errors, values, handleChange, setFieldValue, handleSubmit }) => {
                            return (
                                <VStack w="100%" space={1}>
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
                                    <FormControl isRequired isInvalid={!!errors?.LGA}>
                                        <FormControl.Label>LGA</FormControl.Label>
                                        <InputComponent value={values.LGA} onChangeText={handleChange('LGA')} />
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
                                    <FormControl isRequired isInvalid={!!errors?.state}>
                                        <FormControl.Label>State</FormControl.Label>
                                        <InputComponent value={values.state} onChangeText={handleChange('state')} />
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
                                    <FormControl isRequired isInvalid={!!errors?.country}>
                                        <FormControl.Label>Country</FormControl.Label>
                                        <InputComponent value={values.country} onChangeText={handleChange('country')} />
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
                                    <FormControl isRequired isInvalid={!!errors?.dateOfBirth}>
                                        <FormControl.Label>Date of Birth</FormControl.Label>
                                        <DateTimePickerComponent
                                            fieldName="dateOfBirth"
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

                                    <HStack justifyContent="space-between">
                                        <FormControl width={160} isRequired isInvalid={!!errors?.coordinates?.long}>
                                            <FormControl.Label>Longitude</FormControl.Label>
                                            <InputComponent
                                                value={`${values?.coordinates?.long}`}
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
                                        <FormControl width={160} isRequired isInvalid={!!errors?.coordinates?.lat}>
                                            <FormControl.Label>Latitude</FormControl.Label>
                                            <InputComponent
                                                value={`${values?.coordinates?.lat}`}
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
                                    </HStack>

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
                                </VStack>
                            );
                        }}
                    </Formik>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default CreateCampus;
