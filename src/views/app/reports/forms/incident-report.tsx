import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IIncidentReportPayload } from '@store/types';
import { useCreateIncidentReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import { FormControl, VStack, Text } from 'native-base';
import ButtonComponent from '@components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '@components/atoms/text-area';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const IncidentReport: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as IIncidentReportPayload;

    const { status, updatedAt, details } = params;

    const [updateReport, { error, isError, isSuccess, isLoading, reset }] = useCreateIncidentReportMutation();

    const onSubmit = (values: IIncidentReportPayload) => {
        updateReport({ ...values, status: 'SUBMITTED' });
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
                message: error?.data.message || 'Something went wrong',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = { ...params, imageUrl: params.imageUrl || '' };

    return (
        <Formik<IIncidentReportPayload> validateOnChange onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
            {({ handleChange, errors, handleSubmit }) => (
                <ViewWrapper scroll>
                    <VStack pb={10}>
                        <Text mb={4} w="full" fontSize="md" color="gray.400" textAlign="center">
                            {moment(updatedAt || undefined).format('Do MMMM, YYYY')}
                        </Text>
                        <VStack
                            mt={4}
                            px={4}
                            space={4}
                            minHeight={details?.length ? (details?.length * 7) / 8 : undefined}
                        >
                            <FormControl isRequired mb={2}>
                                <FormControl.Label mb={4}>Details of Incident</FormControl.Label>
                                <TextAreaComponent
                                    value={details}
                                    isDisabled={!!details}
                                    placeholder="Enter details"
                                    onChangeText={handleChange('details')}
                                    minHeight={details?.length ? (details?.length * 3) / 4 : undefined}
                                />
                            </FormControl>
                            <FormControl>
                                <ButtonComponent
                                    isLoading={isLoading}
                                    isDisabled={!!details}
                                    onPress={handleSubmit as (event: any) => void}
                                >
                                    {`${!status ? 'Submit' : 'Update'}`}
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
