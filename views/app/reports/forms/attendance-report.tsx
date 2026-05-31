import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IAttendanceReportPayload, IReportStatus } from '@store/types';
import { useCreateAttendanceReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import dayjs from 'dayjs';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import If from '@components/composite/if-container';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';
import { useLocalSearchParams } from 'expo-router';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';

const AttendanceReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IAttendanceReportPayload;

    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateAttendanceReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        femaleGuestCount: params.femaleGuestCount || '',
        maleGuestCount: params.maleGuestCount || '',
        otherInfo: params.otherInfo || '',
        imageUrl: params.imageUrl || '',
        infants: params.infants || '',
        total: params.total || '',
    };

    const addValues = React.useCallback((values: IAttendanceReportPayload) => {
        return `${+values.femaleGuestCount + +values.maleGuestCount + +values.infants}`;
    }, []);

    return (
        <ViewWrapper scroll avoidKeyboard>
            <Formik<IAttendanceReportPayload>
                validateOnChange
                enableReinitialize
                onSubmit={onSubmit}
                initialValues={INITIAL_VALUES as unknown as IAttendanceReportPayload}
            >
                {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <View className="pt-4 gap-4 flex-1">
                        <Text className="text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-4 mt-2">
                            <View className="gap-1">
                                <Label>Number of Male Guests</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.maleGuestCount}`}
                                    onChangeText={handleChange('maleGuestCount')}
                                />
                                {errors.maleGuestCount && touched.maleGuestCount && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-1">
                                <Label>Number of Female Guests</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.femaleGuestCount}`}
                                    onChangeText={handleChange('femaleGuestCount')}
                                />
                                {errors.femaleGuestCount && touched.femaleGuestCount && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-1">
                                <Label>Number of Infant Guests</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.infants}`}
                                    onChangeText={handleChange('infants')}
                                />
                                {errors.infants && touched.infants && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-1">
                                <Label>Total</Label>
                                <Input
                                    isDisabled
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    value={addValues(values)}
                                    onChangeText={handleChange('total')}
                                />
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
                                <View className="mt-1">
                                    <Button
                                        isLoading={isLoading || isTransitioning}
                                        onPress={() => {
                                            setFieldValue('total', addValues(values));
                                            handleSubmit();
                                        }}
                                    >
                                        {status === IReportStatus.GH_CHANGE_REQUESTED ? 'Resubmit' : !status ? 'Submit' : 'Update'}
                                    </Button>
                                </View>
                            </If>
                        </View>
                    </View>
                )}
            </Formik>
        </ViewWrapper>
    );
};

export default AttendanceReport;
