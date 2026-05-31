import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IPruReportPayload, IReportStatus } from '@store/types';
import { useCreatePruReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import dayjs from 'dayjs';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import { useLocalSearchParams } from 'expo-router';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';

const NUMERIC_FIELDS: { key: keyof IPruReportPayload; label: string }[] = [
    { key: 'enquiryCount', label: 'Enquiries handled' },
    { key: 'vehicleDedicationCount', label: 'Vehicle dedications' },
    { key: 'missingItemsCount', label: 'Missing items reported' },
    { key: 'praiseReportDeskCount', label: 'Praise reports received' },
];

const PruReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IPruReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreatePruReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        enquiryCount: params.enquiryCount || '',
        vehicleDedicationCount: params.vehicleDedicationCount || '',
        missingItemsCount: params.missingItemsCount || '',
        praiseReportDeskCount: params.praiseReportDeskCount || '',
        comment: params.comment || '',
    };

    return (
        <Formik<IPruReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IPruReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ViewWrapper scroll avoidKeyboard>
                    <View className="pb-4 mt-4 gap-4">
                        <Text className="text-muted-foreground text-center mb-2">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-4">
                            {NUMERIC_FIELDS.map(field => (
                                <View key={field.key as string}>
                                    <Label>{field.label}</Label>
                                    <Input
                                        placeholder="0"
                                        inputMode="numeric"
                                        keyboardType="numeric"
                                        isDisabled={isCampusPastor}
                                        value={`${values[field.key] ?? ''}`}
                                        onChangeText={handleChange(field.key as string)}
                                    />
                                </View>
                            ))}
                            <Separator className="my-2" />
                            <View>
                                <Label>Comment</Label>
                                <Textarea
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    onChangeText={handleChange('comment')}
                                    value={values?.comment ?? ''}
                                />
                            </View>
                            <ReportWorkflowActions
                                reportId={params?._id}
                                reportType={reportType}
                                status={status}
                                ghComment={(params as any)?.ghComment}
                                pastorComment={(params as any)?.pastorComment}
                                gspComment={(params as any)?.gspComment}
                            />
                            <If condition={!isCampusPastor && !isGSP}>
                                <View>
                                    <ButtonComponent
                                        isLoading={isLoading || isTransitioning}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        {status === IReportStatus.GH_CHANGE_REQUESTED ? 'Resubmit' : !status ? 'Submit' : 'Update'}
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

export default PruReport;
