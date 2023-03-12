import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IGuestReportPayload } from '../../../../store/types';
import { useCreateGuestReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { FormControl, VStack, Text, Divider, WarningOutlineIcon, HStack } from 'native-base';
import ButtonComponent from '../../../../components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { InputComponent } from '../../../../components/atoms/input';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '../../../../components/composite/if-container';
import useRole from '../../../../hooks/role';

const GuestReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IGuestReportPayload;

    const { isCampusPastor } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading }] = useCreateGuestReportMutation();

    const onSubmit = (values: IGuestReportPayload) => {
        updateReport({ ...values, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: IGuestReportPayload) => {
        updateReport({ ...values, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: IGuestReportPayload) => {
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
        ...params,
        firstTimersCount: params.firstTimersCount || 0,
        newConvertsCount: params.newConvertsCount || 0,
    };

    return (
        <Formik<IGuestReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IGuestReportPayload}
        >
            {({ handleChange, errors, handleSubmit, values }) => (
                <ViewWrapper scroll>
                    <VStack pb={10}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {moment().format('Do MMMM, YYYY')}
                        </Text>
                        <VStack space={4} mt={4} px={4}>
                            <FormControl isRequired>
                                <FormControl.Label>Number of First Timers</FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.firstTimersCount}`}
                                    onChangeText={handleChange('firstTimersCount')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>Number of New Converts</FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.newConvertsCount}`}
                                    onChangeText={handleChange('newConvertsCount')}
                                />
                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <Divider />
                            <FormControl mb={2}>
                                <TextAreaComponent
                                    isDisabled={isCampusPastor}
                                    value={`${values.otherInfo}`}
                                    placeholder="Any other information"
                                    onChangeText={handleChange('otherInfo')}
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
                                        isDisabled={isCampusPastor}
                                        placeholder="Pastor's comment"
                                        value={`${values.pastorComment}`}
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

export default GuestReport;
