import React from 'react';
import { Box, FormControl, Radio, VStack } from 'native-base';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import TextAreaComponent from '@components/atoms/text-area';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import useModal from '@hooks/modal/useModal';
import { ParamListBase } from '@react-navigation/native';
import useRole from '@hooks/role';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetUsersByDepartmentIdQuery, useGetUsersQuery } from '@store/services/account';
import { ICampus, ICreateTicketPayload, IDepartment, IUser } from '@store/types';
import { useCreateTicketMutation, useGetTicketCategoriesQuery } from '@store/services/tickets';
import { Formik, FormikConfig } from 'formik';
import { CreateCampusTicketSchema, CreateDepartmentalTicketSchema, CreateIndividualTicketSchema } from '@utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Utils from '@utils/index';
import If from '@components/composite/if-container';
import { ITicketType } from '.';
import { useGetLatestServiceQuery } from '@store/services/services';
import { useGetCampusesQuery } from '@store/services/campus';
import useScreenFocus from '@hooks/focus';
import DynamicSearch from '@components/composite/search';
import UserListItem from '@components/composite/user-list-item';
import HStackComponent from '@components/layout/h-stack';

enum TICKET_TEMPLATE {
    minimal = `We celebrate you,

QC/M&E is issuing you this ticket BECAUSE ...

#GreaterHonour`,
    verbose = `We celebrate you Sir/Ma/Dept,

We appreciate what you do in the house and we know you are committed to serving God.

We are issuing you this ticket for ...

While we know you may have genuine reasons for this action, it is not in line with the church standards.

Let us be reminded of the COZA culture and stay true to it.

We love & celebrate you!`,
}

const IssueTicket: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { type } = props.route.params as { type: ITicketType };
    const { setOptions, navigate } = props.navigation;

    const {
        user: { campus, userId },
    } = useRole();

    const [campusId, setCampusId] = React.useState<ICampus['_id']>(campus?._id);
    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id']>(); //Just for 3P testing

    const { setModalState } = useModal();

    const { data: campuses, isLoading: campusesIsLoading, isFetching: campusesIsFetching } = useGetCampusesQuery();

    const {
        data: campusDepartments,
        isLoading: campusDepartmentsLoading,
        isFetching: campusDepartmentsIsFetching,
    } = useGetDepartmentsByCampusIdQuery(campusId, { skip: !campuses?.length });

    const {
        data: workers,
        isLoading: workersLoading,
        isFetching: workersIsFetching,
    } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
    });

    const { data: latestService, refetch: refetchLatestService } = useGetLatestServiceQuery(campus?._id as string, {
        refetchOnMountOrArgChange: true,
    });
    const { data: ticketCategories } = useGetTicketCategoriesQuery();
    const [issueTicket, { data, isLoading, error, reset }] = useCreateTicketMutation();

    const sortedCampusDepartments = React.useMemo(
        () => Utils.sortStringAscending(campusDepartments, 'departmentName'),
        [campusDepartmentsLoading, campusDepartmentsIsFetching]
    );

    const isDepartment = type === 'DEPARTMENTAL';
    const isIndividual = type === 'INDIVIDUAL';
    const isCampus = type === 'CAMPUS';

    const {
        data: campusUsers,
        isLoading: isLoadingUsers,
        isFetching: isFetchingUsers,
    } = useGetUsersQuery({ campusId }, { refetchOnMountOrArgChange: true, skip: !campusId });

    const onSubmit: FormikConfig<ICreateTicketPayload>['onSubmit'] = async (values, { resetForm }) => {
        if (latestService) {
            const result = await issueTicket({
                ...values,
                isDepartment: initialValues.isDepartment,
                isIndividual: initialValues.isIndividual,
                isCampus: initialValues.isCampus,
                issuedBy: userId,
                serviceId: latestService._id,
                userId: isIndividual ? values.userId : undefined,
            });

            if ('data' in result) {
                setModalState({
                    message: 'Ticket successfully issued',
                    defaultRender: true,
                    status: 'success',
                    duration: 3,
                });
                reset();
                resetForm({
                    values: {
                        departmentId,
                        campusId,
                        userId: '',
                        categoryId: '',
                        isDepartment,
                        isIndividual,
                        isCampus,
                        isRetracted: false,
                        serviceId: '',
                        ticketSummary: '',
                        issuedBy: '',
                    } as ICreateTicketPayload,
                });
                navigate('Tickets', data);
            }

            if ('error' in result) {
                setModalState({
                    message: error?.data?.message || 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 3,
                });
                reset();
            }
        } else {
            setModalState({
                status: 'info',
                message: 'You cannot issue tickets outside an active service!',
            });
        }
    };

    const [initialValues, setInitialValues] = React.useState<ICreateTicketPayload>({
        departmentId,
        campusId,
        userId: '',
        categoryId: '',
        isDepartment,
        isIndividual,
        isCampus,
        isRetracted: false,
        serviceId: '',
        ticketSummary: TICKET_TEMPLATE.verbose,
        issuedBy: '',
    } as ICreateTicketPayload);

    useScreenFocus({
        onFocus: () => {
            setSearchedUser(undefined);
            setOptions({ title: `${Utils.capitalizeFirstChar(type)} Ticket` });
            setInitialValues({
                departmentId,
                campusId,
                userId: '',
                categoryId: '',
                isDepartment,
                isIndividual,
                isCampus,
                isRetracted: false,
                serviceId: '',
                ticketSummary: TICKET_TEMPLATE.verbose,
                issuedBy: '',
            } as ICreateTicketPayload);
            refetchLatestService();
        },
    });

    const [searchedUser, setSearchedUser] = React.useState<IUser | undefined>();

    const handleUserPress = (user: IUser) => {
        setSearchedUser(user);
        setInitialValues(prev => {
            return {
                ...prev,
                userId: user?.userId || user?._id,
                departmentId: user?.departmentId,
            } as any;
        });
    };

    return (
        <>
            <DynamicSearch
                data={campusUsers}
                disable={!campusUsers}
                onPress={handleUserPress}
                loading={isLoadingUsers || isFetchingUsers}
                searchFields={['firstName', 'lastName', 'departmentName', 'email']}
            />
            <ViewWrapper scroll noPadding pt={4}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={24}>
                    <Box alignItems="center" w="100%">
                        <Formik<ICreateTicketPayload>
                            validateOnChange
                            onSubmit={onSubmit}
                            initialValues={initialValues}
                            enableReinitialize
                            validationSchema={
                                isDepartment
                                    ? CreateDepartmentalTicketSchema
                                    : isCampus
                                    ? CreateCampusTicketSchema
                                    : CreateIndividualTicketSchema
                            }
                        >
                            {({ errors, values, handleChange, setFieldValue, handleSubmit, touched }) => {
                                const handleDepartment = (value: IDepartment['_id']) => {
                                    setDepartmentId(value);
                                    setFieldValue('departmentId', value);
                                    if (searchedUser?.department?._id !== value) {
                                        setSearchedUser(undefined);
                                    }
                                };

                                const handleCampus = (value: ICampus['_id']) => {
                                    setCampusId(value);
                                    setFieldValue('campusId', value);
                                    if (searchedUser?.campus?._id !== value) {
                                        setSearchedUser(undefined);
                                    }
                                };

                                const handleTest = () => {
                                    console.log(values);
                                };

                                return (
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
                                            <FormControl
                                                isRequired
                                                isInvalid={!!errors?.departmentId && touched.departmentId}
                                            >
                                                <FormControl.Label>Department</FormControl.Label>
                                                <SelectComponent
                                                    placeholder="Choose department"
                                                    onValueChange={handleDepartment}
                                                    selectedValue={values?.departmentId}
                                                >
                                                    {sortedCampusDepartments?.map((department, index) => (
                                                        <SelectItemComponent
                                                            value={department._id}
                                                            key={`department-${index}`}
                                                            label={department.departmentName}
                                                            isLoading={
                                                                campusDepartmentsLoading || campusDepartmentsIsFetching
                                                            }
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
                                            {!!searchedUser && (
                                                <UserListItem style={{ marginTop: 10 }} {...searchedUser} />
                                            )}
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
                                        <FormControl>
                                            <FormControl.Label>Description Template</FormControl.Label>
                                            <Radio.Group
                                                name="ticketSummary"
                                                defaultValue={TICKET_TEMPLATE.verbose}
                                                onChange={handleChange('ticketSummary')}
                                            >
                                                <HStackComponent>
                                                    <Radio size="lg" value={TICKET_TEMPLATE.verbose}>
                                                        <FormControl.Label>Verbose</FormControl.Label>
                                                    </Radio>
                                                    <Radio size="lg" value={TICKET_TEMPLATE.minimal}>
                                                        <FormControl.Label>Minimal</FormControl.Label>
                                                    </Radio>
                                                    <Radio size="lg" value="">
                                                        <FormControl.Label>Blank</FormControl.Label>
                                                    </Radio>
                                                </HStackComponent>
                                            </Radio.Group>
                                        </FormControl>
                                        <FormControl
                                            isRequired
                                            isInvalid={!!errors?.ticketSummary && touched.ticketSummary}
                                        >
                                            <FormControl.Label>Description</FormControl.Label>
                                            <TextAreaComponent
                                                isRequired
                                                returnKeyType="done"
                                                placeholder="Details"
                                                value={values.ticketSummary}
                                                onChangeText={handleChange('ticketSummary')}
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
                                );
                            }}
                        </Formik>
                    </Box>
                </VStack>
            </ViewWrapper>
        </>
    );
};

export default React.memo(IssueTicket);
