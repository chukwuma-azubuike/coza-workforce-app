import { View } from 'react-native';
import React, { useMemo } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { Formik } from 'formik';
import { GHReportSchema } from '@utils/schemas';
import { ICampusReportSummary } from '@store/services/reports';
import useModal from '@hooks/modal/useModal';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '@hooks/focus';
import { useSubmitGhReportMutation } from '@store/services/grouphead';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import FormErrorMessage from '~/components/ui/error-message';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

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
                message: (error as any)?.data?.message || 'Something went wrong',
                status: 'error',
            });
        }
    };

    return (
        <ViewWrapper className="py-6" noPadding>
            <View className="px-4">
                <Formik<any>
                    onSubmit={onSubmit}
                    validationSchema={GHReportSchema}
                    initialValues={INITIAL_VALUES as unknown as any}
                    enableReinitialize
                >
                    {({ errors, handleChange, handleSubmit, values }) => {
                        return (
                            <View className="space-y-2">
                                <View className={cn(!!errors?.submittedReport && 'border-red-500')}>
                                    <Label>For the GSP's attention</Label>
                                    <Textarea
                                        placeholder="Comment"
                                        value={values.submittedReport}
                                        isDisabled={!!params?.submittedReport}
                                        onChangeText={handleChange('submittedReport')}
                                    />
                                    {errors?.submittedReport && (
                                        <FormErrorMessage>{errors?.submittedReport as string}</FormErrorMessage>
                                    )}
                                </View>
                                {!params?.submittedReport && (
                                    <View>
                                        <Button
                                            isLoading={isSubmitLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit to GSP
                                        </Button>
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
