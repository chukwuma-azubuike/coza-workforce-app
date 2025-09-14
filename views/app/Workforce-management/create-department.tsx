import { View } from 'react-native';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import { useCreateDepartmentMutation } from '@store/services/department';
import { ICreateDepartmentPayload } from '@store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateDepartmentSchema } from '@utils/schemas';
import TextAreaComponent from '@components/atoms/text-area';
import { useGetCampusesQuery } from '@store/services/campus';
import If from '@components/composite/if-container';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import PickerSelect from '~/components/ui/picker-select';
import { router } from 'expo-router';

const CreateDepartment: React.FC = () => {
    const {
        user: { campus },
        isSuperAdmin,
        isGlobalPastor,
    } = useRole();

    const { setModalState } = useModal();

    const [campusId, setCampusId] = React.useState<string>();

    const {
        data: campuses,
        refetch: refetchCampuses,
        isLoading: campusLoading,
        isFetching: campusIsFetching,
    } = useGetCampusesQuery();
    const [createDepartment, { isLoading, error }] = useCreateDepartmentMutation();

    const submitForm: FormikConfig<ICreateDepartmentPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await createDepartment(values);

            if ('data' in result) {
                setModalState({
                    message: 'Department successfully created',
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

    const INITIAL_VALUES: ICreateDepartmentPayload = {
        name: '',
        description: '',
        campusId: campusId || campus?._id,
    };

    const handleCampus = (value: string) => {
        setCampusId(value);
    };

    const refresh = () => {
        refetchCampuses();
    };

    return (
        <ViewWrapper scroll noPadding onRefresh={refresh} refreshing={campusIsFetching}>
            <View className="px-4 gap-6 items-start w-full">
                <View className="items-center w-full">
                    <Formik<ICreateDepartmentPayload>
                        validateOnChange
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateDepartmentSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <View className="w-full gap-1">
                                <If condition={isGlobalPastor || isSuperAdmin}>
                                    <View>
                                        <Label>Campus</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="campusName"
                                            value={values.campusId}
                                            items={campuses || []}
                                            isLoading={campusLoading || campusIsFetching}
                                            placeholder="Select Campus"
                                            onValueChange={handleChange('campusId')}
                                        />
                                        {!!errors?.campusId && <FormErrorMessage>{errors?.campusId}</FormErrorMessage>}
                                    </View>
                                </If>
                                <View>
                                    <Label>Department Name</Label>
                                    <Input value={values.name} onChangeText={handleChange('name')} />
                                    {!!errors?.name && <FormErrorMessage>{errors?.name}</FormErrorMessage>}
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
                                    <ButtonComponent
                                        className="mt-2"
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Submit
                                    </ButtonComponent>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default CreateDepartment;
