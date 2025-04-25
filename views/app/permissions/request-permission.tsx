import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import React from 'react';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import DateTimePicker from '~/components/composite/date-time-picker';
import useModal from '@hooks/modal/useModal';
import { useGetPermissionCategoriesQuery, useRequestPermissionMutation } from '@store/services/permissions';
import { Formik, FormikConfig } from 'formik';
import { IPermissionCategory, IRequestPermissionPayload } from '@store/types';
import useRole from '@hooks/role';
import { RequestPermissionSchema } from '@utils/schemas';
import useScreenFocus from '@hooks/focus';
import dayjs from 'dayjs';
import ErrorBoundary from '@components/composite/error-boundary';
import { router } from 'expo-router';
import FormErrorMessage from '~/components/ui/error-message';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import PickerSelect from '~/components/ui/picker-select';

const RequestPermission: React.FC = () => {
    const { user } = useRole();
    const { setModalState } = useModal();

    const { data: categories = [], isLoading: categoriesLoading } = useGetPermissionCategoriesQuery();
    const [requestPermission, { reset, isLoading }] = useRequestPermissionMutation();

    const handleSubmit: FormikConfig<IRequestPermissionPayload>['onSubmit'] = async (values, { resetForm }) => {
        const result = await requestPermission({
            ...values,
            startDate: dayjs(values.startDate).unix(),
            endDate: dayjs(values.endDate).unix(),
        });

        if ('data' in result) {
            setModalState({
                message: 'Your request has been sent',
                status: 'success',
            });
            reset();
            router.push({
                pathname: '/permissions',
                params: {
                    ...result?.data,
                    categoryName: categories?.find(category => category._id === values.categoryId)?.name,
                    requestor: user,
                } as any,
            });
            resetForm({ values: INITIAL_VALUES });
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const iconMap = {
        medical: {
            type: 'antdesign',
            name: 'medicinebox',
        },
        education: {
            type: 'ionicon',
            name: 'school-outline',
        },
        work: {
            type: 'ionicon',
            name: 'briefcase-outline',
        },
        maternity: {
            type: 'material-community',
            name: 'mother-nurse',
        },
        vacation: {
            type: 'material-community',
            name: 'beach',
        },
    };

    const INITIAL_VALUES = {
        endDate: '',
        startDate: '',
        categoryId: '',
        approvedBy: '',
        description: '',
        status: 'PENDING',
        campusId: user.campus._id,
        requestor: user?._id || user?.userId,
        departmentId: user.department._id,
    } as IRequestPermissionPayload;

    useScreenFocus({
        onFocus: reset,
        onFocusExit: reset,
    });

    return (
        <ErrorBoundary>
            <ScrollView className="px-4 w-full flex-1">
                <View className="items-center w-full flex-1">
                    <Formik<IRequestPermissionPayload>
                        onSubmit={handleSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={RequestPermissionSchema}
                    >
                        {({ errors, touched, values, handleChange, handleSubmit }) => {
                            return (
                                <View className="gap-2 w-full flex-1">
                                    <View className="justify-between flex-row gap-4">
                                        <View className="flex-1">
                                            <DateTimePicker
                                                mode="date"
                                                label="Start date"
                                                minimumDate={new Date()}
                                                error={errors.startDate}
                                                touched={touched.startDate}
                                                placeholder="Enter start date"
                                                initialValue={new Date().toISOString()}
                                                onConfirm={
                                                    handleChange('startDate') as unknown as (value: Date) => void
                                                }
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <DateTimePicker
                                                mode="date"
                                                label="End date"
                                                className="flex-1"
                                                error={errors.endDate}
                                                touched={touched.endDate}
                                                placeholder="Enter end date"
                                                minimumDate={dayjs(values?.startDate || undefined).toDate()}
                                                onConfirm={handleChange('endDate') as unknown as (value: Date) => void}
                                            />
                                        </View>
                                    </View>
                                    <View className="gap-2">
                                        <Label>Category</Label>
                                        <PickerSelect<IPermissionCategory>
                                            valueKey="_id"
                                            labelKey="name"
                                            items={categories}
                                            isLoading={categoriesLoading}
                                            value={`${values.categoryId}`}
                                            onValueChange={handleChange('categoryId')}
                                        />
                                        {errors.categoryId && touched.categoryId && (
                                            <FormErrorMessage>{errors.categoryId}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="gap-1">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={values.description}
                                            placeholder="Brief description"
                                            onChangeText={handleChange('description')}
                                        />
                                        {errors?.description && touched?.description && (
                                            <FormErrorMessage>{errors?.description}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="mt-2">
                                        <Button isLoading={isLoading} onPress={handleSubmit as (event: any) => void}>
                                            Submit for Approval
                                        </Button>
                                    </View>
                                </View>
                            );
                        }}
                    </Formik>
                </View>
            </ScrollView>
        </ErrorBoundary>
    );
};

export default React.memo(RequestPermission);
