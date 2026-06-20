import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IChildCareReportPayload } from '@store/types';
import { useCreateChildCareReportMutation } from '@store/services/reports';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import {
    FormSection,
    ReportFormShell,
    SubmitButton,
    TextAreaField,
    TotalChip,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { Input } from '~/components/ui/input';
import { useLocalSearchParams } from 'expo-router';

const BANDS: { key: 'age1_2' | 'age3_5' | 'age6_11' | 'age12_above'; label: string }[] = [
    { key: 'age1_2', label: 'Age 1 – 2' },
    { key: 'age3_5', label: 'Age 3 – 5' },
    { key: 'age6_11', label: 'Age 6 – 11' },
    { key: 'age12_above', label: 'Age 12 & above' },
];

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

    const subTotal = React.useCallback(
        (values: IChildCareReportPayload, field: 'male' | 'female') =>
            +values.age1_2?.[field] + +values.age3_5?.[field] + +values.age6_11?.[field] + +values.age12_above?.[field] ||
            0,
        []
    );

    const grandTotal = React.useCallback(
        (values: IChildCareReportPayload) => subTotal(values, 'male') + subTotal(values, 'female'),
        [subTotal]
    );

    return (
        <Formik<IChildCareReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, values, handleSubmit, setFieldValue }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Children present">
                        {/* header */}
                        <View className="flex-row items-center gap-3">
                            <View className="w-1/3" />
                            <Text className="flex-1 text-center !text-[12px] font-semibold text-muted-foreground">Male</Text>
                            <Text className="flex-1 text-center !text-[12px] font-semibold text-muted-foreground">Female</Text>
                        </View>
                        {BANDS.map(band => (
                            <View key={band.key} className="flex-row gap-3 items-center">
                                <Text className="w-1/3 !text-[13px] text-muted-foreground">{band.label}</Text>
                                <View className="flex-1">
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.[band.key]?.male ?? ''}`}
                                        onChangeText={handleChange(`${band.key}.male`)}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        placeholder="0"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values?.[band.key]?.female ?? ''}`}
                                        onChangeText={handleChange(`${band.key}.female`)}
                                    />
                                </View>
                            </View>
                        ))}
                        <View className="flex-row gap-2 pt-1">
                            <TotalChip label="Male" value={subTotal(values, 'male')} />
                            <TotalChip label="Female" value={subTotal(values, 'female')} />
                            <TotalChip label="Grand total" value={grandTotal(values)} />
                        </View>
                    </FormSection>

                    <FormSection title="Notes">
                        <TextAreaField
                            label="Other information"
                            placeholder="Any other information"
                            isDisabled={isCampusPastor}
                            value={values?.otherInfo ?? ''}
                            onChangeText={handleChange('otherInfo')}
                        />
                    </FormSection>

                    <ReportWorkflowActions
                        reportId={params?._id}
                        reportType={reportType}
                        status={status}
                        awaitingRole={params?.awaitingRole}
                        ghComment={params?.ghComment}
                        pastorComment={params?.pastorComment}
                        gspComment={params?.gspComment}
                    />
                    <If condition={!isCampusPastor && !isGSP}>
                        <SubmitButton
                            label={submitLabelForStatus(status as string)}
                            isLoading={isLoading || isTransitioning}
                            onPress={() => {
                                setFieldValue('subTotal.male', `${subTotal(values, 'male')}`);
                                setFieldValue('subTotal.female', `${subTotal(values, 'female')}`);
                                setFieldValue('grandTotal', `${grandTotal(values)}`);
                                handleSubmit();
                            }}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default ChildcareReport;
