import { Text } from '~/components/ui/text';
import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import { ISecurityReportPayload, IReportStatus } from '@store/types';
import {
    ICampusReportSummary,
    useCreateSecurityReportMutation,
    useGetCampusReportSummaryQuery,
} from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import dayjs from 'dayjs';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import If from '@components/composite/if-container';
import useRole, { DEPARTMENTS } from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import { View } from 'react-native';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { useLocalSearchParams } from 'expo-router';
import Loading from '~/components/atoms/loading';

const SecurityReport: React.FC = () => {
    const { isCampusPastor, isGSP } = useRole();
    const params = useLocalSearchParams() as unknown as ISecurityReportPayload;

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
        locations: params?.locations?.length ? params?.locations : [{ name: '', carCount: '' }],
    } as ISecurityReportPayload;

    const securityReport = React.useMemo(
        () => typedData?.departmentalReport?.find(report => report.departmentName === DEPARTMENTS.security)?.report,
        [typedData?.departmentalReport]
    ) as any;

    const addValues = React.useCallback((values: ISecurityReportPayload) => {
        return values.locations?.length > 0
            ? (values?.locations?.map(a => a.carCount)?.reduce((a, b) => +a + +b) as unknown as string)
            : '0';
    }, []);

    if (loadingReport) {
        return <Loading cover />;
    }

    return (
        <ViewWrapper scroll avoidKeyboard>
            <Formik<ISecurityReportPayload>
                validateOnChange
                enableReinitialize
                onSubmit={onSubmit}
                initialValues={securityReport || INITIAL_VALUES}
            >
                {({ handleChange, errors, handleSubmit, values, setFieldValue }) => (
                    <View className="px-2 mt-4 gap-4 mb-12">
                        <Text className="w-full text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <View className="gap-4">
                                    {values?.locations?.map((location, idx) => (
                                        <View key={idx} className="gap-4 flex-row items-center">
                                            <View className="flex-1 gap-1">
                                                <Label>Location</Label>
                                                <Input
                                                    value={location.name}
                                                    placeholder="Car park name"
                                                    isDisabled={isCampusPastor}
                                                    onChangeText={handleChange(`locations[${idx}].name`)}
                                                />
                                                {/* {(errors.locations as any)[idx].name && ( */}
                                                {/* <FormErrorMessage>This field cannot be empty</FormErrorMessage> */}
                                                {/* )} */}
                                            </View>
                                            <View className="w-1/3 gap-1">
                                                <Label>Car Counts</Label>
                                                <Input
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    isDisabled={isCampusPastor}
                                                    value={`${location.carCount}`}
                                                    onChangeText={handleChange(`locations[${idx}].carCount`)}
                                                />
                                                {/* {(errors?.locations as any)[idx].carCount && ( */}
                                                {/* <FormErrorMessage>This field cannot be empty</FormErrorMessage> */}
                                                {/* )} */}
                                            </View>
                                            <View className="!w-max">
                                                <Label />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    disabled={isCampusPastor}
                                                    style={{ paddingVertical: 10 }}
                                                    onPress={() => arrayHelpers.remove(idx)}
                                                >
                                                    <Icon name="minus" type="entypo" color="red" />
                                                </Button>
                                            </View>
                                        </View>
                                    ))}

                                    <View className="mb-2">
                                        <Button
                                            onPress={() =>
                                                arrayHelpers.push({
                                                    name: '',
                                                    carCount: '',
                                                })
                                            }
                                            icon={<Icon name="plus" type="entypo" color={THEME_CONFIG.primary} />}
                                            style={{ flex: 1 }}
                                            disabled={isCampusPastor || isLoading}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Add Location
                                        </Button>
                                    </View>
                                </View>
                            )}
                        />

                        <View className="gap-2 mb-2">
                            <View>
                                <Label>Total Car Count</Label>
                                <Input isDisabled placeholder="0" value={`${addValues(values)}`} />
                            </View>
                        </View>

                        <Separator />

                        <View className="my-2">
                            <Textarea
                                isDisabled={isCampusPastor}
                                value={`${values.otherInfo}`}
                                placeholder="Any other information"
                                onChangeText={handleChange('otherInfo')}
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
                                <Button
                                    isLoading={isLoading || isTransitioning}
                                    onPress={() => {
                                        setFieldValue('totalCarCount', addValues(values));
                                        handleSubmit();
                                    }}
                                >
                                    {status === IReportStatus.GH_CHANGE_REQUESTED ? 'Resubmit' : !status ? 'Submit' : 'Update'}
                                </Button>
                            </View>
                        </If>
                    </View>
                )}
            </Formik>
        </ViewWrapper>
    );
};

export default SecurityReport;
