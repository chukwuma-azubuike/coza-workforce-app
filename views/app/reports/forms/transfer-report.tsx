import { Text } from '~/components/ui/text';
import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { ITransferReportPayload } from '@store/types';
import { useCreateTransferReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import dayjs from 'dayjs';
import TextAreaComponent from '@components/atoms/text-area';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
// import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';

const TransferReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as ITransferReportPayload;

    const { status, updatedAt } = params;

    const {
        isCampusPastor,
        user: { userId },
    } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading }] = useCreateTransferReportMutation();

    const onSubmit = async (values: ITransferReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'SUBMITTED' });

            onResponse(res);
        } catch (error) {}
    };

    const onRequestReview = async (values: ITransferReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'REVIEW_REQUESTED' });

            onResponse(res);
        } catch (error) {}
    };

    const onApprove = async (values: ITransferReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'APPROVED' });

            onResponse(res);
        } catch (error) {}
    };

    const onResponse = React.useCallback(
        (
            res:
                | {
                      data: void;
                      error?: undefined;
                  }
                | {
                      data?: undefined;
                      error: any;
                  }
        ) => {
            if (res.data) {
                setModalState({
                    defaultRender: true,
                    status: 'success',
                    message: 'Report updated',
                });
                router.back();
            }
            if (res.error) {
                setModalState({
                    defaultRender: true,
                    status: 'error',
                    message: (error as any)?.data?.message || 'Something went wrong!',
                });
            }
        },
        []
    );

    const { setModalState } = useModal();

    const INITIAL_VALUES = {
        ...params,
        imageUrl: params.imageUrl || '',
        otherInfo: params.otherInfo || '',
        locations: params?.locations?.length ? params?.locations : [{ name: '', adultCount: '', minorCount: '' }],
    } as ITransferReportPayload;

    const addValues = React.useCallback((values: ITransferReportPayload, field: 'adultCount' | 'minorCount') => {
        return values?.locations?.length
            ? (values?.locations?.map(a => a[field]).reduce((a, b) => +a + +b) as unknown as string)
            : '0';
    }, []);

    return (
        <ViewWrapper scroll avoidKeyboard>
            <Formik<ITransferReportPayload>
                validateOnChange
                onSubmit={onSubmit}
                enableReinitialize
                initialValues={INITIAL_VALUES}
            >
                {({ handleChange, handleSubmit, values, setFieldValue }) => (
                    <View className="pb-4 mt-4 gap-4">
                        <Text className="text-muted-foreground text-center mb-2">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>

                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <View className="gap-4">
                                    {values?.locations?.map((location, idx) => (
                                        <View key={idx} className="items-center gap-4 flex-row">
                                            <View className="w-1/3 gap-1">
                                                <Label>
                                                    <Text className="flex-1">Location</Text>
                                                </Label>
                                                <Input
                                                    style={{
                                                        padding: 0,
                                                        fontSize: 14,
                                                    }}
                                                    placeholder="Name"
                                                    value={`${location.name}`}
                                                    isDisabled={isCampusPastor}
                                                    onChangeText={handleChange(`locations[${idx}].name`)}
                                                />
                                            </View>
                                            <View className="flex-1 gap-1">
                                                <Label>
                                                    <Text className="flex-1">Adults</Text>
                                                </Label>
                                                <Input
                                                    style={{
                                                        fontSize: 14,
                                                    }}
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    isDisabled={isCampusPastor}
                                                    value={`${location.adultCount}`}
                                                    onChangeText={handleChange(`locations[${idx}].adultCount`)}
                                                />
                                                {/* <FormErrorMessage>This field cannot be empty</FormErrorMessage> */}
                                            </View>
                                            <View className="flex-1 gap-1">
                                                <Text className="line-clamp-1 truncate">Children/Teens</Text>
                                                <Input
                                                    style={{
                                                        fontSize: 14,
                                                    }}
                                                    placeholder="0"
                                                    inputMode="numeric"
                                                    keyboardType="numeric"
                                                    isDisabled={isCampusPastor}
                                                    value={`${location.minorCount}`}
                                                    onChangeText={handleChange(`locations[${idx}].minorCount`)}
                                                />
                                                {/* <FormErrorMessage>This field cannot be empty</FormErrorMessage> */}
                                            </View>
                                            <View
                                                className="!w-max"
                                                style={{
                                                    marginTop: 0,
                                                    paddingBottom: 0,
                                                }}
                                            >
                                                <Button
                                                    style={{
                                                        paddingVertical: 8,
                                                        marginVertical: 0,
                                                        marginTop: 31,
                                                    }}
                                                    className="flex-1"
                                                    onPress={() => arrayHelpers.remove(idx)}
                                                    disabled={isCampusPastor}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Icon name="minus" type="entypo" color="red" />
                                                </Button>
                                            </View>
                                        </View>
                                    ))}

                                    <View>
                                        <Button
                                            icon={<Icon name="plus" type="entypo" color={THEME_CONFIG.primary} />}
                                            onPress={() => {
                                                arrayHelpers.push({
                                                    name: '',
                                                    adultCount: '',
                                                    minorCount: '',
                                                });
                                            }}
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

                        <View className="gap-4 mb-2 flex-row">
                            <View className="flex-1">
                                <Label>Total Adults</Label>
                                <Input isDisabled placeholder="0" value={`${addValues(values, 'adultCount')}`} />
                            </View>
                            <View className="flex-1">
                                <Label>Total Children/Teens</Label>
                                <Input isDisabled placeholder="0" value={`${addValues(values, 'minorCount')}`} />
                            </View>
                        </View>

                        <Separator className="my-2" />

                        <View className="my-2">
                            <Textarea
                                isDisabled={isCampusPastor}
                                value={`${values.otherInfo}`}
                                placeholder="Any other information"
                                onChangeText={handleChange('otherInfo')}
                            />
                        </View>
                        <If condition={!isCampusPastor}>
                            <View>
                                <ButtonComponent
                                    isLoading={isLoading}
                                    onPress={() => {
                                        setFieldValue('total.adults', addValues(values, 'adultCount'));
                                        setFieldValue('total.minors', addValues(values, 'minorCount'));
                                        handleSubmit();
                                    }}
                                >
                                    {`${!status ? 'Submit' : 'Update'}`}
                                </ButtonComponent>
                            </View>
                        </If>
                        <If condition={isCampusPastor}>
                            <View className="mb-4">
                                <TextAreaComponent
                                    isDisabled={!isCampusPastor}
                                    placeholder="Pastor's comment"
                                    onChangeText={handleChange('pastorComment')}
                                    value={values?.pastorComment ? values?.pastorComment : ''}
                                />
                            </View>
                            <View className="gap-2 justify-between flex-row">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    isLoading={isLoading}
                                    onPress={() => onRequestReview(values)}
                                >
                                    Request Review
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    isLoading={isLoading}
                                    onPress={() => onApprove(values)}
                                >
                                    Approve
                                </Button>
                            </View>
                        </If>
                    </View>
                )}
            </Formik>
        </ViewWrapper>
    );
};

export default React.memo(TransferReport);
