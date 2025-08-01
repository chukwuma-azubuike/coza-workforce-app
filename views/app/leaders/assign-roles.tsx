import { Text } from '~/components/ui/text';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import { CloseIcon, View } from 'native-base';
import React, { useState } from 'react';
import ButtonComponent from '@components/atoms/button';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { useAssignSecondaryRolesMutation, useGetUsersQuery } from '@store/services/account';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetRolesQuery } from '@store/services/role';
import { IAssignGroupHead } from '@store/types';
import { AssignGroupHeadSchema } from '@utils/schemas';
import { TouchableOpacity, View } from 'react-native';
import Utils from '@utils/index';
import HStackComponent from '@components/layout/h-stack';

interface IGroupHead {
    campus: string;
    department: string;
    departmentName: string;
    campusName: string;
}
const AssignRole: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;

    const INITIAL_ADDCAMPUS = {
        campus: '',
        department: '',
        role: '',
    };
    const { setModalState } = useModal();
    const [isOpen, setIsOpen] = useState(false);
    const [campusDept, setCampusDept] = useState<IGroupHead[]>([]);
    const [addCampusDept, setAddCampusDept] = useState(INITIAL_ADDCAMPUS);
    const [findCampusDept, setFindCampusDept] = useState(INITIAL_ADDCAMPUS);
    const handleInputChange = (name: string, value: string) => {
        setAddCampusDept({ ...addCampusDept, [name]: value });
    };

    const { data: users } = useGetUsersQuery(
        { departmentId: findCampusDept.department },
        { refetchOnMountOrArgChange: true }
    );
    const sortedUsers = React.useMemo(() => Utils.sortStringAscending(users, 'firstName'), [users]);

    const { data: roles } = useGetRolesQuery();
    const { data: campus } = useGetCampusesQuery();
    const sortedCampuses = React.useMemo(() => Utils.sortStringAscending(campus, 'campusName'), [campus]);
    const { data: alldepartments } = useGetDepartmentsByCampusIdQuery(addCampusDept.campus);
    const { data: finddepartments } = useGetDepartmentsByCampusIdQuery(findCampusDept.campus);
    const sortedDepartments = React.useMemo(
        () => Utils.sortStringAscending(finddepartments, 'departmentName'),
        [finddepartments]
    );

    const handleAddCampusDept = () => {
        const items = campusDept.find(
            item => item.campus === addCampusDept.campus && item.department === addCampusDept.department
        );

        if (items || !addCampusDept.campus || !addCampusDept.department) {
            return;
        }

        const departmentName = alldepartments?.find(item => item._id === addCampusDept.department)
            ?.departmentName as string;
        const campusName = campus?.find(item => item._id === addCampusDept.campus)?.campusName as string;
        const campusDeptData = { ...addCampusDept, campusName, departmentName };
        setCampusDept([...campusDept, campusDeptData]);
        setAddCampusDept(INITIAL_ADDCAMPUS);
    };

    const handleRemoveCampusDept = (value: IGroupHead) => {
        const items = campusDept.filter(item => item.campus !== value.campus && item.department !== value.department);
        setCampusDept(items);
    };

    const [assignRole, { isLoading, error, data, reset }] = useAssignSecondaryRolesMutation();

    const onSubmit: FormikConfig<IAssignGroupHead>['onSubmit'] = async (values, { resetForm }) => {
        const departments = campusDept.map(item => ({
            departmentId: item.department,
            campusId: item.campus,
        }));
        if (!departments.length) {
            return setModalState({
                message: 'Please assign a campus & department',
                status: 'warning',
            });
        }
        const payload = { departments, userId: values.worker, roleId: values.role };

        const result = await assignRole(payload);

        if ('data' in result) {
            setModalState({
                message: 'Roles assigned successfully',
                status: 'success',
            });
            reset();
            navigate('More');
            resetForm({ values: INITIAL_VALUES });
            setCampusDept([]);
            setIsOpen(false);
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: IAssignGroupHead = {
        campus: '',
        department: '',
        worker: '',
        role: '',
    } as IAssignGroupHead;

    const isGroupHead = React.useMemo(
        () => roles?.find(item => item._id === findCampusDept.role)?.name === 'Group Head',
        [roles, findCampusDept]
    );

    const AddNewDept = () => {
        setIsOpen(!isOpen);
    };
    return (
        <ViewWrapper scroll noPadding style={{ paddingTop: 10 }}>
            <View space="lg" alignItems="flex-start" w="100%" mb={24} className="px-4">
                <View alignItems="center" w="100%">
                    <Formik<IAssignGroupHead>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={AssignGroupHeadSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched, setFieldValue }) => {
                            const handleCampusDept = (name: string, value: string) => {
                                setFieldValue(name, value);
                                setFindCampusDept({ ...findCampusDept, [name]: value });
                            };

                            return (
                                <View w="100%" space={4}>
                                    <View isInvalid={!!errors?.campus && touched.campus}>
                                        <Label>Campus</Label>
                                        <SelectComponent
                                            valueKey="_id"
                                            items={sortedCampuses}
                                            displayKey="campusName"
                                            selectedValue={values.campus}
                                            placeholder="Select Campus"
                                            onValueChange={value => handleCampusDept('campus', value as string) as any}
                                        >
                                            {sortedCampuses?.map((item, key) => (
                                                <SelectItemComponent
                                                    key={key}
                                                    value={item._id}
                                                    label={item.campusName}
                                                />
                                            ))}
                                        </SelectComponent>
                                        <FormErrorMessage
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
                                            {errors?.campus}
                                        </FormErrorMessage>
                                    </View>
                                    <View isInvalid={!!errors?.department && touched.department}>
                                        <Label>Department</Label>
                                        <SelectComponent
                                            valueKey="_id"
                                            items={sortedDepartments}
                                            displayKey="departmentName"
                                            selectedValue={values.department}
                                            placeholder="Select Department"
                                            isDisabled={!findCampusDept.campus}
                                            onValueChange={value => handleCampusDept('department', value as string)}
                                        >
                                            {sortedDepartments?.map((item, key) => (
                                                <SelectItemComponent
                                                    key={key}
                                                    value={item._id}
                                                    label={item.departmentName}
                                                />
                                            ))}
                                        </SelectComponent>
                                        <FormErrorMessage
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
                                            {errors?.department}
                                        </FormErrorMessage>
                                    </View>
                                    <View isInvalid={!!errors?.worker && touched.worker}>
                                        <Label>Worker</Label>
                                        <SelectComponent
                                            valueKey="_id"
                                            items={sortedUsers}
                                            selectedValue={values.worker}
                                            placeholder="Select a Worker"
                                            displayKey={['firstName', 'lastName']}
                                            isDisabled={!findCampusDept.department}
                                            onValueChange={handleChange('worker') as any}
                                        >
                                            {sortedUsers?.map((item, key) => (
                                                <SelectItemComponent
                                                    key={key}
                                                    value={item._id}
                                                    label={`${item.firstName} ${item.lastName}`}
                                                />
                                            ))}
                                        </SelectComponent>
                                        <FormErrorMessage
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
                                            {errors?.worker}
                                        </FormErrorMessage>
                                    </View>
                                    <View isInvalid={!!errors?.role && touched.role}>
                                        <Label>Role</Label>
                                        <SelectComponent
                                            valueKey="_id"
                                            displayKey="name"
                                            items={roles || []}
                                            placeholder="Select Role"
                                            selectedValue={values.role}
                                            onValueChange={value => handleCampusDept('role', value as string)}
                                            isDisabled={!findCampusDept.campus && !findCampusDept.department}
                                        >
                                            {roles?.map((item, key) => (
                                                <SelectItemComponent key={key} value={item._id} label={item.name} />
                                            ))}
                                        </SelectComponent>
                                        <FormErrorMessage
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
                                            {errors?.role}
                                        </FormErrorMessage>
                                    </View>
                                    <View>
                                        {campusDept?.map((item, key) => (
                                            <View
                                                key={key}
                                                _dark={{ bgColor: 'gray.800', borderColor: 'gray.600' }}
                                                _light={{ bgColor: 'gray.100', borderColor: 'gray.600' }}
                                                borderColor={THEME_CONFIG.veryLightGray}
                                                borderRadius={6}
                                                mb="2"
                                                borderWidth={1}
                                                flexDirection="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                className="py-2 px-3"
                                            >
                                                <View>
                                                    <Text>Campus: {item.campusName}</Text>
                                                    <Text>Department: {item.departmentName}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => handleRemoveCampusDept(item)}>
                                                    <CloseIcon />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                    {isGroupHead && (
                                        <View>
                                            <ButtonComponent secondary size="md" onPress={AddNewDept}>
                                                {isOpen ? 'Done' : '+ Add a Campus Department'}
                                            </ButtonComponent>
                                        </View>
                                    )}
                                    {isOpen && (
                                        <View space={2}>
                                            <View>
                                                <Label>Campus</Label>
                                                <SelectComponent
                                                    valueKey="_id"
                                                    placeholder="Campus"
                                                    items={sortedCampuses}
                                                    displayKey={'campusName'}
                                                    selectedValue={addCampusDept.campus}
                                                    onValueChange={(value: any) => handleInputChange('campus', value)}
                                                >
                                                    {sortedCampuses?.map((item, key) => (
                                                        <SelectItemComponent
                                                            key={key}
                                                            value={item._id}
                                                            label={item.campusName}
                                                        />
                                                    ))}
                                                </SelectComponent>
                                            </View>
                                            <View>
                                                <Label>Department</Label>
                                                <SelectComponent
                                                    valueKey="_id"
                                                    items={sortedDepartments}
                                                    displayKey="departmentName"
                                                    selectedValue={addCampusDept.department}
                                                    placeholder="Department"
                                                    onValueChange={(value: any) =>
                                                        handleInputChange('department', value)
                                                    }
                                                    isDisabled={!addCampusDept.campus}
                                                >
                                                    {sortedDepartments?.map((item, key) => (
                                                        <SelectItemComponent
                                                            key={key}
                                                            value={item._id}
                                                            label={item.departmentName}
                                                        />
                                                    ))}
                                                </SelectComponent>
                                            </View>

                                            <View space={4}>
                                                <ButtonComponent
                                                    secondary
                                                    size="md"
                                                    onPress={AddNewDept}
                                                    style={{ width: '100%', flex: 1 }}
                                                >
                                                    Cancel
                                                </ButtonComponent>
                                                <ButtonComponent
                                                    size="md"
                                                    onPress={handleAddCampusDept}
                                                    style={{ width: '100%', flex: 1 }}
                                                >
                                                    Add
                                                </ButtonComponent>
                                            </View>
                                        </View>
                                    )}
                                    <View>
                                        <ButtonComponent
                                            mt={4}
                                            isLoading={isLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit
                                        </ButtonComponent>
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

export default React.memo(AssignRole);
