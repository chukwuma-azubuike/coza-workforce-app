import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FieldArray, Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { IWittyReportPayload } from '@store/types';
import { useCreateWittyReportMutation } from '@store/services/reports';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import {
    FormSection,
    NumberField,
    ReportFormShell,
    SubmitButton,
    TextAreaField,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useLocalSearchParams } from 'expo-router';

// socialMediaPosts is a nested array, which doesn't survive expo-router param
// serialization — so it may arrive as a JSON string, a mangled value, or absent.
const coercePosts = (value: any): { platform: string; url: string }[] => {
    let posts = value;
    if (typeof posts === 'string') {
        try {
            posts = JSON.parse(posts);
        } catch {
            posts = undefined;
        }
    }
    return Array.isArray(posts) && posts.length ? posts : [{ platform: '', url: '' }];
};

const WittyReport: React.FC = () => {
    const stringifiedParams = useLocalSearchParams() as unknown as { data?: string };
    const params = stringifiedParams?.data
        ? (JSON.parse(stringifiedParams.data) as IWittyReportPayload)
        : (stringifiedParams as unknown as IWittyReportPayload);
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
        socialMediaPosts: coercePosts(params.socialMediaPosts),
    };

    return (
        <Formik<IWittyReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IWittyReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Online reach">
                        <NumberField
                            label="Online first timers"
                            isDisabled={isCampusPastor}
                            value={values.onlineFirstTimersCount as any}
                            onChangeText={handleChange('onlineFirstTimersCount')}
                        />
                        <NumberField
                            label="Online new converts"
                            isDisabled={isCampusPastor}
                            value={values.onlineConvertsCount as any}
                            onChangeText={handleChange('onlineConvertsCount')}
                        />
                    </FormSection>

                    <FormSection title="Social media posts">
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
                    </FormSection>

                    <FormSection title="Narrative">
                        <TextAreaField
                            label="Online inquiries"
                            placeholder="Summary of online inquiries received"
                            isDisabled={isCampusPastor}
                            value={values?.onlineInquiries ?? ''}
                            onChangeText={handleChange('onlineInquiries')}
                        />
                        <TextAreaField
                            label="Incident report"
                            placeholder="Narrative of any incidents during the service"
                            isDisabled={isCampusPastor}
                            value={values?.incidentReport ?? ''}
                            onChangeText={handleChange('incidentReport')}
                        />
                        <TextAreaField
                            label="Comment"
                            placeholder="Any other information"
                            isDisabled={isCampusPastor}
                            value={values?.comment ?? ''}
                            onChangeText={handleChange('comment')}
                        />
                    </FormSection>

                    <ReportWorkflowActions
                        reportId={params?._id}
                        reportType={reportType}
                        status={status}
                        awaitingRole={(params as any)?.awaitingRole}
                        ghComment={(params as any)?.ghComment}
                        pastorComment={(params as any)?.pastorComment}
                        gspComment={(params as any)?.gspComment}
                    />
                    <If condition={!isCampusPastor && !isGSP}>
                        <SubmitButton
                            label={submitLabelForStatus(status as string)}
                            isLoading={isLoading || isTransitioning}
                            onPress={handleSubmit as () => void}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default WittyReport;
