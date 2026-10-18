import { View } from 'react-native';
import { Formik, FormikConfig } from 'formik';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { ICongressInstantMessage } from '@store/types';
import { CreateCongressInstantMessageSchema } from '@utils/schemas';
import { useCreateCongressInstantMessagesMutation } from '@store/services/congress';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { classifyLinkSync, hostOf, LINK_KIND_LABELS, normalizeUrl } from '~/components/composite/link-preview';

/**
 * Tells the author what the link they typed will actually open as, before they
 * post it. The kind is resolved from the URL alone — no network call while
 * typing; anything the URL can't settle is opened as a web page.
 */
const LinkKindHint: React.FC<{ url?: string }> = ({ url }) => {
    const href = normalizeUrl(url);
    if (!href) return null;

    const kind = classifyLinkSync(href) ?? 'web';

    return (
        <View className="flex-row items-center gap-1.5 mt-1.5">
            <Ionicons name="checkmark-circle" size={13} color={THEME_CONFIG.success} />
            <Text className="!text-[12px] text-muted-foreground">
                Opens as {LINK_KIND_LABELS[kind].toLowerCase()} · {hostOf(href)}
            </Text>
        </View>
    );
};

const CreateCongressInstantMessage: React.FC = () => {
    const params = useLocalSearchParams() as unknown as { CongressId: string };
    const CongressId = params?.CongressId;
    const { setModalState } = useModal();

    const [createCongressInstantMessage, { isLoading, error, data, reset }] =
        useCreateCongressInstantMessagesMutation();

    const onSubmit: FormikConfig<ICongressInstantMessage>['onSubmit'] = async (values, { resetForm }) => {
        const result = await createCongressInstantMessage({ ...values, cgwcId: CongressId });

        if ('data' in result) {
            setModalState({
                message: 'Message successfully created',
                status: 'success',
            });
            reset();
            resetForm({ values: INITIAL_VALUES });
            router.push({ pathname: '/congress/congress-details', params: data as any });
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICongressInstantMessage = {
        CongressId,
        title: '',
        message: '',
        messageLink: '',
        status: 'PENDING',
    } as ICongressInstantMessage;

    return (
        <ViewWrapper scroll noPadding className="flex-1 pt-4">
            <View className="items-center w-full gap-6 px-4">
                <View className="items-center w-full">
                    <Formik<ICongressInstantMessage>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCongressInstantMessageSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched }) => (
                            <View className="w-full gap-4">
                                <View>
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="Title"
                                        value={values.title}
                                        onChangeText={handleChange('title')}
                                    />
                                    {!!errors?.title && touched.title && (
                                        <FormErrorMessage>{errors?.title}</FormErrorMessage>
                                    )}
                                </View>

                                <View>
                                    <Label>Message</Label>
                                    <Textarea
                                        value={values.message}
                                        placeholder="Message"
                                        onChangeText={handleChange('message')}
                                    />
                                    {!!errors?.message && touched.message && (
                                        <FormErrorMessage>{errors?.message}</FormErrorMessage>
                                    )}
                                </View>

                                <View>
                                    <Label>Link (optional)</Label>
                                    <Input
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="url"
                                        value={values.messageLink}
                                        placeholder="https://coza.org.ng/resource"
                                        onChangeText={handleChange('messageLink')}
                                    />
                                    {!!errors?.messageLink && touched.messageLink ? (
                                        <FormErrorMessage>{errors?.messageLink}</FormErrorMessage>
                                    ) : (
                                        <LinkKindHint url={values.messageLink} />
                                    )}
                                </View>

                                <View>
                                    <Button isLoading={isLoading} onPress={handleSubmit as (event: any) => void}>
                                        Post Instant Message
                                    </Button>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCongressInstantMessage);
