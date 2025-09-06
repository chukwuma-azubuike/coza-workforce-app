import { Text } from '~/components/ui/text';
import { Formik, FormikConfig } from 'formik';
import React, { useState } from 'react';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { useAssignSecondaryRolesMutation, useGetUsersQuery } from '@store/services/account';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetRolesQuery } from '@store/services/role';
import { IAssignGroupHead } from '@store/types';
import { AssignGroupHeadSchema } from '@utils/schemas';
import { TouchableOpacity, View } from 'react-native';
import Utils from '@utils/index';
import { Label } from '~/components/ui/label';
import PickerSelect from '~/components/ui/picker-select';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';

interface IGroupHead {
    campus: string;
    department: string;
    departmentName: string;
    campusName: string;
}
const AssignRole: React.FC = () => {
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
        setCampusDept(campusDept.concat(campusDeptData));
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
            resetForm({ values: INITIAL_VALUES });
            setCampusDept([]);
            setIsOpen(false);
            router.push('/more');
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
            <View className="px-4 gap-12 items-start w-full mb-12">
                <View className="w-full items-center">
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
                                <View className="w-full gap-4">
                                    <View>
                                        <Label>Campus</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            value={values.campus}
                                            labelKey="campusName"
                                            placeholder="Select Campus"
                                            items={sortedCampuses || []}
                                            onValueChange={value => handleCampusDept('campus', value as string) as any}
                                        />
                                        {errors?.campus && <FormErrorMessage>{errors?.campus}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>Department</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="departmentName"
                                            value={values.department}
                                            placeholder="Select Department"
                                            items={sortedDepartments || []}
                                            disabled={!findCampusDept.campus}
                                            onValueChange={value => handleCampusDept('department', value as string)}
                                        />
                                        {errors?.department && (
                                            <FormErrorMessage>{errors?.department}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Worker</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="firstName"
                                            value={values.worker}
                                            items={sortedUsers || []}
                                            placeholder="Select a worker"
                                            disabled={!findCampusDept.department}
                                            onValueChange={handleChange('worker') as any}
                                            customLabel={({ firstName, lastName }: any) => `${firstName} ${lastName}`}
                                        />
                                        {errors?.worker && <FormErrorMessage>{errors?.worker}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>Role</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="name"
                                            value={values.role}
                                            items={roles || []}
                                            placeholder="Select role"
                                            disabled={!findCampusDept.campus && !findCampusDept.department}
                                            onValueChange={value => handleCampusDept('role', value as string)}
                                        />
                                        {errors?.role && <FormErrorMessage>{errors?.role}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        {campusDept?.map((item, key) => (
                                            <View
                                                key={key}
                                                className="py-2 px-3 bg-muted-background border-border items-center justify-between flex-row border mb-4 rounded-md"
                                            >
                                                <View>
                                                    <Text className="font-semibold">{item.campusName}</Text>
                                                    <Text className="font-semibold">{item.departmentName}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => handleRemoveCampusDept(item)}>
                                                    <X />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                    {isGroupHead && (
                                        <View>
                                            <Button variant="outline" onPress={AddNewDept} size="sm">
                                                {isOpen ? 'Done' : '+ Add a Campus Department'}
                                            </Button>
                                        </View>
                                    )}
                                    {isOpen && (
                                        <View className="gap-4">
                                            <View>
                                                <Label>Campus</Label>
                                                <PickerSelect
                                                    valueKey="_id"
                                                    labelKey="campusName"
                                                    placeholder="Campus"
                                                    value={addCampusDept.campus}
                                                    items={sortedCampuses || []}
                                                    onValueChange={(value: any) => handleInputChange('campus', value)}
                                                />
                                            </View>
                                            <View>
                                                <Label>Department</Label>
                                                <PickerSelect
                                                    valueKey="_id"
                                                    labelKey="departmentName"
                                                    placeholder="Select department"
                                                    value={addCampusDept.department}
                                                    items={sortedDepartments || []}
                                                    onValueChange={(value: any) =>
                                                        handleInputChange('department', value)
                                                    }
                                                />
                                            </View>

                                            <View className="flex-row gap-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onPress={AddNewDept}
                                                    className="w-full flex-1"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="w-full flex-1"
                                                    onPress={handleAddCampusDept}
                                                >
                                                    Add
                                                </Button>
                                            </View>
                                        </View>
                                    )}
                                    <View>
                                        <ButtonComponent
                                            className="mt-8"
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
