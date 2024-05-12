import React from 'react';
import { FormControl } from 'native-base';
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
import { useGetLatestServiceQuery } from '@store/services/services';
import { useGetCampusesQuery } from '@store/services/campus';
import useScreenFocus from '@hooks/focus';
import DynamicSearch from '@components/composite/search';
import UserListItem from '@components/composite/user-list-item';
import VStackComponent from '@components/layout/v-stack';
import RadioButton from '@components/composite/radio-button';

const IssueTicket: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { setOptions, navigate } = props.navigation;

    const {
        user: { campus, userId },
    } = useRole();

    const [campusId, setCampusId] = React.useState<ICampus['_id']>(campus?._id);
    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id']>(); //Just for 3P testing
    const [ticketType, setTicketType] = React.useState<string>('INDIVIDUAL');

    const isDepartment = ticketType === 'DEPARTMENTAL';
    const isIndividual = ticketType === 'INDIVIDUAL';
    const isCampus = ticketType === 'CAMPUS';

    const { setModalState } = useModal();

    const { data: campuses, isLoading: campusesIsLoading, isFetching: campusesIsFetching } = useGetCampusesQuery();

    const {
        data: campusDepartments,
        isLoading: campusDepartmentsLoading,
        isFetching: campusDepartmentsIsFetching,
    } = useGetDepartmentsByCampusIdQuery(campusId, { skip: !campuses?.length, refetchOnMountOrArgChange: true });

    const {
        data: workers,
        isLoading: workersLoading,
        isFetching: workersIsFetching,
    } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
        refetchOnMountOrArgChange: true,
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

    const {
        data: campusUsers,
        isLoading: isLoadingUsers,
        isFetching: isFetchingUsers,
    } = useGetUsersQuery({ campusId }, { refetchOnMountOrArgChange: true, skip: !campusId });

    const onSubmit: FormikConfig<ICreateTicketPayload>['onSubmit'] = async (values, { resetForm }) => {
        if (latestService) {
            delete values.ticketType;

            const result = await issueTicket({
                ...values,
                issuedBy: userId,
                serviceId: latestService?._id,
                userId: values?.isIndividual ? values?.userId : undefined,
                departmentId: values?.isCampus ? (undefined as any) : values?.departmentId,
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
                        ticketType,
                        ticketSummary: TICKET_TEMPLATE.verbose,
                        issuedBy: '',
                    } as ICreateTicketPayload,
                });
                navigate('Tickets', data);
            }
            if ('error' in result) {
                setModalState({
                    message: (error as any)?.data?.message || 'Oops, something went wrong!',
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

    const [searchedUser, setSearchedUser] = React.useState<IUser | undefined>();

    enum TICKET_TEMPLATE {
        minimal = `We celebrate you, 
        
QC/M&E is issuing you this ticket BECAUSE ... 
        
#GreaterHonour`,
        verbose = `We celebrate you,

We appreciate what you do in the house and we know you are committed to serving God.
    
We are issuing you this ticket for ...
    
While we know you may have genuine reasons for this action, it is not in line with the church standards.
    
Let us be reminded of the COZA culture and stay true to it.
    
We love & celebrate you!` as any,
    }

    const [initialValues] = React.useState<ICreateTicketPayload>({
        departmentId,
        campusId,
        userId: '',
        categoryId: '',
        isDepartment,
        isIndividual,
        isCampus,
        isRetracted: false,
        serviceId: '',
        ticketType,
        ticketSummary: TICKET_TEMPLATE.verbose,
        issuedBy: '',
    } as ICreateTicketPayload);

    useScreenFocus({
        onFocus: () => {
            setOptions({ title: `${Utils.capitalizeFirstChar(ticketType)} Ticket` });
            refetchLatestService();
        },
    });

    const handleUserPress = (user: IUser) => {
        setSearchedUser(user);
        setDepartmentId(user?.departmentId);
    };

    const handleToggleTicketType = (value: string) => {
        if (!!value) {
            setTicketType(value);
            setOptions({ title: `${Utils.capitalizeFirstChar(value)} Ticket` });
        }
    };

    return (
        <>
            <If condition={isIndividual}>
                <DynamicSearch
                    data={campusUsers}
                    disable={!campusUsers}
                    onPress={handleUserPress}
                    loading={isLoadingUsers || isFetchingUsers}
                    searchFields={['firstName', 'lastName', 'departmentName', 'email']}
                />
            </If>
            <ViewWrapper avoidKeyboard scroll noPadding style={{ paddingTop: 20 }}>
                <VStackComponent style={{ marginBottom: 20, paddingHorizontal: 12, gap: 20 }}>
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
                        {({ errors, values, handleChange, setFieldValue, handleSubmit, touched, validateField }) => {
                            const handleDepartment = (value: IDepartment['_id']) => {
                                setDepartmentId(value);
                                if (value) {
                                    setFieldValue('userId', undefined);
                                }
                                setFieldValue('departmentId', value);
                            };

                            const handleCampus = (value: ICampus['_id']) => {
                                setCampusId(value);
                                setDepartmentId(undefined);
                                setFieldValue('departmentId', undefined);
                                setFieldValue('campusId', value);
                            };

                            const handleUserChange = (value: string) => {
                                setFieldValue('userId', value);
                                const foundWorker = workers?.find(worker => worker._id === value);
                                !!foundWorker && setSearchedUser(foundWorker);
                            };

                            const handleTicketType = (value: string) => {
                                handleToggleTicketType(value);
                                setFieldValue('ticketType', value).then(() => {
                                    validateField('ticketType');
                                });

                                if (value === 'INDIVIDUAL') {
                                    setFieldValue('isIndividual', true);
                                    setFieldValue('isDepartment', false);
                                    setFieldValue('isCampus', false);
                                    return;
                                }

                                if (value === 'DEPARTMENTAL') {
                                    setFieldValue('isIndividual', false);
                                    setFieldValue('isDepartment', true);
                                    setFieldValue('isCampus', false);
                                    return;
                                }

                                if (value === 'CAMPUS') {
                                    setFieldValue('isIndividual', false);
                                    setFieldValue('isDepartment', false);
                                    setFieldValue('isCampus', true);
                                    return;
                                }
                            };

                            return (
                                <VStackComponent style={{ gap: 10 }}>
                                    <FormControl
                                        isRequired
                                        justifyContent="space-between"
                                        isInvalid={!!errors?.ticketType && touched?.ticketType}
                                    >
                                        <FormControl.Label>Ticket Type</FormControl.Label>
                                        <RadioButton
                                            defaultSelected="1"
                                            value={values?.ticketType}
                                            onChange={handleTicketType as any}
                                            containerStyle={{
                                                justifyContent: 'flex-start',
                                                flexDirection: 'row',
                                            }}
                                            radioButtons={[
                                                {
                                                    id: '1',
                                                    label: 'Individual',
                                                    value: 'INDIVIDUAL',
                                                },
                                                {
                                                    id: '2',
                                                    label: 'Departmental',
                                                    value: 'DEPARTMENTAL',
                                                },
                                                {
                                                    id: '3',
                                                    label: 'Campus',
                                                    value: 'CAMPUS',
                                                },
                                            ]}
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
                                            {errors?.ticketType}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.campusId && touched.campusId}>
                                        <FormControl.Label>Campus</FormControl.Label>
                                        <SelectComponent
                                            valueKey="_id"
                                            items={campuses || []}
                                            displayKey="campusName"
                                            selectedValue={campusId}
                                            placeholder="Choose campus"
                                            onValueChange={handleCampus as any}
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
                                                valueKey="_id"
                                                displayKey="departmentName"
                                                selectedValue={departmentId}
                                                placeholder="Choose department"
                                                items={sortedCampusDepartments || []}
                                                setFieldValue={setFieldValue}
                                                formFieldKey="departmentId"
                                                onValueChange={handleDepartment as any}
                                                isLoading={campusDepartmentsLoading || campusDepartmentsIsFetching}
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
                                        <FormControl isRequired isInvalid={!!errors?.userId}>
                                            <FormControl.Label>Worker</FormControl.Label>
                                            <SelectComponent
                                                valueKey="_id"
                                                items={workers || []}
                                                placeholder="Choose Worker"
                                                formFieldKey="userId"
                                                setFieldValue={setFieldValue}
                                                selectedValue={searchedUser?._id}
                                                displayKey={['firstName', 'lastName']}
                                                onValueChange={handleUserChange as any}
                                                isLoading={workersIsFetching || workersLoading}
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
                                        {!!searchedUser && <UserListItem style={{ marginTop: 10 }} {...searchedUser} />}
                                    </If>
                                    <FormControl isRequired isInvalid={!!errors?.categoryId && touched.categoryId}>
                                        <FormControl.Label>Category</FormControl.Label>
                                        <SelectComponent
                                            placeholder="Choose Category"
                                            isDisabled={!ticketCategories}
                                            onValueChange={handleChange('categoryId') as any}
                                            selectedValue={values.categoryId}
                                            valueKey="_id"
                                            items={ticketCategories || []}
                                            displayKey="categoryName"
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
                                        <RadioButton
                                            defaultSelected="1"
                                            onChange={handleChange('ticketSummary') as any}
                                            radioButtons={[
                                                {
                                                    id: '1',
                                                    label: 'Verbose',
                                                    value: TICKET_TEMPLATE.verbose as string,
                                                },
                                                {
                                                    id: '2',
                                                    label: 'Minimal',
                                                    value: TICKET_TEMPLATE.minimal as string,
                                                },
                                                {
                                                    id: '3',
                                                    label: 'Blank',
                                                    value: '',
                                                },
                                            ]}
                                        />
                                    </FormControl>
                                    <FormControl
                                        isRequired
                                        isInvalid={!!errors?.ticketSummary && touched.ticketSummary}
                                    >
                                        <FormControl.Label>Description</FormControl.Label>
                                        <TextAreaComponent
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
                                </VStackComponent>
                            );
                        }}
                    </Formik>
                </VStackComponent>
            </ViewWrapper>
        </>
    );
};

export default React.memo(IssueTicket);
