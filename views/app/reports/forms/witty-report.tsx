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
import {
    LinkPreviewList,
    LinkPreviewSheet,
    brandFor,
    normalizeUrl,
    openLinkExternally,
} from '@components/composite/link-preview';
import { THEME_CONFIG } from '~/config/appConfig';

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

    const { isCampusPastor, isGSP, isHOD, isAHOD } = useRole();

    // Only the department leads author the post list. Everybody else who lands
    // on this form (campus pastor, group head, GSP, QC, admins) is reviewing it,
    // so they get tappable link cards that hand off to the platform instead of
    // dead text inputs.
    const canEditPosts = isHOD || isAHOD;
    const [previewUrl, setPreviewUrl] = React.useState<{ url: string; platform?: string } | null>(null);

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
                <ReportFormShell
                    updatedAt={updatedAt}
                    status={status as string}
                    reportId={params?._id}
                    reportType={reportType}
                >
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

                    <FormSection
                        title="Social media posts"
                        description={
                            canEditPosts
                                ? undefined
                                : 'Tap a post to open it in its app, or preview it here without leaving.'
                        }
                    >
                        {canEditPosts ? (
                            <FieldArray name="socialMediaPosts">
                                {({ push, remove }) => (
                                    <View className="gap-3">
                                        {values.socialMediaPosts?.map((_post, index) => {
                                            const rawUrl = values.socialMediaPosts[index]?.url ?? '';
                                            const platform = values.socialMediaPosts[index]?.platform ?? '';
                                            const href = normalizeUrl(rawUrl);
                                            const brand = brandFor(href, platform);

                                            return (
                                                <View key={index} className="gap-2 rounded-xl bg-muted-background p-3">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="!text-xs font-semibold text-muted-foreground">
                                                            Post {index + 1}
                                                        </Text>
                                                        {values.socialMediaPosts.length > 1 && (
                                                            <TouchableOpacity onPress={() => remove(index)}>
                                                                <Ionicons
                                                                    name="trash-outline"
                                                                    size={16}
                                                                    color="#ef4444"
                                                                />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                    <Input
                                                        placeholder="Platform (e.g. Instagram)"
                                                        value={platform}
                                                        onChangeText={handleChange(
                                                            `socialMediaPosts.${index}.platform`
                                                        )}
                                                    />
                                                    <Input
                                                        placeholder="Post URL"
                                                        autoCapitalize="none"
                                                        keyboardType="url"
                                                        value={rawUrl}
                                                        onChangeText={handleChange(`socialMediaPosts.${index}.url`)}
                                                    />
                                                    {/* Lets the author confirm the link resolves before submitting. */}
                                                    <If condition={!!href}>
                                                        <View className="flex-row items-center gap-2 pt-0.5">
                                                            <View
                                                                className="h-5 w-5 rounded-md items-center justify-center"
                                                                style={{ backgroundColor: brand.color }}
                                                            >
                                                                <Ionicons
                                                                    name={brand.icon}
                                                                    size={11}
                                                                    color={brand.onColor}
                                                                />
                                                            </View>
                                                            <Text className="!text-[11px] text-muted-foreground flex-1">
                                                                {brand.label} link detected
                                                            </Text>
                                                            <TouchableOpacity
                                                                hitSlop={8}
                                                                className="flex-row items-center gap-1"
                                                                onPress={() =>
                                                                    setPreviewUrl({
                                                                        url: href as string,
                                                                        platform,
                                                                    })
                                                                }
                                                            >
                                                                <Ionicons
                                                                    name="eye-outline"
                                                                    size={13}
                                                                    color={THEME_CONFIG.primaryLight}
                                                                />
                                                                <Text className="!text-[11px] font-semibold text-primary">
                                                                    Preview
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                hitSlop={8}
                                                                className="flex-row items-center gap-1"
                                                                onPress={() => openLinkExternally(href)}
                                                            >
                                                                <Ionicons
                                                                    name="open-outline"
                                                                    size={13}
                                                                    color={THEME_CONFIG.primaryLight}
                                                                />
                                                                <Text className="!text-[11px] font-semibold text-primary">
                                                                    Open
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </If>
                                                </View>
                                            );
                                        })}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onPress={() => push({ platform: '', url: '' })}
                                            startIcon={<Ionicons name="add" size={16} color="#6d28d9" />}
                                        >
                                            Add post
                                        </Button>
                                    </View>
                                )}
                            </FieldArray>
                        ) : (
                            <LinkPreviewList
                                posts={values.socialMediaPosts}
                                emptyLabel="No social media posts were linked in this report."
                            />
                        )}
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
                        awaitingRole={params?.awaitingRole}
                        ghComment={params?.ghComment}
                        pastorComment={params?.pastorComment}
                        gspComment={params?.gspComment}
                    />
                    <If condition={!isCampusPastor && !isGSP}>
                        <SubmitButton
                            label={submitLabelForStatus(status as string)}
                            isLoading={isLoading || isTransitioning}
                            onPress={handleSubmit as () => void}
                        />
                    </If>

                    {/* Editors preview from the field rows; reviewers get their
                        own sheet inside LinkPreviewList. */}
                    <If condition={canEditPosts}>
                        <LinkPreviewSheet
                            visible={!!previewUrl}
                            url={previewUrl?.url}
                            platform={previewUrl?.platform}
                            onClose={() => setPreviewUrl(null)}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default WittyReport;
