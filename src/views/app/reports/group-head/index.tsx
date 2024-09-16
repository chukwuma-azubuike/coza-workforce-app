import { View, Text } from 'react-native';
import React, { useMemo } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { FormControl, VStack } from 'native-base';
import { Formik } from 'formik';
import TextAreaComponent from '@components/atoms/text-area';
import { AddButtonComponent } from '@components/atoms/button';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import ButtonComponent from '@components/atoms/button';
import { GHReportSchema } from '@utils/schemas';
import { ICampusReportSummary, useSubmitGhReportMutation } from '@store/services/reports';
import useModal from '@hooks/modal/useModal';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '@hooks/focus';

const GHReportSummary: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { setOptions } = props.navigation;
    const params = props.route.params as {
        serviceId: String;
        departmentalReport: ICampusReportSummary['departmentalReport'];
        incidentReport: ICampusReportSummary['incidentReport'];
        submittedReport?: string;
    };

    const INITIAL_VALUES = {
        submittedReport: params?.submittedReport ?? '',
    };

    const groupReports = useMemo(() => {
        const departmentReports = params.departmentalReport.map(item => item.report._id);
        const incidentReports = params.incidentReport.map(item => item.incidentReport._id);

        return { departmentReports, incidentReports };
    }, []);

    useScreenFocus({
        onFocus: () => {
            params?.submittedReport && setOptions({ title: 'Report summary' });
        },
    });

    const [submitGhReport, { error, isLoading: isSubmitLoading, reset }] = useSubmitGhReportMutation();
    const { setModalState } = useModal();
    const { goBack } = useNavigation();

    const onSubmit = async (values: any) => {
        const payload = {
            serviceId: params.serviceId,
            ...groupReports,
            ...values,
        };

        const result = await submitGhReport(payload);
        if ('data' in result) {
            setModalState({
                message: 'Submitted to GSP',
                status: 'success',
            });
            reset();
            goBack();
        }
        if ('error' in result) {
            setModalState({
                message: error?.data?.message || 'Something went wrong',
                status: 'error',
            });
        }
    };

    return (
        <ViewWrapper py={10} scroll noPadding>
            <VStack px={4} space={10}>
                <Formik<any>
                    onSubmit={onSubmit}
                    validationSchema={GHReportSchema}
                    initialValues={INITIAL_VALUES as unknown as any}
                >
                    {({ errors, handleChange, handleSubmit, values }) => {
                        return (
                            <VStack space={2}>
                                <FormControl isRequired isInvalid={!!errors?.submittedReport}>
                                    <FormControl.Label>For the GSP's attention</FormControl.Label>
                                    <TextAreaComponent
                                        minHeight={150}
                                        placeholder="Comment"
                                        value={values.submittedReport}
                                        isDisabled={!!params?.submittedReport}
                                        onChangeText={handleChange('submittedReport')}
                                    />
                                    <FormControl.ErrorMessage
                                        fontSize="2xl"
                                        mt={3}
                                        leftIcon={
                                            <Icon
                                                size={16}
                                                name="warning"
                                                type="antdesign"
                                                color={THEME_CONFIG.error}
                                            />
                                        }
                                    >
                                        {errors?.submittedReport}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                {!params?.submittedReport && (
                                    <FormControl minHeight={180}>
                                        <ButtonComponent
                                            isLoading={isSubmitLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit to GSP
                                        </ButtonComponent>
                                    </FormControl>
                                )}
                            </VStack>
                        );
                    }}
                </Formik>
            </VStack>
        </ViewWrapper>
    );
};

export default GHReportSummary;
