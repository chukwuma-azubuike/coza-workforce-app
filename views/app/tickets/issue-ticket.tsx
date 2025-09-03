import { ScrollView, View } from 'react-native';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetUsersByDepartmentIdQuery, useGetUsersQuery } from '@store/services/account';
import { ICampus, ICreateTicketPayload, IDepartment, IUser } from '@store/types';
import { useCreateTicketMutation, useGetTicketCategoriesQuery } from '@store/services/tickets';
import { Formik, FormikConfig } from 'formik';
import { CreateCampusTicketSchema, CreateDepartmentalTicketSchema, CreateIndividualTicketSchema } from '@utils/schemas';
import Utils from '@utils/index';
import If from '@components/composite/if-container';
import { useGetLatestServiceQuery } from '@store/services/services';
import { useGetCampusesQuery } from '@store/services/campus';
import useScreenFocus from '@hooks/focus';
import DynamicSearch from '@components/composite/search';
import UserListItem from '@components/composite/user-list-item';
import { Label } from '~/components/ui/label';
import RadioButtonGroup from '@components/composite/radio-button';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import PickerSelect from '~/components/ui/picker-select';
import { Textarea } from '~/components/ui/textarea';

const ticketTypes = [
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
];

const TICKET_TEMPLATE = {
    MINIMAL: {
        id: 1,
        value: `We celebrate you,
        
QC/M&E is issuing you this ticket BECAUSE ...

#Dominion`,
    },
    VERBOSE: {
        id: 2,
        value: `We celebrate you,

We appreciate what you do in the house and we know you are committed to serving God.

We are issuing you this ticket for ...

While we know you may have genuine reasons for this action, it is not in line with the church standards.

Let us be reminded of the COZA culture and stay true to it.

We love & celebrate you!` as any,
    },
    BLANK: {
        id: 1,
        value: '',
    },
};
const IssueTicket: React.FC = () => {
    const {
        user: { campus, userId },
    } = useRole();

    const { setOptions } = useNavigation();
    const user = useLocalSearchParams() as any as IUser;

    const [campusId, setCampusId] = React.useState<ICampus['_id']>(user?.campusId || campus?._id);
    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id'] | undefined>(user?.departmentId); //Just for 3P testing
    const [ticketType, setTicketType] = React.useState<string>('INDIVIDUAL');
    const [template, setTemplate] = React.useState<string>(TICKET_TEMPLATE.VERBOSE.value);

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
    const { data: ticketCategories, isLoading: categoriesLoading } = useGetTicketCategoriesQuery();
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
                serviceId: latestService?._id as string,
                userId: values?.isIndividual ? values?.userId : undefined,
                departmentId: values?.isCampus ? (undefined as any) : values?.departmentId,
            });

            if ('data' in result) {
                setModalState({
                    message: 'Ticket successfully issued',
                    defaultRender: true,
                    status: 'success',
                    duration: 1,
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
                        ticketSummary: TICKET_TEMPLATE.VERBOSE.value,
                        issuedBy: '',
                    } as ICreateTicketPayload,
                });
                router.push({ pathname: '/tickets', params: data as any });
                setSearchedUser(undefined);
                setDepartmentId(undefined);
            }

            if ('error' in result) {
                setModalState({
                    message: (error as any)?.data?.message || 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 1,
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

    const [searchedUser, setSearchedUser] = React.useState<IUser | undefined>(user?._id ? user : undefined);

    const [initialValues] = React.useState<ICreateTicketPayload>({
        departmentId,
        campusId,
        userId: user?._id || '',
        categoryId: '',
        isDepartment,
        isIndividual,
        isCampus,
        isRetracted: false,
        serviceId: '',
        ticketType,
        ticketSummary: TICKET_TEMPLATE.VERBOSE.value,
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

    const ticketSummaryTemplates = [
        {
            id: '1',
            value: 'VERBOSE',
            content: TICKET_TEMPLATE.VERBOSE.value,
        },
        {
            id: '2',
            value: 'MINIMAL',
            content: TICKET_TEMPLATE.MINIMAL.value,
        },
        {
            id: '3',
            value: 'BLANK',
            content: TICKET_TEMPLATE.BLANK.value,
        },
    ];

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
                <View className="mb-4 px-4 gap-8 w-full">
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
                        {({
                            errors,
                            values,
                            handleChange,
                            setFieldValue,
                            handleSubmit,
                            touched,
                            validateField,
                            setTouched,
                        }) => {
                            const handleDepartment = (value: IDepartment['_id']) => {
                                setDepartmentId(value);
                                setFieldValue('userId', undefined);
                                setSearchedUser(undefined);
                                if (value) {
                                    setFieldValue('userId', undefined).then(() => {
                                        setTouched({ userId: true });
                                    });
                                }
                                setFieldValue('departmentId', value);
                            };

                            const handleCampus = (value: ICampus['_id']) => {
                                setCampusId(value);
                                setDepartmentId(undefined);
                                setFieldValue('userId', undefined);
                                setSearchedUser(undefined);
                                setFieldValue('departmentId', undefined).then(() => {
                                    setTouched({ departmentId: true, userId: true });
                                });
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
                                <View className="gap-4 py-4">
                                    <View className="justify-between">
                                        <Label>Ticket Type</Label>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <RadioButtonGroup
                                                className="gap-3 flex-row"
                                                defaultSelected="1"
                                                value={values?.ticketType}
                                                onValueChange={handleTicketType}
                                                radioButtons={ticketTypes}
                                            />
                                        </ScrollView>
                                        {errors?.ticketType && (
                                            <FormErrorMessage>{errors?.ticketType}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Campus</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            value={campusId}
                                            labelKey="campusName"
                                            items={campuses || []}
                                            placeholder="Choose campus"
                                            onValueChange={handleCampus}
                                            isLoading={campusesIsLoading || campusesIsFetching}
                                        />
                                        {errors?.campusId && <FormErrorMessage>{errors?.campusId}</FormErrorMessage>}
                                    </View>
                                    <If condition={!isCampus}>
                                        <View>
                                            <Label>Department</Label>
                                            <PickerSelect
                                                valueKey="_id"
                                                value={departmentId}
                                                labelKey="departmentName"
                                                placeholder="Choose department"
                                                onValueChange={(value: string) => {
                                                    handleDepartment(value);
                                                    setFieldValue('departmentId', value);
                                                }}
                                                items={sortedCampusDepartments || []}
                                                isLoading={campusDepartmentsLoading || campusDepartmentsIsFetching}
                                            />
                                            {!!errors?.departmentId && touched.departmentId && (
                                                <FormErrorMessage>{errors.departmentId}</FormErrorMessage>
                                            )}
                                        </View>
                                    </If>
                                    <If condition={isIndividual}>
                                        <View>
                                            <Label>Worker</Label>
                                            <PickerSelect
                                                valueKey="_id"
                                                labelKey="lastName"
                                                items={workers || []}
                                                value={searchedUser?._id}
                                                placeholder="Choose Worker"
                                                onValueChange={(value: string) => {
                                                    handleUserChange(value);
                                                    setFieldValue('userId', value);
                                                }}
                                                isLoading={workersIsFetching || workersLoading}
                                                customLabel={user => `${user.firstName} ${user.lastName}`}
                                            />
                                            {errors?.userId && <FormErrorMessage>{errors?.userId}</FormErrorMessage>}
                                        </View>
                                        {!!searchedUser && <UserListItem style={{ marginTop: 10 }} {...searchedUser} />}
                                    </If>
                                    <View>
                                        <Label>Category</Label>

                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="categoryName"
                                            items={ticketCategories || []}
                                            value={values.categoryId}
                                            placeholder="Choose Category"
                                            onValueChange={handleChange('categoryId')}
                                            isLoading={categoriesLoading}
                                        />
                                        {errors?.categoryId && touched.categoryId && (
                                            <FormErrorMessage>{errors?.categoryId}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Description Template</Label>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <RadioButtonGroup
                                                value={template}
                                                defaultSelected="1"
                                                radioButtons={ticketSummaryTemplates}
                                                className="gap-3 w-full items-start px-0 flex-row"
                                                onValueChange={key => {
                                                    setTemplate(key);
                                                    handleChange('ticketSummary')(
                                                        TICKET_TEMPLATE[key as unknown as keyof typeof TICKET_TEMPLATE]
                                                            .value
                                                    ) as any;
                                                }}
                                            />
                                        </ScrollView>
                                    </View>
                                    <View>
                                        <Label>Description</Label>
                                        <Textarea
                                            returnKeyType="done"
                                            placeholder="Details"
                                            value={values.ticketSummary}
                                            onChangeText={handleChange('ticketSummary')}
                                        />
                                        {errors?.ticketSummary && touched.ticketSummary && (
                                            <FormErrorMessage>{errors?.ticketSummary}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Button isLoading={isLoading} onPress={handleSubmit as (event: any) => void}>
                                            Submit
                                        </Button>
                                    </View>
                                </View>
                            );
                        }}
                    </Formik>
                </View>
            </ViewWrapper>
        </>
    );
};

export default React.memo(IssueTicket);
