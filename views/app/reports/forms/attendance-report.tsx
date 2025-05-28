import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IAttendanceReportPayload } from '@store/types';
import { useCreateAttendanceReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import dayjs from 'dayjs';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import { isIOS } from '@rneui/base';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';

const AttendanceReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IAttendanceReportPayload;

    const { status, updatedAt } = params;

    const {
        isCampusPastor,
        user: { userId },
    } = useRole();

    const [updateReport, { error, isLoading }] = useCreateAttendanceReportMutation();

    const onSubmit = async (values: IAttendanceReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'SUBMITTED' });

            onResponse(res);
        } catch (error) {}
    };

    const onRequestReview = async (values: IAttendanceReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'REVIEW_REQUESTED' });

            onResponse(res);
        } catch (error) {}
    };

    const onApprove = async (values: IAttendanceReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'APPROVED' });

            onResponse(res);
        } catch (error) {}
    };

    const onResponse = React.useCallback(
        (
            res:
                | {
                      data: void;
                      error?: undefined;
                  }
                | {
                      data?: undefined;
                      error: any;
                  }
        ) => {
            if (res.data) {
                setModalState({
                    defaultRender: true,
                    status: 'success',
                    message: 'Report updated',
                });
                router.back();
            }
            if (res.error) {
                setModalState({
                    defaultRender: true,
                    status: 'error',
                    message: (error as any)?.data?.message || 'Something went wrong!',
                });
            }
        },
        []
    );

    const { setModalState } = useModal();

    const INITIAL_VALUES = {
        ...params,
        femaleGuestCount: params.femaleGuestCount || '',
        maleGuestCount: params.maleGuestCount || '',
        otherInfo: params.otherInfo || '',
        imageUrl: params.imageUrl || '',
        infants: params.infants || '',
        total: params.total || '',
    };

    const addValues = React.useCallback((values: IAttendanceReportPayload) => {
        return `${+values.femaleGuestCount + +values.maleGuestCount + +values.infants}`;
    }, []);

    return (
        <ViewWrapper scroll avoidKeyboard={isIOS} avoidKeyboardBehavior="padding">
            <Formik<IAttendanceReportPayload>
                validateOnChange
                enableReinitialize
                onSubmit={onSubmit}
                initialValues={INITIAL_VALUES as unknown as IAttendanceReportPayload}
            >
                {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <View className="pt-4 gap-4 flex-1">
                        <Text className="text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-4 mt-2">
                            <View className="gap-1">
                                <Label>Number of Male Guests</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.maleGuestCount}`}
                                    onChangeText={handleChange('maleGuestCount')}
                                />
                                {errors.maleGuestCount && touched.maleGuestCount && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-1">
                                <Label>Number of Female Guests</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.femaleGuestCount}`}
                                    onChangeText={handleChange('femaleGuestCount')}
                                />
                                {errors.femaleGuestCount && touched.femaleGuestCount && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-1">
                                <Label>Number of Infant Guests</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.infants}`}
                                    onChangeText={handleChange('infants')}
                                />
                                {errors.infants && touched.infants && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-1">
                                <Label>Total</Label>
                                <Input
                                    isDisabled
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    value={addValues(values)}
                                    onChangeText={handleChange('total')}
                                />
                            </View>
                            <Separator className="my-2" />
                            <View>
                                <Textarea
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    onChangeText={handleChange('otherInfo')}
                                    value={!!values?.otherInfo ? values?.otherInfo : undefined}
                                />
                            </View>
                            <If condition={!isCampusPastor}>
                                <View className="mt-1">
                                    <Button
                                        isLoading={isLoading}
                                        onPress={() => {
                                            setFieldValue('total', addValues(values));
                                            handleSubmit();
                                        }}
                                    >
                                        {`${!status ? 'Submit' : 'Update'}`}
                                    </Button>
                                </View>
                            </If>
                            <If condition={isCampusPastor}>
                                <View className="mb-3">
                                    <Textarea
                                        isDisabled={!isCampusPastor}
                                        placeholder="Pastor's comment"
                                        onChangeText={handleChange('pastorComment')}
                                        value={values?.pastorComment ? values?.pastorComment : ''}
                                    />
                                </View>
                                <View className="gap-4 justify-between flex-row">
                                    <Button
                                        onPress={() => onRequestReview(values)}
                                        isLoading={isLoading}
                                        className="flex-1"
                                        variant="outline"
                                        size="sm"
                                    >
                                        Request Review
                                    </Button>
                                    <ButtonComponent
                                        onPress={() => onApprove(values)}
                                        isLoading={isLoading}
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Approve
                                    </ButtonComponent>
                                </View>
                            </If>
                        </View>
                    </View>
                )}
            </Formik>
        </ViewWrapper>
    );
};

export default AttendanceReport;
