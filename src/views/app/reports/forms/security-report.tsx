import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { ISecurityReportPayload } from '../../../../store/types';
import { useCreateSecurityReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { FormControl, VStack, HStack, Text, Divider, WarningOutlineIcon } from 'native-base';
import ButtonComponent from '../../../../components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { InputComponent } from '../../../../components/atoms/input';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '../../../../components/composite/if-container';
import useRole from '../../../../hooks/role';
import { Platform } from 'react-native';

const SecurityReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as ISecurityReportPayload;

    const { status, updatedAt } = params;

    const { isCampusPastor } = useRole();

    const [updateReport, { error, isError, isSuccess, isLoading, reset }] = useCreateSecurityReportMutation();

    const onSubmit = (values: ISecurityReportPayload) => {
        updateReport({ ...values, status: 'SUBMITTED' });
    };

    const onRequestReview = (values: ISecurityReportPayload) => {
        updateReport({ ...values, status: 'REVIEW_REQUESTED' });
    };

    const onApprove = (values: ISecurityReportPayload) => {
        updateReport({ ...values, status: 'APPROVED' });
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
        imageUrl: params?.imageUrl || '',
        otherInfo: params?.otherInfo || '',
        locations: params?.locations?.length ? params?.locations : [{ name: '', carCount: '' }],
    } as ISecurityReportPayload;

    const addValues = (values: ISecurityReportPayload) => {
        return values.locations.length
            ? (values.locations.map(a => a.carCount).reduce((a, b) => +a + +b) as unknown as string)
            : '0';
    };

    const isIOS = Platform.OS === 'ios';

    return (
        <Formik<ISecurityReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, errors, handleSubmit, values, setFieldValue }) => (
                <ViewWrapper scroll>
                    <VStack pb={10} mt={4} px={4}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {moment(updatedAt || undefined).format('Do MMMM, YYYY')}
                        </Text>
                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <VStack>
                                    {values.locations.map((location, idx) => (
                                        <HStack mb={4} key={idx} space={2} alignItems="flex-end">
                                            <FormControl isRequired w="41%">
                                                <FormControl.Label>Location</FormControl.Label>
                                                <InputComponent
                                                    value={location.name}
                                                    placeholder="Car park name"
                                                    isDisabled={isCampusPastor}
                                                    onChangeText={handleChange(`locations[${idx}].name`)}
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl isRequired w="41%">
                                                <FormControl.Label>Car Counts</FormControl.Label>
                                                <InputComponent
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    isDisabled={isCampusPastor}
                                                    value={`${location.carCount}`}
                                                    onChangeText={handleChange(`locations[${idx}].carCount`)}
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl w="14%">
                                                <ButtonComponent
                                                    h={isIOS ? '46px' : '54px'}
                                                    leftIcon={
                                                        <Icon name="minus" type="entypo" color={THEME_CONFIG.primary} />
                                                    }
                                                    onPress={() => arrayHelpers.remove(idx)}
                                                    isDisabled={isCampusPastor}
                                                    secondary
                                                    size={12}
                                                />
                                            </FormControl>
                                        </HStack>
                                    ))}

                                    <HStack mb={4}>
                                        <ButtonComponent
                                            leftIcon={<Icon name="plus" type="entypo" color={THEME_CONFIG.primary} />}
                                            onPress={() =>
                                                arrayHelpers.push({
                                                    name: '',
                                                    carCount: '',
                                                })
                                            }
                                            isDisabled={isCampusPastor || isLoading}
                                            width="100%"
                                            secondary
                                            size={10}
                                        >
                                            Add Location
                                        </ButtonComponent>
                                    </HStack>
                                </VStack>
                            )}
                        />

                        <HStack space={4} mb={4}>
                            <FormControl>
                                <FormControl.Label>Total Car Count</FormControl.Label>
                                <InputComponent isDisabled placeholder="0" value={`${addValues(values)}`} />
                            </FormControl>
                        </HStack>

                        <Divider />

                        <FormControl my={4}>
                            <TextAreaComponent
                                value={`${values.otherInfo}`}
                                placeholder="Any other information"
                                onChangeText={handleChange('otherInfo')}
                            />
                        </FormControl>
                        <If condition={!isCampusPastor}>
                            <FormControl>
                                <ButtonComponent
                                    isLoading={isLoading}
                                    onPress={() => {
                                        setFieldValue('totalCarCount', addValues(values));
                                        handleSubmit();
                                    }}
                                >
                                    {`${!status ? 'Submit' : 'Update'}`}
                                </ButtonComponent>
                            </FormControl>
                        </If>
                        <If condition={isCampusPastor}>
                            <FormControl mb={6}>
                                <TextAreaComponent
                                    isDisabled={!isCampusPastor}
                                    placeholder="Pastor's comment"
                                    onChangeText={handleChange('pastorComment')}
                                    value={values?.pastorComment ? values?.pastorComment : ''}
                                />
                            </FormControl>
                            <HStack space={4} justifyContent="space-between" w="95%">
                                <ButtonComponent
                                    onPress={() => onRequestReview(values)}
                                    isLoading={isLoading}
                                    width="1/2"
                                    secondary
                                    size="md"
                                >
                                    Request Review
                                </ButtonComponent>
                                <ButtonComponent
                                    onPress={() => onApprove(values)}
                                    isLoading={isLoading}
                                    width="1/2"
                                    size="md"
                                >
                                    Approve
                                </ButtonComponent>
                            </HStack>
                        </If>
                    </VStack>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default SecurityReport;
