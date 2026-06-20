import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FieldArray, Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { ITransferReportPayload } from '@store/types';
import {
    ICampusReportSummary,
    useCreateTransferReportMutation,
    useGetCampusReportSummaryQuery,
} from '@store/services/reports';
import useRole, { DEPARTMENTS } from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import If from '@components/composite/if-container';
import {
    Field,
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

const TransferReport: React.FC = () => {
    const params = readReportParams<ITransferReportPayload>(useLocalSearchParams() as any);
    const { status, updatedAt } = params;

    const { data, isLoading: loadingReport } = useGetCampusReportSummaryQuery({
        serviceId: params?.serviceId as string,
        campusId: params?.campusId as string,
    });

    const typedData = data as ICampusReportSummary<ITransferReportPayload> | undefined;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateTransferReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        imageUrl: params.imageUrl || '',
        otherInfo: params.otherInfo || '',
        locations: coerceArray(params?.locations, [{ name: '', adultCount: '', minorCount: '' }]),
    } as unknown as ITransferReportPayload;

    const sum = React.useCallback(
        (values: ITransferReportPayload, field: 'adultCount' | 'minorCount') =>
            values?.locations?.reduce((s, l) => s + (+l[field] || 0), 0) ?? 0,
        []
    );

    const transferReport = React.useMemo(
        () => typedData?.departmentalReport?.find(report => report.departmentName === DEPARTMENTS.CTS)?.report,
        [typedData?.departmentalReport]
    ) as any;

    if (loadingReport) {
        return <Loading cover />;
    }

    return (
        <Formik<ITransferReportPayload>
            validateOnChange
            onSubmit={onSubmit}
            enableReinitialize
            initialValues={transferReport || INITIAL_VALUES}
        >
            {({ handleChange, handleSubmit, values, setFieldValue }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Pick-up locations">
                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <View className="gap-3">
                                    {values?.locations?.map((location, idx) => (
                                        <View key={idx} className="gap-2 rounded-xl bg-muted-background p-3">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="!text-xs font-semibold text-muted-foreground">
                                                    Location {idx + 1}
                                                </Text>
                                                {!isCampusPastor && values.locations.length > 1 && (
                                                    <TouchableOpacity onPress={() => arrayHelpers.remove(idx)}>
                                                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <Input
                                                placeholder="Location name"
                                                value={`${location.name ?? ''}`}
                                                isDisabled={isCampusPastor}
                                                onChangeText={handleChange(`locations[${idx}].name`)}
                                            />
                                            <View className="flex-row gap-2">
                                                <View className="flex-1">
                                                    <Field label="Adults">
                                                        <Input
                                                            placeholder="0"
                                                            keyboardType="numeric"
                                                            isDisabled={isCampusPastor}
                                                            value={`${location.adultCount ?? ''}`}
                                                            onChangeText={handleChange(`locations[${idx}].adultCount`)}
                                                        />
                                                    </Field>
                                                </View>
                                                <View className="flex-1">
                                                    <Field label="Children / teens">
                                                        <Input
                                                            placeholder="0"
                                                            keyboardType="numeric"
                                                            isDisabled={isCampusPastor}
                                                            value={`${location.minorCount ?? ''}`}
                                                            onChangeText={handleChange(`locations[${idx}].minorCount`)}
                                                        />
                                                    </Field>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                    <If condition={!isCampusPastor}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isLoading}
                                            onPress={() => arrayHelpers.push({ name: '', adultCount: '', minorCount: '' })}
                                            startIcon={<Ionicons name="add" size={16} color="#6d28d9" />}
                                        >
                                            Add location
                                        </Button>
                                    </If>
                                    <View className="flex-row gap-2 pt-1">
                                        <TotalChip label="Adults" value={sum(values, 'adultCount')} />
                                        <TotalChip label="Children / teens" value={sum(values, 'minorCount')} />
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
                                setFieldValue('total.adults', `${sum(values, 'adultCount')}`);
                                setFieldValue('total.minors', `${sum(values, 'minorCount')}`);
                                handleSubmit();
                            }}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default React.memo(TransferReport);
