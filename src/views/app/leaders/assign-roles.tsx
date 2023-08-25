import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import { Box, CloseIcon, FormControl, HStack, Text, VStack } from 'native-base';
import React, { useState } from 'react';
import ButtonComponent from '../../../components/atoms/button';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../config/appConfig';
import useModal from '../../../hooks/modal/useModal';
import { useAssignSecondaryRolesMutation, useGetUsersQuery } from '../../../store/services/account';
import { useGetCampusesQuery } from '../../../store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useGetRolesQuery } from '../../../store/services/role';
import { IAssignGroupHead } from '../../../store/types';
import { AssignGroupHeadSchema } from '../../../utils/schemas';
import { TouchableOpacity } from 'react-native';

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
    const { data: roles } = useGetRolesQuery();
    const { data: campus } = useGetCampusesQuery();
    const { data: alldepartments } = useGetDepartmentsByCampusIdQuery(addCampusDept.campus);
    const { data: finddepartments } = useGetDepartmentsByCampusIdQuery(findCampusDept.campus);

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
            resetForm(INITIAL_VALUES as any);
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

    const isGroupHead = roles?.find(item => item._id === findCampusDept.role)?.name === 'Group Head';

    const AddNewDept = () => {
        setIsOpen(!isOpen);
    };
    return (
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={24}>
                <Box alignItems="center" w="100%">
                    <Formik<IAssignGroupHead>
                        validateOnChange
                        enableReinitialize
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
                                <VStack w="100%" space={4}>
                                    <FormControl isRequired isInvalid={!!errors?.campus && touched.campus}>
                                        <FormControl.Label>Campus</FormControl.Label>
                                        <SelectComponent
                                            selectedValue={values.campus}
                                            placeholder="Select Campus"
                                            onValueChange={value => handleCampusDept('campus', value)}
                                        >
                                            {campus?.map((item, key) => (
                                                <SelectItemComponent
                                                    key={key}
                                                    value={item._id}
                                                    label={item.campusName}
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
                                            {errors?.campus}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.department && touched.department}>
                                        <FormControl.Label>Department</FormControl.Label>
                                        <SelectComponent
                                            selectedValue={values.department}
                                            placeholder="Select Department"
                                            onValueChange={value => handleCampusDept('department', value)}
                                            isDisabled={!findCampusDept.campus}
                                        >
                                            {finddepartments?.map((item, key) => (
                                                <SelectItemComponent
                                                    key={key}
                                                    value={item._id}
                                                    label={item.departmentName}
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
                                            {errors?.department}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.worker && touched.worker}>
                                        <FormControl.Label>Worker</FormControl.Label>
                                        <SelectComponent
                                            selectedValue={values.worker}
                                            placeholder="Select a Worker"
                                            onValueChange={handleChange('worker')}
                                            isDisabled={!findCampusDept.department}
                                        >
                                            {users?.map((item, key) => (
                                                <SelectItemComponent
                                                    key={key}
                                                    value={item._id}
                                                    label={`${item.firstName} ${item.lastName}`}
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
                                            {errors?.worker}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.role && touched.role}>
                                        <FormControl.Label>Role</FormControl.Label>
                                        <SelectComponent
                                            selectedValue={values.role}
                                            placeholder="Select Role"
                                            onValueChange={value => handleCampusDept('role', value)}
                                            isDisabled={!findCampusDept.campus && !findCampusDept.department}
                                        >
                                            {roles?.map((item, key) => (
                                                <SelectItemComponent key={key} value={item._id} label={item.name} />
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
                                            {errors?.role}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <VStack>
                                        {campusDept?.map((item, key) => (
                                            <Box
                                                key={key}
                                                _dark={{ bgColor: 'gray.800', borderColor: 'gray.600' }}
                                                _light={{ bgColor: 'gray.100', borderColor: 'gray.600' }}
                                                borderColor={THEME_CONFIG.veryLightGray}
                                                borderRadius={6}
                                                py={2}
                                                px={3}
                                                mb="2"
                                                borderWidth={1}
                                                flexDirection="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                            >
                                                <Box>
                                                    <Text>Campus: {item.campusName}</Text>
                                                    <Text>Department: {item.departmentName}</Text>
                                                </Box>
                                                <TouchableOpacity onPress={() => handleRemoveCampusDept(item)}>
                                                    <CloseIcon />
                                                </TouchableOpacity>
                                            </Box>
                                        ))}
                                    </VStack>
                                    {isGroupHead && (
                                        <Box>
                                            <ButtonComponent variant="outline" size="sm" onPress={AddNewDept}>
                                                {isOpen ? 'Done' : '+ Add a Campus Department'}
                                            </ButtonComponent>
                                        </Box>
                                    )}

                                    {isOpen && (
                                        <VStack space={2}>
                                            <FormControl>
                                                <FormControl.Label>Campus</FormControl.Label>
                                                <SelectComponent
                                                    selectedValue={addCampusDept.campus}
                                                    placeholder="Campus"
                                                    onValueChange={(value: any) => handleInputChange('campus', value)}
                                                >
                                                    {campus?.map((item, key) => (
                                                        <SelectItemComponent
                                                            key={key}
                                                            value={item._id}
                                                            label={item.campusName}
                                                        />
                                                    ))}
                                                </SelectComponent>
                                            </FormControl>
                                            <FormControl>
                                                <FormControl.Label>Department</FormControl.Label>
                                                <SelectComponent
                                                    selectedValue={addCampusDept.department}
                                                    placeholder="Department"
                                                    onValueChange={(value: any) =>
                                                        handleInputChange('department', value)
                                                    }
                                                    isDisabled={!addCampusDept.campus}
                                                >
                                                    {alldepartments?.map((item, key) => (
                                                        <SelectItemComponent
                                                            key={key}
                                                            value={item._id}
                                                            label={item.departmentName}
                                                        />
                                                    ))}
                                                </SelectComponent>
                                            </FormControl>

                                            <HStack flexDirection={'row'} space={4} width="full">
                                                <ButtonComponent secondary size="sm" width="48%" onPress={AddNewDept}>
                                                    Cancel
                                                </ButtonComponent>
                                                <ButtonComponent size="sm" width="48%" onPress={handleAddCampusDept}>
                                                    Add
                                                </ButtonComponent>
                                            </HStack>
                                        </VStack>
                                    )}
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
    );
};

export default AssignRole;
