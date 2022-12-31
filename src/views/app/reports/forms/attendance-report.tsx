/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IAttendanceReportPayload } from '../../../../store/types';
import { useCreateAttendanceReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import {
    FormControl,
    VStack,
    Text,
    Divider,
    WarningOutlineIcon,
} from 'native-base';
import ButtonComponent from '../../../../components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { InputComponent } from '../../../../components/atoms/input';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IReportFormProps } from './types';

const AttendanceReport: React.FC<
    NativeStackScreenProps<ParamListBase>
> = props => {
    const params = props.route.params as IReportFormProps;

    const [sendReport, { error, isError, isSuccess, isLoading }] =
        useCreateAttendanceReportMutation();

    const onSubmit = (values: IAttendanceReportPayload) => {
        sendReport({ ...values, ...params });
    };

    const { setModalState } = useModal();
    const navigation = useNavigation();

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                defaultRender: true,
                status: 'success',
                message: 'Report submitted',
            });
            navigation.goBack();
        }
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: 'Something went wrong!',
            });
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = {
        maleGuestCount: 0,
        femaleGuestCount: 0,
        infants: 0,
        total: 0,
    };

    const addValues = (values: IAttendanceReportPayload) => {
        return `${
            +values.femaleGuestCount + +values.maleGuestCount + +values.infants
        }`;
    };

    return (
        <Formik<IAttendanceReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={
                INITIAL_VALUES as unknown as IAttendanceReportPayload
            }
        >
            {({
                handleChange,
                errors,
                handleSubmit,
                values,
                setFieldValue,
            }) => (
                <ViewWrapper scroll>
                    <VStack pb={10}>
                        <Text
                            mb={4}
                            w="full"
                            fontSize="md"
                            color="gray.400"
                            textAlign="center"
                        >
                            {moment().format('Do MMMM, YYYY')}
                        </Text>
                        <VStack space={4} mt={4} px={4}>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Number of Male Guests
                                </FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    onChangeText={handleChange(
                                        'maleGuestCount'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Number of Female Guests
                                </FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    onChangeText={handleChange(
                                        'femaleGuestCount'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl isRequired>
                                <FormControl.Label>
                                    Number of Infant Guests
                                </FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    onChangeText={handleChange('infants')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Total</FormControl.Label>
                                <InputComponent
                                    isDisabled
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={addValues(values)}
                                    onChangeText={handleChange('total')}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <Divider />
                            <FormControl mb={2}>
                                <TextAreaComponent
                                    placeholder="Any other information"
                                    onChangeText={handleChange('otherInfo')}
                                />
                            </FormControl>
                            <FormControl>
                                <ButtonComponent
                                    isLoading={isLoading}
                                    onPress={() => {
                                        setFieldValue(
                                            'total',
                                            addValues(values)
                                        );
                                        handleSubmit();
                                    }}
                                >
                                    Submit
                                </ButtonComponent>
                            </FormControl>
                        </VStack>
                    </VStack>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default AttendanceReport;
