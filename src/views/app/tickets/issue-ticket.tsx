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
import { ICampus, ICreateTicketPayload, IDepartment } from '../../../store/types';
import { useCreateTicketMutation, useGetTicketCategoriesQuery } from '../../../store/services/tickets';
import { Formik, FormikConfig } from 'formik';
import {
    CreateCampusTicketSchema,
    CreateDepartmentalTicketSchema,
    CreateIndividualTicketSchema,
} from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Utils from '../../../utils';
import If from '../../../components/composite/if-container';
import { ITicketType } from '.';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import { useGetCampusesQuery } from '../../../store/services/campus';

const IssueTicket: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { type } = props.route.params as { type: ITicketType };

    const { goBack, setOptions } = useNavigation();

    const {
        user: { campus, userId },
    } = useRole();

    const [campusId, setCampusId] = React.useState<ICampus['_id']>(campus?._id);
    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id']>(); //Just for 3P testing

    const { setModalState } = useModal();

    const { data: campuses, isLoading: campusesIsLoading, isFetching: campusesIsFetching } = useGetCampusesQuery();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isSuccess: campusDepartmentsSuccess,
        isLoading: campusDepartmentsLoading,
        isFetching: campusDepartmentsIsFetching,
    } = useGetDepartmentsByCampusIdQuery(campusId, { skip: !campuses?.length });

    const {
        data: workers,
        isLoading: workersLoading,
        isSuccess: workersSuccess,
        isFetching: workersIsFetching,
    } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
    });

    const { data: latestService, refetch } = useGetLatestServiceQuery(campus?._id as string, {
        refetchOnMountOrArgChange: true,
    });

    const { data: ticketCategories, isError: categoriesError } = useGetTicketCategoriesQuery();

    const [issueTicket, { isError, isLoading, isSuccess, error, reset }] = useCreateTicketMutation();

    const onSubmit: FormikConfig<ICreateTicketPayload>['onSubmit'] = (values, { resetForm }) => {
        if (latestService) {
            issueTicket({
                ...values,
                issuedBy: userId,
                serviceId: latestService._id,
                userId: isIndividual ? values.userId : undefined,
            });
        } else {
            setModalState({
                status: 'info',
                message: 'You cannot issue a ticket without an ongoing service.',
            });
        }
        resetForm(INITIAL_VALUES);
        setDepartmentId('');
    };

    const handleCampus = (value: ICampus['_id']) => {
        setCampusId(value);
    };

    const handleDepartment = (value: IDepartment['_id']) => {
        setDepartmentId(value);
    };

    const refresh = () => {
        refetchDepartments();
    };

    const isDepartmental = type === 'DEPARTMENTAL';
    const isIndividual = type === 'INDIVIDUAL';
    const isCampus = type === 'CAMPUS';

    const INITIAL_VALUES: ICreateTicketPayload = {
        departmentId: departmentId,
        campusId: campusId,
        userId: '',
        categoryId: '',
        isDepartment: isDepartmental,
        isIndividual: isIndividual,
        isCampus: isCampus,
        isRetracted: false,
        serviceId: '',
        ticketSummary: '',
        issuedBy: '',
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
            reset();
        }

        if (isError) {
            setModalState({
                message: error?.data?.message || 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 3,
            });
            reset();
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
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={24}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateTicketPayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={
                            isDepartmental
                                ? CreateDepartmentalTicketSchema
                                : isCampus
                                ? CreateCampusTicketSchema
                                : CreateIndividualTicketSchema
                        }
                    >
                        {({ errors, values, handleChange, handleSubmit, touched }) => (
                            <VStack w="100%" space={1}>
                                <FormControl isRequired isInvalid={!!errors?.campusId && touched.campusId}>
                                    <FormControl.Label>Campus</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={campusId}
                                        placeholder="Choose campus"
                                        onValueChange={handleCampus}
                                    >
                                        {campuses?.map((campus, index) => (
                                            <SelectItemComponent
                                                value={campus._id}
                                                key={`campus-${index}`}
                                                label={campus.campusName}
                                                isLoading={campusesIsLoading || campusesIsFetching}
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
                                        {errors?.campusId}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <If condition={!isCampus}>
                                    <FormControl isRequired isInvalid={!!errors?.departmentId && touched.departmentId}>
                                        <FormControl.Label>Department</FormControl.Label>
                                        <SelectComponent
                                            selectedValue={departmentId}
                                            placeholder="Choose department"
                                            onValueChange={handleDepartment}
                                        >
                                            {Utils.sortStringAscending(campusDepartments, 'departmentName')?.map(
                                                (department, index) => (
                                                    <SelectItemComponent
                                                        value={department._id}
                                                        key={`department-${index}`}
                                                        label={department.departmentName}
                                                        isLoading={
                                                            campusDepartmentsLoading || campusDepartmentsIsFetching
                                                        }
                                                    />
                                                )
                                            )}
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
                                </If>
                                <If condition={isIndividual}>
                                    <FormControl isRequired isInvalid={!!errors?.userId && touched.userId}>
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
                                                    isLoading={workersLoading || workersIsFetching}
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
                                <FormControl isRequired isInvalid={!!errors?.categoryId && touched.categoryId}>
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
                                <FormControl isRequired isInvalid={!!errors?.ticketSummary && touched.ticketSummary}>
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
