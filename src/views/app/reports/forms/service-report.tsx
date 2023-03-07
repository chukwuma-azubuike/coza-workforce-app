/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IServiceReportPayload } from '../../../../store/types';
import { useCreateServiceReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { FormControl, VStack, Text, Divider, WarningOutlineIcon, HStack } from 'native-base';
import { DateTimePickerComponent } from '../../../../components/composite/date-picker';
import ButtonComponent from '../../../../components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { InputComponent } from '../../../../components/atoms/input';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IReportFormProps } from './types';
import useRole from '../../../../hooks/role';
import If from '../../../../components/composite/if-container';

const ServiceReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IReportFormProps;

    const { isCampusPastor } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading }] = useCreateServiceReportMutation();

    const onSubmit = (values: IServiceReportPayload) => {
        updateReport({ ...values, ...params, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: IServiceReportPayload) => {
        updateReport({ ...values, ...params, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: IServiceReportPayload) => {
        updateReport({ ...values, ...params, status: 'APPROVED' });
    };

    const navigation = useNavigation();

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                defaultRender: true,
                status: 'success',
                message: 'Report updated',
            });
            navigation.goBack();
        }
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: 'Something went wrong!',
            });
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = {
        serviceStartTime: '',
        serviceEndTime: '',
        serviceReportLink: '',
        observations: '',
        imageUrl: '',
        ...params,
    };

    return (
        <Formik<IServiceReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IServiceReportPayload}
        >
            {({ handleChange, errors, handleSubmit, values, setFieldValue }) => (
                <ViewWrapper scroll>
                    <VStack pb={10}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {moment().format('Do MMMM, YYYY')}
                        </Text>
                        <VStack space={4} mt={4} px={4}>
                            <HStack justifyContent="space-between">
                                <DateTimePickerComponent
                                    mode="time"
                                    label="Service Start Time"
                                    fieldName="serviceStartTime"
                                    onSelectDate={setFieldValue}
                                />
                                <DateTimePickerComponent
                                    mode="time"
                                    label="Service End Time"
                                    fieldName="serviceEndTime"
                                    onSelectDate={setFieldValue}
                                />
                            </HStack>
                            <FormControl isRequired>
                                <FormControl.Label>Link to Service Report</FormControl.Label>
                                <InputComponent
                                    keyboardType="url"
                                    placeholder="https://www.link-to-report.com"
                                    onChangeText={handleChange('serviceReportLink')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <Divider />
                            <FormControl mb={2}>
                                <TextAreaComponent
                                    placeholder="Service Observations"
                                    onChangeText={handleChange('observations')}
                                />
                            </FormControl>
                            <If condition={!isCampusPastor}>
                                <FormControl>
                                    <ButtonComponent
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Submit
                                    </ButtonComponent>
                                </FormControl>
                            </If>
                            <If condition={isCampusPastor}>
                                <FormControl mb={6}>
                                    <TextAreaComponent
                                        placeholder="Pastor's comment"
                                        onChangeText={handleChange('pastorComment')}
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

export default ServiceReport;
