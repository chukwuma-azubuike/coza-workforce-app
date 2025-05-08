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
import TextAreaComponent from '@components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import { isIOS } from '@rneui/base';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';

const AttendanceReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IAttendanceReportPayload;

    const { status, updatedAt } = params;

    const {
        isCampusPastor,
        user: { userId },
    } = useRole();

    const [updateReport, { reset, error, isError, isSuccess, isLoading }] = useCreateAttendanceReportMutation();

    const onSubmit = (values: IAttendanceReportPayload) => {
        updateReport({ ...values, userId, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: IAttendanceReportPayload) => {
        updateReport({ ...values, userId, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: IAttendanceReportPayload) => {
        updateReport({ ...values, userId, status: 'APPROVED' });
    };

    const { setModalState } = useModal();
    const navigation = useNavigation();

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                defaultRender: true,
                status: 'success',
                message: 'Report updated',
            });
            reset();
            navigation.goBack();
        }
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: (error as any)?.data?.message || 'Something went wrong!',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = {
        ...params,
        femaleGuestCount: params.femaleGuestCount || '',
        maleGuestCount: params.maleGuestCount || '',
        otherInfo: params.otherInfo || '',
        imageUrl: params.imageUrl || '',
        infants: params.infants || '',
        total: params.total || '',
    };

    const addValues = (values: IAttendanceReportPayload) => {
        return `${+values.femaleGuestCount + +values.maleGuestCount + +values.infants}`;
    };

    return (
        <Formik<IAttendanceReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IAttendanceReportPayload}
        >
            {({ handleChange, handleSubmit, values, setFieldValue }) => (
                <ViewWrapper scroll avoidKeyboard={isIOS}>
                    <View className="pb-4">
                        <Text className="text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-2 mt-2">
                            <View>
                                <View>Number of Male Guests</View>
                                <Input
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.maleGuestCount}`}
                                    onChangeText={handleChange('maleGuestCount')}
                                />
                                <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                            </View>
                            <View>
                                <View>Number of Female Guests</View>
                                <Input
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.femaleGuestCount}`}
                                    onChangeText={handleChange('femaleGuestCount')}
                                />
                                <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                            </View>
                            <View>
                                <View>Number of Infant Guests</View>
                                <Input
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.infants}`}
                                    onChangeText={handleChange('infants')}
                                />
                                <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                            </View>
                            <View>
                                <View>Total</View>
                                <Input
                                    isDisabled
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={addValues(values)}
                                    onChangeText={handleChange('total')}
                                />
                                <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                            </View>
                            <Separator />
                            <View>
                                <TextAreaComponent
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    onChangeText={handleChange('otherInfo')}
                                    value={!!values?.otherInfo ? values?.otherInfo : undefined}
                                />
                            </View>
                            <If condition={!isCampusPastor}>
                                <View className="mt-1">
                                    <ButtonComponent
                                        isLoading={isLoading}
                                        onPress={() => {
                                            setFieldValue('total', addValues(values));
                                            handleSubmit();
                                        }}
                                    >
                                        {`${!status ? 'Submit' : 'Update'}`}
                                    </ButtonComponent>
                                </View>
                            </If>
                            <If condition={isCampusPastor}>
                                <View className="mb-3">
                                    <TextAreaComponent
                                        isDisabled={!isCampusPastor}
                                        placeholder="Pastor's comment"
                                        onChangeText={handleChange('pastorComment')}
                                        value={values?.pastorComment ? values?.pastorComment : ''}
                                    />
                                </View>
                                <View className="gap-4 justify-between">
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
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default AttendanceReport;
