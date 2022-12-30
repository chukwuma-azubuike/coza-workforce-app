/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IIncidentReportPayload } from '../../../../store/types';
import { useCreateIncidentReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { FormControl, VStack, Text } from 'native-base';
import ButtonComponent from '../../../../components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IReportFormProps } from './types';

const IncidentReport: React.FC<
    NativeStackScreenProps<ParamListBase>
> = props => {
    const params = props.route.params as IReportFormProps;

    const [sendReport, { error, isError, isSuccess, isLoading }] =
        useCreateIncidentReportMutation();

    const onSubmit = (values: IIncidentReportPayload) => {
        sendReport({ ...values, ...params });
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

    const INITIAL_VALUES = {} as IIncidentReportPayload;

    return (
        <Formik<IIncidentReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, errors, handleSubmit }) => (
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
                            <FormControl isRequired mb={2}>
                                <FormControl.Label mb={4}>
                                    Details of Incident
                                </FormControl.Label>
                                <TextAreaComponent
                                    placeholder="Enter details"
                                    onChangeText={handleChange('details')}
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

export default IncidentReport;
