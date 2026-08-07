import React, { memo, useCallback, useState } from 'react';
import { Church, Home, Save, Users2Icon } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { MessageSquare, MapPin, User } from 'lucide-react-native';

import { useAddZoneMutation, useUpdateZoneMutation } from '~/store/services/roast-crm';
import { Alert, View } from 'react-native';
import useRole from '~/hooks/role';

import { Formik } from 'formik';
import { IDepartment, Zone } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import PickerSelect from '~/components/ui/picker-select';
import ViewWrapper from '~/components/layout/viewWrapper';
import { ZoneFormValidationSchema } from '../../utils/validation';
import * as Haptics from 'expo-haptics';
import { useGetCampusesQuery } from '~/store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '~/store/services/department';

const ZoneForm: React.FC<{ setModalVisible: () => void; initialValues?: Zone }> = ({
    setModalVisible,
    initialValues,
}) => {
    const { user: currentUser, isSuperAdmin } = useRole();
    // A super admin can edit a zone outside their own campus, and the department
    // list has to follow the zone being edited or its saved departments resolve
    // to nothing.
    const [selectedCampus, setSelectedCampus] = useState(initialValues?.campusId ?? currentUser?.campus._id);

    const { data: campuses = [] } = useGetCampusesQuery();
    // `isLoading`, not `isFetching`: this gates the picker, and a background
    // refetch on focus shouldn't blank a list the user is already looking at.
    const { data: departments = [], isLoading: isLoadingDepartments } =
        useGetDepartmentsByCampusIdQuery(selectedCampus);
    const [addZone, { isLoading }] = useAddZoneMutation();
    const [updateZone, { isLoading: updating }] = useUpdateZoneMutation();

    const onSubmit = useCallback(async (value: Partial<Zone>) => {
        try {
            const coordinates = {
                lat: Number(value?.coordinates?.lat),
                long: Number(value?.coordinates?.long),
            };

            const call = value?._id ? updateZone : addZone;
            const res = await call({ ...value, coordinates } as any);

            if (res.data) {
                setModalVisible();
                Alert.alert(`Zone ${value?._id ? 'updated' : 'created'} successfully`);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            if (res.error) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert((res?.error as any)?.data?.message || 'Oops something went wrong');
            }
        } catch (error) {}
    }, []);

    const INITIAL_VALUES = {
        campusId: currentUser?.campus._id as string,
        departments: [] as any,
        ...initialValues,
    } as Zone;

    return (
        <ErrorBoundary>
            <ViewWrapper scroll avoidKeyboard className="pt-4">
                <Formik<Zone>
                    onSubmit={onSubmit as any}
                    initialValues={INITIAL_VALUES}
                    validationSchema={ZoneFormValidationSchema}
                >
                    {({ errors, touched, values, setFieldValue, isValid, handleChange, handleSubmit }) => {
                        return (
                            <View className="gap-4 pb-6">
                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <User color="gray" size={16} />
                                        <Label>Name</Label>
                                    </View>
                                    <Input
                                        placeholder="Enter zone name"
                                        className="!h-12"
                                        value={values?.name}
                                        onChangeText={handleChange('name')}
                                    />
                                    {errors?.name && touched?.name && (
                                        <FormErrorMessage>{errors?.name}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <Home color="gray" size={16} />
                                        <Label>Address</Label>
                                    </View>
                                    <Input
                                        className="!h-12"
                                        placeholder="Address"
                                        value={values?.address as string}
                                        onChangeText={handleChange('address')}
                                    />
                                    {errors?.address && touched?.address && (
                                        <FormErrorMessage>{errors?.address}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <MapPin color="gray" size={16} />
                                        <Label>Coordinates (Optional)</Label>
                                    </View>
                                    <View className="gap-4 flex-row">
                                        <View className="gap-2 flex-1">
                                            <Input
                                                className="!h-12"
                                                placeholder="Latitude"
                                                keyboardType="numeric"
                                                value={`${values?.coordinates?.lat ?? ''}` as any}
                                                onChangeText={handleChange('coordinates.lat')}
                                            />
                                            {errors?.coordinates?.lat && touched?.coordinates?.lat && (
                                                <FormErrorMessage>{errors?.coordinates?.lat}</FormErrorMessage>
                                            )}
                                        </View>
                                        <View className="gap-2 flex-1">
                                            <Input
                                                className="!h-12"
                                                keyboardType="numeric"
                                                placeholder="Longitude"
                                                value={`${values?.coordinates?.long ?? ''}` as any}
                                                onChangeText={handleChange('coordinates.long')}
                                            />
                                            {errors?.coordinates?.long && touched?.coordinates?.long && (
                                                <FormErrorMessage>{errors?.coordinates?.long}</FormErrorMessage>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <Church color="gray" size={16} />
                                        <Label>Campus</Label>
                                    </View>
                                    <PickerSelect
                                        valueKey="_id"
                                        labelKey="campusName"
                                        className="!h-12"
                                        disabled={!isSuperAdmin}
                                        items={campuses || []}
                                        value={values?.campusId}
                                        placeholder="Select campus"
                                        onValueChange={value => {
                                            // The departments field parks and
                                            // restores itself off `scopeKey`.
                                            setSelectedCampus(value);
                                            handleChange('campusId')(value) as any;
                                        }}
                                    />
                                    {errors?.campusId && touched?.campusId && (
                                        <FormErrorMessage>{errors?.campusId}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <Users2Icon color="gray" size={16} />
                                        <Label>Departments</Label>
                                    </View>
                                    <PickerSelect<IDepartment>
                                        multiple
                                        valueKey="_id"
                                        className="!h-12"
                                        labelKey="departmentName"
                                        items={departments || []}
                                        placeholder="Select departments"
                                        isLoading={isLoadingDepartments}
                                        scopeKey={values?.campusId}
                                        values={(values?.departments ?? []).map(
                                            department => department.id ?? department._id
                                        )}
                                        onValuesChange={(_ids, selected: IDepartment[]) => {
                                            setFieldValue(
                                                'departments',
                                                selected.map(department => ({
                                                    id: department._id,
                                                    _id: department._id,
                                                    name: department.departmentName,
                                                    description: department.description,
                                                }))
                                            );
                                        }}
                                    />
                                </View>

                                <View className="gap-2 mb-2">
                                    <View className="items-center gap-2 flex-row">
                                        <MessageSquare color="gray" size={16} />
                                        <Label>Description (Optional)</Label>
                                    </View>
                                    <Textarea
                                        placeholder="Describe the zone"
                                        value={values?.descriptions as string}
                                        onChangeText={handleChange('descriptions')}
                                    />
                                </View>

                                <View>
                                    <Button
                                        size="sm"
                                        disabled={!isValid}
                                        isLoading={isLoading || updating}
                                        icon={<Save color="white" size={18} />}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        {values?._id ? 'Update Zone' : 'Add Zone'}
                                    </Button>
                                </View>
                            </View>
                        );
                    }}
                </Formik>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default memo(ZoneForm);

ZoneForm.displayName = 'ZoneForm';
