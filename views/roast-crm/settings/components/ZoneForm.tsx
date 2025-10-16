import React, { memo, useCallback, useMemo, useState } from 'react';
import { Church, Home, Save, Users2Icon, X } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { MessageSquare, MapPin, User } from 'lucide-react-native';

import { useAddZoneMutation } from '~/store/services/roast-crm';
import { Alert, TouchableOpacity, View } from 'react-native';
import useRole from '~/hooks/role';

import { FieldArray, Formik } from 'formik';
import { CreateZonePayload, IDepartment } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import PickerSelect from '~/components/ui/picker-select';
import ViewWrapper from '~/components/layout/viewWrapper';
import { ZoneFormValidationSchema } from '../../utils/validation';
import * as Haptics from 'expo-haptics';
import { useGetCampusesQuery } from '~/store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '~/store/services/department';
import { Badge } from '~/components/ui/badge';
import { Text } from '~/components/ui/text';

const ZoneForm: React.FC<{ setModalVisible: () => void }> = ({ setModalVisible }) => {
    const { user: currentUser, isSuperAdmin } = useRole();
    const [selectedCampus, setSelectedCampus] = useState(currentUser?.campus._id);

    const { data: campuses = [] } = useGetCampusesQuery();
    const { data: departments = [] } = useGetDepartmentsByCampusIdQuery(selectedCampus);
    const departmentIndex = useMemo(
        () =>
            Object.fromEntries(
                departments?.map(({ _id: id, departmentName: name, description }) => [id, { id, name, description }])
            ),
        [departments]
    );
    const [addZone, { isLoading }] = useAddZoneMutation();

    const [newDepartment, setNewDepartment] = useState<string>();

    const onSubmit = useCallback(async (value: CreateZonePayload) => {
        try {
            const coordinates = {
                lat: Number(value?.coordinates?.lat),
                long: Number(value?.coordinates?.long),
            };

            const res = await addZone({ ...value, coordinates });

            if (res.data) {
                setModalVisible();
                Alert.alert('Zone created successfully');
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
    } as CreateZonePayload;

    return (
        <ErrorBoundary>
            <ViewWrapper scroll avoidKeyboard className="pt-4">
                <Formik<CreateZonePayload>
                    onSubmit={onSubmit}
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
                                                value={values?.coordinates?.lat as any}
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
                                                value={values?.coordinates?.long as any}
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
                                            setFieldValue('departments', []);
                                            setSelectedCampus(value);
                                            handleChange('campusId')(value) as any;
                                        }}
                                    />
                                    {errors?.campusId && touched?.campusId && (
                                        <FormErrorMessage>{errors?.campusId}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-4">
                                    <View className="gap-2">
                                        <View className="items-center gap-2 flex-row">
                                            <Users2Icon color="gray" size={16} />
                                            <Label>Department</Label>
                                        </View>
                                        <PickerSelect<IDepartment>
                                            valueKey="_id"
                                            className="!h-12"
                                            value={newDepartment}
                                            labelKey="departmentName"
                                            items={departments || []}
                                            placeholder="Select department"
                                            onValueChange={newDepartment => {
                                                if (!departmentIndex[newDepartment]) return;

                                                const alreadyAdded = values.departments.map(
                                                    department => department.id
                                                );

                                                if (
                                                    newDepartment &&
                                                    Array.isArray(values.departments) &&
                                                    !alreadyAdded.includes(newDepartment)
                                                ) {
                                                    setFieldValue('departments', [
                                                        ...values.departments?.concat([
                                                            departmentIndex[newDepartment] as any,
                                                        ]),
                                                    ]);
                                                    setNewDepartment(undefined);
                                                }
                                            }}
                                        />
                                    </View>
                                </View>

                                {values.departments.length > 0 && (
                                    <FieldArray
                                        name="departments"
                                        render={arrayHelpers => (
                                            <View className="gap-4 flex-wrap flex-row">
                                                {values?.departments?.map((department, idx) => (
                                                    <Badge key={idx} className="h-10 flex-row" variant="outline">
                                                        <Text className="text-sm ml-2">{department?.name}</Text>
                                                        <TouchableOpacity
                                                            className="p-2"
                                                            onPress={() => arrayHelpers.remove(idx)}
                                                        >
                                                            <X color="red" size={18} />
                                                        </TouchableOpacity>
                                                    </Badge>
                                                ))}
                                            </View>
                                        )}
                                    />
                                )}

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
                                        icon={<Save color="white" size={18} />}
                                        disabled={!isValid}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Add Zone
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
