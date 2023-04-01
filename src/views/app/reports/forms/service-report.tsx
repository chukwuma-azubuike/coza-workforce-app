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
import useRole from '../../../../hooks/role';
import If from '../../../../components/composite/if-container';

const ServiceReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IServiceReportPayload;

    const { status, updatedAt } = params;

    const { isCampusPastor } = useRole();

    const [updateReport, { error, isError, isSuccess, reset, isLoading }] = useCreateServiceReportMutation();

    const onSubmit = (values: IServiceReportPayload) => {
        updateReport({ ...values, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: IServiceReportPayload) => {
        updateReport({ ...values, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: IServiceReportPayload) => {
        updateReport({ ...values, status: 'APPROVED' });
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
            reset();
        }
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: 'Something went wrong!',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = {
        ...params,
        serviceStartTime: params.serviceStartTime || '',
        serviceEndTime: params.serviceEndTime || '',
        serviceReportLink: params.serviceReportLink || '',
        observations: params.observations || '',
        imageUrl: params.imageUrl || '',
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
                            {moment(updatedAt || undefined).format('Do MMMM, YYYY')}
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
                                    value={values.serviceReportLink}
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
                                    isDisabled={isCampusPastor}
                                    value={`${values.observations}`}
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
                                        {`${!status ? 'Submit' : 'Update'}`}
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
