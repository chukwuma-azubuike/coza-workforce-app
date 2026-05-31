import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IChildCareReportPayload, IReportStatus } from '@store/types';
import { useCreateChildCareReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import dayjs from 'dayjs';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';
import { useLocalSearchParams } from 'expo-router';
import { Textarea } from '~/components/ui/textarea';

const ChildcareReport: React.FC = () => {
    const stringifiedParams = useLocalSearchParams() as unknown as { data: string };
    const params = !!stringifiedParams?.data
        ? (JSON.parse(stringifiedParams?.data) as IChildCareReportPayload)
        : (stringifiedParams as unknown as IChildCareReportPayload);

    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateChildCareReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        imageUrl: params?.imageUrl || '',
        otherInfo: params?.otherInfo || '',
        age1_2: { male: params?.age1_2?.male || '', female: params?.age1_2?.female || '' },
        age3_5: { male: params?.age3_5?.male || '', female: params?.age3_5?.female || '' },
        age6_11: { male: params?.age6_11?.male || '', female: params?.age6_11?.female || '' },
        age12_above: { male: params?.age12_above?.male || '', female: params?.age12_above?.female || '' },
    } as IChildCareReportPayload;

    const addGrandTotal = React.useCallback((values: IChildCareReportPayload) => {
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
    }, []);

    const addSubTotal = React.useCallback((values: IChildCareReportPayload, field: 'male' | 'female') => {
        return `${
            +values.age1_2?.[field] +
                +values.age3_5?.[field] +
                +values.age6_11?.[field] +
                +values.age12_above?.[field] || 0
        }`;
    }, []);

    return (
        <ViewWrapper scroll avoidKeyboard className="px-2">
            <Formik<IChildCareReportPayload>
                validateOnChange
                enableReinitialize
                onSubmit={onSubmit}
                initialValues={INITIAL_VALUES}
            >
                {({ handleChange, errors, values, handleSubmit, setFieldValue }) => (
                    <View className="pt-4 w-full gap-4 mb-12">
                        <Text className="mb-2 text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="flex-row w-full">
                            <View className="w-1/3" />
                            <View className="flex-1 items-center">
                                <Label>Male</Label>
                            </View>
                            <View className="flex-1 items-center">
                                <Label>Female</Label>
                            </View>
                        </View>
                        <View className="justify-between">
                            <View className="items-center gap-4">
                                <View className="flex-row gap-4 items-center">
                                    <Text className="text-muted-foreground w-1/3">Age 1 - 2</Text>
                                    <View className="flex-1">
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
                                    <View className="flex-1">
                                        <Input
                                            placeholder="0"
                                            keyboardType="numeric"
                                            isDisabled={isCampusPastor}
                                            value={`${values?.age1_2?.female}`}
                                            onChangeText={handleChange('age1_2.female')}
                                        />
                                        {errors?.age1_2?.female && (
                                            <FormErrorMessage>{errors?.age1_2?.female}</FormErrorMessage>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4 items-center">
                                    <Text className="text-muted-foreground w-1/3">Age 3 - 5</Text>
                                    <View className="flex-1">
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
                                    <View className="flex-1">
                                        <Input
                                            placeholder="0"
                                            keyboardType="numeric"
                                            isDisabled={isCampusPastor}
                                            value={`${values?.age3_5?.female}`}
                                            onChangeText={handleChange('age3_5.female')}
                                        />
                                        {errors?.age3_5?.female && (
                                            <FormErrorMessage>{errors?.age3_5?.female}</FormErrorMessage>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4 items-center">
                                    <Text className="text-muted-foreground w-1/3">Age 6 - 11</Text>
                                    <View className="flex-1">
                                        <Input
                                            placeholder="0"
                                            keyboardType="numeric"
                                            isDisabled={isCampusPastor}
                                            value={`${values?.age6_11?.male}`}
                                            onChangeText={handleChange('age6_11.male')}
                                        />
                                        {errors?.age6_11?.male && (
                                            <FormErrorMessage>{errors?.age6_11?.male}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            placeholder="0"
                                            keyboardType="numeric"
                                            isDisabled={isCampusPastor}
                                            value={`${values?.age6_11?.female}`}
                                            onChangeText={handleChange('age6_11.female')}
                                        />
                                        {errors?.age6_11?.female && (
                                            <FormErrorMessage>{errors?.age6_11?.female}</FormErrorMessage>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4 items-center">
                                    <Text className="text-muted-foreground w-1/3">Age 12 & Above</Text>
                                    <View className="flex-1">
                                        <Input
                                            placeholder="0"
                                            keyboardType="numeric"
                                            isDisabled={isCampusPastor}
                                            value={`${values?.age12_above?.male}`}
                                            onChangeText={handleChange('age12_above.male')}
                                        />
                                        {errors?.age12_above?.male && (
                                            <FormErrorMessage>{errors?.age12_above?.male}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            placeholder="0"
                                            keyboardType="numeric"
                                            isDisabled={isCampusPastor}
                                            value={`${values?.age12_above?.female}`}
                                            onChangeText={handleChange('age12_above.female')}
                                        />
                                        {errors?.age12_above?.female && (
                                            <FormErrorMessage>{errors?.age12_above?.female}</FormErrorMessage>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4 items-center">
                                    <Text className="text-muted-foreground w-1/3">Sub Total</Text>
                                    <View className="flex-1">
                                        <Input
                                            isDisabled
                                            keyboardType="numeric"
                                            value={addSubTotal(values, 'male')}
                                            onChangeText={handleChange('subTotal.male')}
                                        />
                                        {errors?.subTotal?.male && (
                                            <FormErrorMessage>{errors?.subTotal?.male}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            isDisabled
                                            keyboardType="numeric"
                                            value={addSubTotal(values, 'female')}
                                            onChangeText={handleChange('subTotal.female')}
                                        />
                                        {errors?.subTotal?.male && (
                                            <FormErrorMessage>{errors?.subTotal?.male}</FormErrorMessage>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4 items-center">
                                    <Text className="text-muted-foreground w-1/3">Grand Total</Text>
                                    <View className="flex-1">
                                        <Input
                                            isDisabled
                                            style={{ flex: 1 }}
                                            keyboardType="numeric"
                                            value={addGrandTotal(values)}
                                            onChangeText={handleChange('grandTotal')}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <Separator className="my-2" />
                        <View className="gap-4">
                            <Textarea
                                isDisabled={isCampusPastor}
                                placeholder="Any other information"
                                value={!!values?.otherInfo ? values?.otherInfo : undefined}
                            />
                            <ReportWorkflowActions
                                reportId={params?._id}
                                reportType={reportType}
                                status={status}
                                ghComment={(params as any)?.ghComment}
                                pastorComment={(params as any)?.pastorComment}
                                gspComment={(params as any)?.gspComment}
                            />
                            <If condition={!isCampusPastor && !isGSP}>
                                <Button
                                    isLoading={isLoading || isTransitioning}
                                    onPress={() => {
                                        setFieldValue('subTotal.male', addSubTotal(values, 'male'));
                                        setFieldValue('subTotal.female', addSubTotal(values, 'female'));
                                        setFieldValue('grandTotal', addGrandTotal(values));
                                        handleSubmit();
                                    }}
                                >
                                    {status === IReportStatus.GH_CHANGE_REQUESTED ? 'Resubmit' : !status ? 'Submit' : 'Update'}
                                </Button>
                            </If>
                        </View>
                    </View>
                )}
            </Formik>
        </ViewWrapper>
    );
};

export default ChildcareReport;
