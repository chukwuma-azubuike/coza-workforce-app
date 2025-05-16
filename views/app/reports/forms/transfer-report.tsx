import { Text } from "~/components/ui/text";
import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { ITransferReportPayload } from '@store/types';
import { useCreateTransferReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import { View, Divider, WarningOutlineIcon } from 'native-base';
import ButtonComponent from '@components/atoms/button';
import dayjs from 'dayjs';
import TextAreaComponent from '@components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import { Platform, View } from 'react-native';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';

const TransferReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as ITransferReportPayload;

    const { status, updatedAt } = params;

    const {
        isCampusPastor,
        user: { userId },
    } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading, reset }] = useCreateTransferReportMutation();

    const onSubmit = (values: ITransferReportPayload) => {
        updateReport({ ...values, userId, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: ITransferReportPayload) => {
        updateReport({ ...values, userId, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: ITransferReportPayload) => {
        updateReport({ ...values, userId, status: 'APPROVED' });
    };

    const navigation = useNavigation();

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                defaultRender: true,
                status: 'success',
                message: 'Report updated',
            });
            reset();
            navigation.goBack();
        }
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: error?.data?.message || 'Something went wrong!',
            });
            reset();
        }
    }, [isSuccess, isError]);

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

    const isIOS = Platform.OS === 'ios';

    return (
        <Formik<ITransferReportPayload>
            validateOnChange
            onSubmit={onSubmit}
            enableReinitialize
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, errors, handleSubmit, values, setFieldValue }) => (
                <ViewWrapper scroll avoidKeyboard={isIOS} avoidKeyboardOffset={0}>
                    <View pb={10} mt={4}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>

                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <View>
                                    {values?.locations?.map((location, idx) => (
                                        <View
                                            key={idx}
                                            className="mb-12 items-center"
                                        >
                                            <View  w="36%">
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
                                                <FormErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormErrorMessage>
                                            </View>
                                            <View  w="22%">
                                                <Label>
                                                    <Text className="flex-1">Adults</Text>
                                                </Label>
                                                <Input
                                                    style={{
                                                        fontSize: 14,
                                                    }}
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    isDisabled={isCampusPastor}
                                                    value={`${location.adultCount}`}
                                                    onChangeText={handleChange(`locations[${idx}].adultCount`)}
                                                />
                                                <FormErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormErrorMessage>
                                            </View>
                                            <View  w="22%">
                                                <Label>
                                                    <Text className="flex-1">Children/Teens</Text>
                                                </Label>
                                                <Input
                                                    style={{
                                                        fontSize: 14,
                                                    }}
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    isDisabled={isCampusPastor}
                                                    value={`${location.minorCount}`}
                                                    onChangeText={handleChange(`locations[${idx}].minorCount`)}
                                                />
                                                <FormErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormErrorMessage>
                                            </View>
                                            <View
                                                w="10%"
                                                style={{
                                                    marginTop: 0,
                                                    paddingBottom: 0,
                                                }}
                                            >
                                                <ButtonComponent
                                                    leftIcon={
                                                        <Icon name="minus" type="entypo" color={THEME_CONFIG.primary} />
                                                    }
                                                    style={{
                                                        paddingVertical: 8,
                                                        marginVertical: 0,
                                                        marginTop: 31,
                                                    }}
                                                    onPress={() => arrayHelpers.remove(idx)}
                                                    isDisabled={isCampusPastor}
                                                    secondary
                                                    size="md"
                                                />
                                            </View>
                                        </View>
                                    ))}

                                    <View mb={4}>
                                        <ButtonComponent
                                            leftIcon={<Icon name="plus" type="entypo" color={THEME_CONFIG.primary} />}
                                            onPress={() => {
                                                arrayHelpers.push({
                                                    name: '',
                                                    adultCount: '',
                                                    minorCount: '',
                                                });
                                            }}
                                            style={{ flex: 1 }}
                                            isDisabled={isCampusPastor || isLoading}
                                            secondary
                                            size="md"
                                        >
                                            Add Location
                                        </ButtonComponent>
                                    </View>
                                </View>
                            )}
                        />

                        <View space={4} mb={4}>
                            <View w="48%">
                                <Label>Total Adults</Label>
                                <Input
                                    isDisabled
                                    placeholder="0"
                                    value={`${addValues(values, 'adultCount')}`}
                                />
                            </View>
                            <View w="48%">
                                <Label>Total Children/Teens</Label>
                                <Input
                                    isDisabled
                                    placeholder="0"
                                    value={`${addValues(values, 'minorCount')}`}
                                />
                            </View>
                        </View>

                        <Divider />
                        <View my={4}>
                            <TextAreaComponent
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
                            <View mb={6}>
                                <TextAreaComponent
                                    isDisabled={!isCampusPastor}
                                    placeholder="Pastor's comment"
                                    onChangeText={handleChange('pastorComment')}
                                    value={values?.pastorComment ? values?.pastorComment : ''}
                                />
                            </View>
                            <View space={4} justifyContent="space-between" w="95%">
                                <ButtonComponent
                                    onPress={() => onRequestReview(values)}
                                    isLoading={isLoading}
                                    // width="1/2"
                                    secondary
                                    size="md"
                                >
                                    Request Review
                                </ButtonComponent>
                                <ButtonComponent
                                    onPress={() => onApprove(values)}
                                    isLoading={isLoading}
                                    // width="1/2"
                                    size="md"
                                >
                                    Approve
                                </ButtonComponent>
                            </View>
                        </If>
                    </View>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default TransferReport;
