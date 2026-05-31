import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IProtocolReportPayload, IReportStatus } from '@store/types';
import { useCreateProtocolReportMutation } from '@store/services/reports';
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

const ProtocolReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IProtocolReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateProtocolReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        incidentCount: params.incidentCount || '',
        theft: params.theft || '',
        specialGuestCount: params.specialGuestCount || '',
        comment: params.comment || '',
    };

    return (
        <Formik<IProtocolReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IProtocolReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ViewWrapper scroll avoidKeyboard>
                    <View className="pb-4 mt-4 gap-4">
                        <Text className="text-muted-foreground text-center mb-2">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-4">
                            <View>
                                <Label>Incidents recorded</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.incidentCount ?? ''}`}
                                    onChangeText={handleChange('incidentCount')}
                                />
                            </View>
                            <View>
                                <Label>Special guests received</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.specialGuestCount ?? ''}`}
                                    onChangeText={handleChange('specialGuestCount')}
                                />
                            </View>
                            <View>
                                <Label>Theft incidents</Label>
                                <Textarea
                                    isDisabled={isCampusPastor}
                                    placeholder="Narrative of any theft incidents"
                                    onChangeText={handleChange('theft')}
                                    value={values?.theft ?? ''}
                                />
                            </View>
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

export default ProtocolReport;
