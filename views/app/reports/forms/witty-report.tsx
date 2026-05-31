import { Text } from '~/components/ui/text';
import { TouchableOpacity, View } from 'react-native';
import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { IWittyReportPayload, IReportStatus } from '@store/types';
import { useCreateWittyReportMutation } from '@store/services/reports';
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
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';

const WittyReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IWittyReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateWittyReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        incidentReport: params.incidentReport || '',
        onlineInquiries: params.onlineInquiries || '',
        onlineConvertsCount: params.onlineConvertsCount || '',
        onlineFirstTimersCount: params.onlineFirstTimersCount || '',
        comment: params.comment || '',
        socialMediaPosts: params.socialMediaPosts?.length ? params.socialMediaPosts : [{ platform: '', url: '' }],
    };

    return (
        <Formik<IWittyReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IWittyReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ViewWrapper scroll avoidKeyboard>
                    <View className="pb-4 mt-4 gap-4">
                        <Text className="text-muted-foreground text-center mb-2">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 gap-4">
                            <View>
                                <Label>Online first timers</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.onlineFirstTimersCount ?? ''}`}
                                    onChangeText={handleChange('onlineFirstTimersCount')}
                                />
                            </View>
                            <View>
                                <Label>Online new converts</Label>
                                <Input
                                    placeholder="0"
                                    inputMode="numeric"
                                    keyboardType="numeric"
                                    isDisabled={isCampusPastor}
                                    value={`${values.onlineConvertsCount ?? ''}`}
                                    onChangeText={handleChange('onlineConvertsCount')}
                                />
                            </View>

                            <Separator className="my-1" />

                            <View className="gap-2">
                                <Label>Social media posts</Label>
                                <FieldArray name="socialMediaPosts">
                                    {({ push, remove }) => (
                                        <View className="gap-3">
                                            {values.socialMediaPosts?.map((_post, index) => (
                                                <View key={index} className="gap-2 rounded-xl bg-muted-background p-3">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="!text-xs font-semibold text-muted-foreground">
                                                            Post {index + 1}
                                                        </Text>
                                                        {!isCampusPastor && values.socialMediaPosts.length > 1 && (
                                                            <TouchableOpacity onPress={() => remove(index)}>
                                                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                    <Input
                                                        placeholder="Platform (e.g. Instagram)"
                                                        isDisabled={isCampusPastor}
                                                        value={values.socialMediaPosts[index]?.platform ?? ''}
                                                        onChangeText={handleChange(`socialMediaPosts.${index}.platform`)}
                                                    />
                                                    <Input
                                                        placeholder="Post URL"
                                                        autoCapitalize="none"
                                                        isDisabled={isCampusPastor}
                                                        value={values.socialMediaPosts[index]?.url ?? ''}
                                                        onChangeText={handleChange(`socialMediaPosts.${index}.url`)}
                                                    />
                                                </View>
                                            ))}
                                            <If condition={!isCampusPastor}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onPress={() => push({ platform: '', url: '' })}
                                                    startIcon={<Ionicons name="add" size={16} color="#6d28d9" />}
                                                >
                                                    Add post
                                                </Button>
                                            </If>
                                        </View>
                                    )}
                                </FieldArray>
                            </View>

                            <Separator className="my-1" />

                            <View>
                                <Label>Online inquiries</Label>
                                <Textarea
                                    isDisabled={isCampusPastor}
                                    placeholder="Summary of online inquiries received"
                                    onChangeText={handleChange('onlineInquiries')}
                                    value={values?.onlineInquiries ?? ''}
                                />
                            </View>
                            <View>
                                <Label>Incident report</Label>
                                <Textarea
                                    isDisabled={isCampusPastor}
                                    placeholder="Narrative of any incidents during the service"
                                    onChangeText={handleChange('incidentReport')}
                                    value={values?.incidentReport ?? ''}
                                />
                            </View>
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

export default WittyReport;
