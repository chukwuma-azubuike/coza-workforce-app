/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IChildCareReportPayload } from '../../../../store/types';
import { useCreateChildCareReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { FormControl, HStack, VStack, Text, Divider } from 'native-base';
import { InputComponent } from '../../../../components/atoms/input';
import ButtonComponent from '../../../../components/atoms/button';
import { THEME_CONFIG } from '../../../../config/appConfig';
import { Icon } from '@rneui/themed';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IReportFormProps } from './types';
import If from '../../../../components/composite/if-container';
import useRole from '../../../../hooks/role';

const ChildcareReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IReportFormProps;

    const { isCampusPastor } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading }] = useCreateChildCareReportMutation();

    const onSubmit = (values: IChildCareReportPayload) => {
        updateReport({ ...values, ...params, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: IChildCareReportPayload) => {
        updateReport({ ...values, ...params, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: IChildCareReportPayload) => {
        updateReport({ ...values, ...params, status: 'APPROVED' });
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
        age1_2: {
            male: 0,
            female: 0,
        },
        age3_5: {
            male: 0,
            female: 0,
        },
        age6_11: {
            male: 0,
            female: 0,
        },
        age12_above: {
            male: 0,
            female: 0,
        },
        ...params,
    } as IChildCareReportPayload;

    const addGrandTotal = (values: IChildCareReportPayload) => {
        return `${
            +values.age1_2?.female +
                +values.age3_5?.female +
                +values.age6_11?.female +
                +values.age12_above?.female +
                +values.age1_2?.male +
                +values.age3_5?.male +
                +values.age6_11?.male +
                +values.age12_above?.male ?? 0
        }`;
    };

    const addSubTotal = (values: IChildCareReportPayload, field: 'male' | 'female') => {
        return `${
            +values.age1_2?.[field] +
                +values.age3_5?.[field] +
                +values.age6_11?.[field] +
                +values.age12_above?.[field] ?? 0
        }`;
    };

    return (
        <Formik<IChildCareReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, errors, values, handleSubmit, setFieldValue }) => (
                <ViewWrapper scroll>
                    <VStack pb={10}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {moment().format('Do MMMM, YYYY')}
                        </Text>
                        <HStack px={4} flex={1} justifyContent="space-between">
                            <VStack space={4} mt={12}>
                                <Text my={4} color="gray.600">
                                    Age 1 - 2
                                </Text>
                                <Text my={4} color="gray.600">
                                    Age 3 - 5
                                </Text>
                                <Text my={4} color="gray.600">
                                    Age 6 - 11
                                </Text>
                                <Text my={4} color="gray.600">
                                    Age 12 & Above
                                </Text>
                                <Text my={4} color="gray.600">
                                    Sub Total
                                </Text>
                            </VStack>
                            <VStack alignItems="center" space={4} w="30%">
                                <FormControl.Label>Male</FormControl.Label>
                                <FormControl isRequired isInvalid={errors?.age1_2?.male ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age1_2.male')}
                                    />
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
                                        {errors?.age1_2?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={errors?.age3_5?.male ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age3_5.male')}
                                    />
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
                                        {errors?.age3_5?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={errors?.age6_11?.male ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age6_11.male')}
                                    />
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
                                        {errors?.age6_11?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={errors?.age12_above?.male ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age12_above.male')}
                                    />
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
                                        {errors?.age12_above?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isDisabled>
                                    <InputComponent
                                        w="100%"
                                        value={addSubTotal(values, 'male')}
                                        keyboardType="numeric"
                                        onChangeText={handleChange('subTotal.male')}
                                    />
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
                                        {errors?.subTotal?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                            </VStack>
                            <VStack alignItems="center" space={4} w="30%">
                                <FormControl.Label>Female</FormControl.Label>
                                <FormControl isRequired isInvalid={errors?.age1_2?.female ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age1_2.female')}
                                    />
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
                                        {errors?.age1_2?.female}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={errors?.age3_5?.female ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age3_5.female')}
                                    />
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
                                        {errors?.age3_5?.female}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={errors?.age6_11?.female ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age6_11.female')}
                                    />
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
                                        {errors?.age6_11?.female}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={errors?.age12_above?.female ? true : false}>
                                    <InputComponent
                                        w="100%"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('age12_above.female')}
                                    />
                                </FormControl>
                                <FormControl isDisabled>
                                    <InputComponent
                                        w="100%"
                                        value={addSubTotal(values, 'female')}
                                        keyboardType="numeric"
                                        onChangeText={handleChange('subTotal.female')}
                                    />
                                </FormControl>
                            </VStack>
                        </HStack>
                        <VStack space={4} mt={4} px={4}>
                            <FormControl>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <FormControl.Label>Grand Total</FormControl.Label>
                                    <InputComponent
                                        w="66%"
                                        isDisabled
                                        value={addGrandTotal(values)}
                                        keyboardType="numeric"
                                        onChangeText={handleChange('grandTotal')}
                                    />
                                </HStack>
                            </FormControl>
                            <Divider />
                            <FormControl>
                                <TextAreaComponent placeholder="Any other information" />
                            </FormControl>
                            <If condition={!isCampusPastor}>
                                <FormControl>
                                    <ButtonComponent
                                        isLoading={isLoading}
                                        onPress={() => {
                                            setFieldValue('subTotal.male', addSubTotal(values, 'male'));
                                            setFieldValue('subTotal.female', addSubTotal(values, 'female'));
                                            setFieldValue('grandTotal', addGrandTotal(values));
                                            handleSubmit();
                                        }}
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

export default ChildcareReport;
