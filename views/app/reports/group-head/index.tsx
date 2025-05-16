import { View } from "react-native";
import React, { useMemo } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { View } from 'native-base';
import { Formik } from 'formik';
import TextAreaComponent from '@components/atoms/text-area';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import ButtonComponent from '@components/atoms/button';
import { GHReportSchema } from '@utils/schemas';
import { ICampusReportSummary } from '@store/services/reports';
import useModal from '@hooks/modal/useModal';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '@hooks/focus';
import { useSubmitGhReportMutation } from '@store/services/grouphead';

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
        <ViewWrapper py={10} noPadding>
            <View space={10} className="px-4">
                <Formik<any>
                    onSubmit={onSubmit}
                    validationSchema={GHReportSchema}
                    initialValues={INITIAL_VALUES as unknown as any}
                    enableReinitialize
                >
                    {({ errors, handleChange, handleSubmit, values }) => {
                        return (
                            <View space={2}>
                                <View  isInvalid={!!errors?.submittedReport}>
                                    <Label>For the GSP's attention</Label>
                                    <TextAreaComponent
                                        minHeight={150}
                                        placeholder="Comment"
                                        value={values.submittedReport}
                                        isDisabled={!!params?.submittedReport}
                                        onChangeText={handleChange('submittedReport')}
                                    />
                                    <FormErrorMessage
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
                                    </FormErrorMessage>
                                </View>
                                {!params?.submittedReport && (
                                    <View minHeight={180}>
                                        <ButtonComponent
                                            isLoading={isSubmitLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit to GSP
                                        </ButtonComponent>
                                    </View>
                                )}
                            </View>
                        );
                    }}
                </Formik>
            </View>
        </ViewWrapper>
    );
};

export default GHReportSummary;
