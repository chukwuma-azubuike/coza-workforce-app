import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FieldArray, Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { ISecurityReportPayload } from '@store/types';
import {
    ICampusReportSummary,
    useCreateSecurityReportMutation,
    useGetCampusReportSummaryQuery,
} from '@store/services/reports';
import If from '@components/composite/if-container';
import useRole, { DEPARTMENTS } from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import {
    FormSection,
    ReportFormShell,
    SubmitButton,
    TextAreaField,
    TotalChip,
    coerceArray,
    readReportParams,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useLocalSearchParams } from 'expo-router';
import Loading from '~/components/atoms/loading';

const SecurityReport: React.FC = () => {
    const { isCampusPastor, isGSP } = useRole();
    const params = readReportParams<ISecurityReportPayload>(useLocalSearchParams() as any);

    const { data, isLoading: loadingReport } = useGetCampusReportSummaryQuery({
        serviceId: params?.serviceId as string,
        campusId: params?.campusId as string,
    });

    const typedData = data as ICampusReportSummary<ISecurityReportPayload> | undefined;

    const { status, updatedAt } = params;

    const [updateReport, { isLoading }] = useCreateSecurityReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        imageUrl: params?.imageUrl || '',
        otherInfo: params?.otherInfo || '',
        locations: coerceArray(params?.locations, [{ name: '', carCount: '' }]),
    } as unknown as ISecurityReportPayload;

    const securityReport = React.useMemo(
        () => typedData?.departmentalReport?.find(report => report.departmentName === DEPARTMENTS.security)?.report,
        [typedData?.departmentalReport]
    ) as any;

    const total = React.useCallback(
        (values: ISecurityReportPayload) =>
            values.locations?.reduce((sum, l) => sum + (+l.carCount || 0), 0) ?? 0,
        []
    );

    if (loadingReport) {
        return <Loading cover />;
    }

    return (
        <Formik<ISecurityReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={securityReport || INITIAL_VALUES}
        >
            {({ handleChange, handleSubmit, values, setFieldValue }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Car parks">
                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <View className="gap-3">
                                    {values?.locations?.map((location, idx) => (
                                        <View key={idx} className="gap-2 rounded-xl bg-muted-background p-3">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="!text-xs font-semibold text-muted-foreground">
                                                    Car park {idx + 1}
                                                </Text>
                                                {!isCampusPastor && values.locations.length > 1 && (
                                                    <TouchableOpacity onPress={() => arrayHelpers.remove(idx)}>
                                                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <View className="flex-row gap-2">
                                                <View className="flex-1">
                                                    <Input
                                                        value={location.name}
                                                        placeholder="Car park name"
                                                        isDisabled={isCampusPastor}
                                                        onChangeText={handleChange(`locations[${idx}].name`)}
                                                    />
                                                </View>
                                                <View className="w-28">
                                                    <Input
                                                        placeholder="Cars"
                                                        keyboardType="numeric"
                                                        isDisabled={isCampusPastor}
                                                        value={`${location.carCount ?? ''}`}
                                                        onChangeText={handleChange(`locations[${idx}].carCount`)}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                    <If condition={!isCampusPastor}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isLoading}
                                            onPress={() => arrayHelpers.push({ name: '', carCount: '' })}
                                            startIcon={<Ionicons name="add" size={16} color="#6d28d9" />}
                                        >
                                            Add car park
                                        </Button>
                                    </If>
                                    <View className="flex-row pt-1">
                                        <TotalChip label="Total cars" value={total(values)} />
                                    </View>
                                </View>
                            )}
                        />
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
                        ghComment={(params as any)?.ghComment}
                        pastorComment={(params as any)?.pastorComment}
                        gspComment={(params as any)?.gspComment}
                    />
                    <If condition={!isCampusPastor && !isGSP}>
                        <SubmitButton
                            label={submitLabelForStatus(status as string)}
                            isLoading={isLoading || isTransitioning}
                            onPress={() => {
                                setFieldValue('totalCarCount', `${total(values)}`);
                                handleSubmit();
                            }}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default SecurityReport;
