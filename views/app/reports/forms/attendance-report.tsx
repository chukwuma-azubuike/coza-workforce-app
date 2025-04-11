import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IAttendanceReportPayload } from '@store/types';
import { useCreateAttendanceReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import { FormControl, VStack, Text, Divider, WarningOutlineIcon, HStack } from 'native-base';
import ButtonComponent from '@components/atoms/button';
import dayjs from 'dayjs';
import TextAreaComponent from '@components/atoms/text-area';
import { InputComponent } from '@components/atoms/input';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import { isIOS } from '@rneui/base';

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
                message: error?.data?.message || 'Something went wrong!',
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
            {({ handleChange, errors, handleSubmit, values, setFieldValue }) => (
                <ViewWrapper scroll avoidKeyboard={isIOS}>
                    <VStack pb={10}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {dayjs(updatedAt || undefined).format('Do MMMM, YYYY')}
                        </Text>
                        <VStack space={4} mt={4} px={4}>
                            <FormControl isRequired>
                                <FormControl.Label>Number of Male Guests</FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.maleGuestCount}`}
                                    onChangeText={handleChange('maleGuestCount')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Number of Female Guests</FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.femaleGuestCount}`}
                                    onChangeText={handleChange('femaleGuestCount')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Number of Infant Guests</FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.infants}`}
                                    onChangeText={handleChange('infants')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Total</FormControl.Label>
                                <InputComponent
                                    isDisabled
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={addValues(values)}
                                    onChangeText={handleChange('total')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <Divider />
                            <FormControl>
                                <TextAreaComponent
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    onChangeText={handleChange('otherInfo')}
                                    value={!!values?.otherInfo ? values?.otherInfo : undefined}
                                />
                            </FormControl>
                            <If condition={!isCampusPastor}>
                                <FormControl mt={2}>
                                    <ButtonComponent
                                        isLoading={isLoading}
                                        onPress={() => {
                                            setFieldValue('total', addValues(values));
                                            handleSubmit();
                                        }}
                                    >
                                        {`${!status ? 'Submit' : 'Update'}`}
                                    </ButtonComponent>
                                </FormControl>
                            </If>
                            <If condition={isCampusPastor}>
                                <FormControl mb={6}>
                                    <TextAreaComponent
                                        isDisabled={!isCampusPastor}
                                        placeholder="Pastor's comment"
                                        onChangeText={handleChange('pastorComment')}
                                        value={values?.pastorComment ? values?.pastorComment : ''}
                                    />
                                </FormControl>
                                <HStack space={4} justifyContent="space-between" w="95%">
                                    <ButtonComponent
                                        onPress={() => onRequestReview(values)}
                                        isLoading={isLoading}
                                        width="1/2"
                                        secondary
                                        size="md"
                                    >
                                        Request Review
                                    </ButtonComponent>
                                    <ButtonComponent
                                        onPress={() => onApprove(values)}
                                        isLoading={isLoading}
                                        width="1/2"
                                        size="md"
                                    >
                                        Approve
                                    </ButtonComponent>
                                </HStack>
                            </If>
                        </VStack>
                    </VStack>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default AttendanceReport;
