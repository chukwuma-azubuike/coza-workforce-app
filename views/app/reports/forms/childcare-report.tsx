import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IChildCareReportPayload } from '@store/types';
import { useCreateChildCareReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import { FormControl, HStack, VStack, Text, Divider } from 'native-base';
import { InputComponent } from '@components/atoms/input';
import ButtonComponent from '@components/atoms/button';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import moment from 'moment';
import TextAreaComponent from '@components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { isIOS } from '@rneui/base';

const ChildcareReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IChildCareReportPayload;

    const { status, updatedAt } = params;

    const {
        isCampusPastor,
        user: { userId },
    } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading, reset }] = useCreateChildCareReportMutation();

    const onSubmit = (values: IChildCareReportPayload) => {
        updateReport({ ...values, userId, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: IChildCareReportPayload) => {
        updateReport({ ...values, userId, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: IChildCareReportPayload) => {
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
        imageUrl: params?.imageUrl || '',
        otherInfo: params?.otherInfo || '',
        age1_2: { male: params?.age1_2?.male || '', female: params?.age1_2?.female || '' },
        age3_5: { male: params?.age3_5?.male || '', female: params?.age3_5?.female || '' },
        age6_11: { male: params?.age6_11?.male || '', female: params?.age6_11?.female || '' },
        age12_above: { male: params?.age12_above?.male || '', female: params?.age12_above?.female || '' },
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
                <ViewWrapper scroll avoidKeyboard={isIOS}>
                    <VStack pb={10}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {moment(updatedAt || undefined).format('Do MMMM, YYYY')}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age1_2?.male}`}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age3_5?.male}`}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age6_11?.male}`}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age12_above?.male}`}
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
                                        keyboardType="numeric"
                                        value={addSubTotal(values, 'male')}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age1_2?.female}`}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age3_5?.female}`}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age6_11?.female}`}
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
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age12_above?.female}`}
                                        onChangeText={handleChange('age12_above.female')}
                                    />
                                </FormControl>
                                <FormControl isDisabled>
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        value={addSubTotal(values, 'female')}
                                        onChangeText={handleChange('subTotal.female')}
                                    />
                                </FormControl>
                            </VStack>
                        </HStack>
                        <VStack space={4} mt={4} px={4}>
                            <FormControl>
                                <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }} space={12}>
                                    <FormControl.Label>Grand Total</FormControl.Label>
                                    <InputComponent
                                        isDisabled
                                        style={{ flex: 1 }}
                                        keyboardType="numeric"
                                        value={addGrandTotal(values)}
                                        onChangeText={handleChange('grandTotal')}
                                    />
                                </HStack>
                            </FormControl>
                            <Divider />
                            <FormControl>
                                <TextAreaComponent
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    value={!!values?.otherInfo ? values?.otherInfo : undefined}
                                />
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

export default ChildcareReport;
