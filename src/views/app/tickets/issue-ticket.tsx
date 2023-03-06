import React from 'react';
import { Box, FormControl, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import TextAreaComponent from '../../../components/atoms/text-area';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import useModal from '../../../hooks/modal/useModal';
import { ParamListBase, useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useGetUsersByDepartmentIdQuery } from '../../../store/services/account';
import { ICreateTicketPayload, IDepartment } from '../../../store/types';
import { useCreateTicketMutation, useGetTicketCategoriesQuery } from '../../../store/services/tickets';
import { Formik, FormikConfig } from 'formik';
import { CreateDepartmentalTicketSchema, CreateIndividualTicketSchema } from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Utils from '../../../utils';
import If from '../../../components/composite/if-container';
import { ITicketType } from '.';

const IssueTicket: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { type } = props.route.params as { type: ITicketType };

    const { goBack, setOptions } = useNavigation();

    const {
        user: { campus },
    } = useRole();

    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id']>(); //Just for 3P testing

    const { setModalState } = useModal();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isSuccess: campusDepartmentsSuccess,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campus._id);

    const {
        data: workers,
        isLoading: workersLoading,
        isSuccess: workerSuccess,
    } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
    });

    const { data: ticketCategories, isError: categoriesError } = useGetTicketCategoriesQuery();

    const [issueTicket, { isError, isLoading, isSuccess, error }] = useCreateTicketMutation();

    const handleSubmit: FormikConfig<ICreateTicketPayload>['onSubmit'] = (values, { resetForm }) => {
        if (isDepartmental) {
            delete values.userId;
        }
        issueTicket(values);
        resetForm(INITIAL_VALUES);
        setDepartmentId('');
    };

    const handleDepartment = (value: IDepartment['_id']) => {
        setDepartmentId(value);
    };

    const refresh = () => {
        refetchDepartments();
    };

    const isDepartmental = type === 'DEPARTMENTAL';
    const isIndividual = type === 'INDIVIDUAL';

    const INITIAL_VALUES: ICreateTicketPayload = {
        departmentId: departmentId,
        campusId: campus._id,
        userId: '',
        categoryId: '',
        isDepartment: isDepartmental,
        isIndividual: isIndividual,
        isRetracted: false,
        ticketSummary: '',
    } as ICreateTicketPayload;

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                message: 'Ticket successfully issued',
                defaultRender: true,
                status: 'success',
                duration: 3,
            });
            goBack();
        }

        if (isError) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 3,
            });
        }
    }, [isSuccess, isError]);

    const isScreenFocused = useIsFocused();

    useFocusEffect(
        React.useCallback(() => {
            setOptions({ title: `${Utils.capitalizeFirstChar(type)} Ticket` });
            setDepartmentId('');
            return () => {};
        }, [isScreenFocused])
    );

    return (
        <ViewWrapper>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateTicketPayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={handleSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={
                            isDepartmental ? CreateDepartmentalTicketSchema : CreateIndividualTicketSchema
                        }
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <VStack w="100%" space={1}>
                                <FormControl isRequired isInvalid={!!errors?.departmentId}>
                                    <FormControl.Label>Department</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={departmentId}
                                        placeholder="Choose department"
                                        onValueChange={handleDepartment}
                                    >
                                        {campusDepartments?.map((department, index) => (
                                            <SelectItemComponent
                                                value={department._id}
                                                key={`department-${index}`}
                                                label={department.departmentName}
                                                isLoading={campusDepartmentsLoading}
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
                                        {errors?.departmentId}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <If condition={isIndividual}>
                                    <FormControl isRequired isInvalid={!!errors?.userId}>
                                        <FormControl.Label>Worker</FormControl.Label>
                                        <SelectComponent
                                            isDisabled={!departmentId}
                                            placeholder="Choose Worker"
                                            onValueChange={handleChange('userId')}
                                            selectedValue={values.userId}
                                        >
                                            {workers?.map((worker, index) => (
                                                <SelectItemComponent
                                                    value={worker._id}
                                                    key={`worker-${index}`}
                                                    isLoading={workersLoading}
                                                    label={`${worker.firstName} ${worker.lastName}`}
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
                                            {errors?.userId}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>
                                <FormControl isRequired isInvalid={!!errors?.categoryId}>
                                    <FormControl.Label>Category</FormControl.Label>
                                    <SelectComponent
                                        placeholder="Choose Category"
                                        isDisabled={!ticketCategories}
                                        onValueChange={handleChange('categoryId')}
                                        selectedValue={values.categoryId}
                                    >
                                        {ticketCategories?.map((categories, index) => (
                                            <SelectItemComponent
                                                value={categories._id}
                                                key={`category-${index}`}
                                                isLoading={workersLoading}
                                                label={categories.categoryName}
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
                                        {errors?.categoryId}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors?.ticketSummary}>
                                    <FormControl.Label>Description</FormControl.Label>
                                    <TextAreaComponent
                                        onChangeText={handleChange('ticketSummary')}
                                        value={values.ticketSummary}
                                        placeholder="Details"
                                        isRequired
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
                                        {errors?.ticketSummary}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl>
                                    <ButtonComponent
                                        mt={4}
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

export default IssueTicket;
