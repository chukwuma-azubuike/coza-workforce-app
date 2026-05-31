import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IGuestReportPayload, IReportStatus } from '@store/types';
import { useCreateGuestReportMutation } from '@store/services/reports';
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
// import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';

const GuestReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IGuestReportPayload;

    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateGuestReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        firstTimersCount: params.firstTimersCount || '',
        newConvertsCount: params.newConvertsCount || '',
    };

    return (
        <Formik<IGuestReportPayload>
            validateOnChange
            onSubmit={onSubmit}
            enableReinitialize
            initialValues={INITIAL_VALUES as unknown as IGuestReportPayload}
        >
            {({ handleChange, errors, handleSubmit, values }) => (
                <ViewWrapper scroll>
                    <View className="pb-4 mt-4 gap-4">
                        <Text className="text-muted-foreground text-center mb-2">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-4">
                            <View>
                                <Label>Number of First Timers</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.firstTimersCount}`}
                                    onChangeText={handleChange('firstTimersCount')}
                                />
                                {/* <FormErrorMessage>This field cannot be empty</FormErrorMessage> */}
                            </View>
                            <View>
                                <Label>Number of New Converts</Label>
                                <Input
                                    placeholder="0"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.newConvertsCount}`}
                                    onChangeText={handleChange('newConvertsCount')}
                                />
                                {/* <FormErrorMessage>This field cannot be empty</FormErrorMessage> */}
                            </View>
                            <Separator className="my-2" />
                            <View>
                                <Textarea
                                    isDisabled={isCampusPastor}
                                    placeholder="Any other information"
                                    onChangeText={handleChange('otherInfo')}
                                    value={!!values?.otherInfo ? values?.otherInfo : undefined}
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

export default GuestReport;
