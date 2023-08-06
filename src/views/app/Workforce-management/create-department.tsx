import React from 'react';
import { Box, FormControl, HStack, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import useModal from '../../../hooks/modal/useModal';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { useCreateDepartmentMutation } from '../../../store/services/department';
import { ICreateDepartmentPayload } from '../../../store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateDepartmentSchema } from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputComponent } from '../../../components/atoms/input';
import TextAreaComponent from '../../../components/atoms/text-area';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import { useGetCampusesQuery } from '../../../store/services/campus';
import If from '../../../components/composite/if-container';

const CreateDepartment: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigation } = props;
    const { goBack } = navigation;

    const {
        user: { campus },
        isSuperAdmin,
        isGlobalPastor,
    } = useRole();

    const { setModalState } = useModal();

    const [campusId, setCampusId] = React.useState<string>();

    const { data: campuses, isLoading: campusLoading, isFetching: campusIsFetching } = useGetCampusesQuery();
    const [createDepartment, { isLoading, error }] = useCreateDepartmentMutation();

    const submitForm: FormikConfig<ICreateDepartmentPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await createDepartment(values);

            if ('data' in result) {
                setModalState({
                    message: 'Department successfully created',
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

    const INITIAL_VALUES: ICreateDepartmentPayload = {
        name: '',
        description: '',
        campusId: campusId || campus?._id,
    };

    const handleCampus = (value: string) => {
        setCampusId(value);
    };

    return (
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateDepartmentPayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateDepartmentSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <VStack w="100%" space={1}>
                                <If condition={isGlobalPastor || isSuperAdmin}>
                                    <FormControl isRequired>
                                        <FormControl.Label>Campus</FormControl.Label>
                                        <SelectComponent
                                            onValueChange={handleCampus}
                                            selectedValue={values.campusId}
                                            dropdownIcon={
                                                <HStack mr={2} space={2}>
                                                    <Icon
                                                        type="entypo"
                                                        name="chevron-small-down"
                                                        color={THEME_CONFIG.lightGray}
                                                    />
                                                </HStack>
                                            }
                                        >
                                            {campuses?.map((campus, index) => (
                                                <SelectItemComponent
                                                    value={campus._id}
                                                    key={`campus-${index}`}
                                                    label={campus.campusName}
                                                    isLoading={campusLoading || campusIsFetching}
                                                />
                                            ))}
                                        </SelectComponent>
                                        <FormControl.ErrorMessage
                                            mt={3}
                                            fontSize="2xl"
                                            leftIcon={
                                                <Icon
                                                    size={16}
                                                    name="warning"
                                                    type="antdesign"
                                                    color={THEME_CONFIG.error}
                                                />
                                            }
                                        >
                                            {errors?.campusId}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>
                                <FormControl isRequired isInvalid={!!errors?.name}>
                                    <FormControl.Label>Department Name</FormControl.Label>
                                    <InputComponent value={values.name} onChangeText={handleChange('name')} />
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
                                        {errors?.name}
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
                        )}
                    </Formik>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default CreateDepartment;
