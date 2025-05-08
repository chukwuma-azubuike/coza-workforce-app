import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IChildCareReportPayload } from '@store/types';
import { useCreateChildCareReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import dayjs from 'dayjs';
import TextAreaComponent from '@components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { isIOS } from '@rneui/base';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';

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
                message: (error as any)?.data?.message || 'Something went wrong!',
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
                +values.age12_above?.male || 0
        }`;
    };

    const addSubTotal = (values: IChildCareReportPayload, field: 'male' | 'female') => {
        return `${
            +values.age1_2?.[field] +
                +values.age3_5?.[field] +
                +values.age6_11?.[field] +
                +values.age12_above?.[field] || 0
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
                    <View className="pb-4">
                        <Text className="mb-2 text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-4 flex-1 justify-between">
                            <View className="gap-2 mt-6">
                                <Text className="text-muted-foreground">Age 1 - 2</Text>
                                <Text className="text-muted-foreground">Age 3 - 5</Text>
                                <Text className="text-muted-foreground">Age 6 - 11</Text>
                                <Text className="text-muted-foreground">Age 12 & Above</Text>
                                <Text className="text-muted-foreground">Sub Total</Text>
                            </View>
                            <View className="items-center gap-2">
                                <Label>Male</Label>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age1_2?.male}`}
                                        onChangeText={handleChange('age1_2.male')}
                                    />
                                    {errors?.age1_2?.male && (
                                        <FormErrorMessage>{errors?.age1_2?.male}</FormErrorMessage>
                                    )}
                                </View>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age3_5?.male}`}
                                        onChangeText={handleChange('age3_5.male')}
                                    />
                                    {errors?.age3_5?.male && (
                                        <FormErrorMessage>{errors?.age3_5?.male}</FormErrorMessage>
                                    )}
                                </View>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age6_11?.male}`}
                                        onChangeText={handleChange('age6_11.male')}
                                    />
                                    <FormErrorMessage>{errors?.age6_11?.male}</FormErrorMessage>
                                </View>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age12_above?.male}`}
                                        onChangeText={handleChange('age12_above.male')}
                                    />
                                    <FormErrorMessage>{errors?.age12_above?.male}</FormErrorMessage>
                                </View>
                                <View>
                                    <Input
                                        keyboardType="numeric"
                                        value={addSubTotal(values, 'male')}
                                        onChangeText={handleChange('subTotal.male')}
                                    />
                                    <FormErrorMessage>{errors?.subTotal?.male}</FormErrorMessage>
                                </View>
                            </View>
                            <View className="items-center gap-2">
                                <Label>Female</Label>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age1_2?.female}`}
                                        onChangeText={handleChange('age1_2.female')}
                                    />
                                    <FormErrorMessage>{errors?.age1_2?.female}</FormErrorMessage>
                                </View>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age3_5?.female}`}
                                        onChangeText={handleChange('age3_5.female')}
                                    />
                                    <FormErrorMessage>{errors?.age3_5?.female}</FormErrorMessage>
                                </View>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age6_11?.female}`}
                                        onChangeText={handleChange('age6_11.female')}
                                    />
                                    <FormErrorMessage>{errors?.age6_11?.female}</FormErrorMessage>
                                </View>
                                <View>
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.age12_above?.female}`}
                                        onChangeText={handleChange('age12_above.female')}
                                    />
                                </View>
                                <View>
                                    <Input
                                        keyboardType="numeric"
                                        value={addSubTotal(values, 'female')}
                                        onChangeText={handleChange('subTotal.female')}
                                    />
                                </View>
                            </View>
                        </View>
                        <View className="px-4 gap-2 mt-2">
                            <View>
                                <View className="justify-between items-center gap-6">
                                    <Label>Grand Total</Label>
                                    <Input
                                        isDisabled
                                        style={{ flex: 1 }}
                                        keyboardType="numeric"
                                        value={addGrandTotal(values)}
                                        onChangeText={handleChange('grandTotal')}
                                    />
                                </View>
                            </View>
                            <Separator />
                            <View>
                                <TextAreaComponent
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    value={!!values?.otherInfo ? values?.otherInfo : undefined}
                                />
                            </View>
                            <If condition={!isCampusPastor}>
                                <View>
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
                                </View>
                            </If>
                            <If condition={isCampusPastor}>
                                <View className="mb-2">
                                    <TextAreaComponent
                                        isDisabled={!isCampusPastor}
                                        placeholder="Pastor's comment"
                                        onChangeText={handleChange('pastorComment')}
                                        value={values?.pastorComment ? values?.pastorComment : ''}
                                    />
                                </View>
                                <View className="justify-between gap-4">
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
                                        size="sm"
                                        className="flex-1"
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

export default ChildcareReport;
