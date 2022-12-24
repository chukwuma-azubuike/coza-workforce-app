/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IGuestReportPayload } from '../../../../store/types';
import { useCreateGuestReportMutation } from '../../../../store/services/reports';
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
import { useNavigation } from '@react-navigation/native';

const GuestReport: React.FC = () => {
    const [sendReport, { error, isError, isSuccess, isLoading }] =
        useCreateGuestReportMutation();

    const onSubmit = (values: IGuestReportPayload) => {
        sendReport(values);
    };

    const navigation = useNavigation();

    const { setModalState } = useModal();

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
        firstTimersCount: 0,
        newConvertsCount: 0,
    };

    return (
        <Formik<IGuestReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IGuestReportPayload}
        >
            {({ handleChange, errors, handleSubmit, values }) => (
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
                                    Number of First Timers
                                </FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    onChangeText={handleChange(
                                        'firstTimersCount'
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
                                    Number of New Converts
                                </FormControl.Label>
                                <InputComponent
                                    placeholder="0"
                                    keyboardType="numeric"
                                    onChangeText={handleChange(
                                        'newConvertsCount'
                                    )}
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
                                    onPress={
                                        handleSubmit as (event: any) => void
                                    }
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

export default GuestReport;
