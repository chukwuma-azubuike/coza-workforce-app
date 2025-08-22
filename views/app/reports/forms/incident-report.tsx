import * as React from 'react';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IIncidentReportPayload } from '@store/types';
import { useCreateIncidentReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';

import dayjs from 'dayjs';

import { router, useLocalSearchParams } from 'expo-router';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';

const IncidentReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IIncidentReportPayload;

    const { status, updatedAt, details } = params;

    const [updateReport, { error, isLoading }] = useCreateIncidentReportMutation();

    const onSubmit = async (values: IIncidentReportPayload) => {
        try {
            const res = await updateReport({ ...values, status: 'SUBMITTED' });

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
        } catch {}
    };

    const { setModalState } = useModal();

    const INITIAL_VALUES = { ...params, imageUrl: params.imageUrl || '', details };

    return (
        <Formik<IIncidentReportPayload>
            enableReinitialize
            validateOnChange
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ViewWrapper scroll avoidKeyboard>
                    <View className="pb-4">
                        <Text className="mb-2 text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-2 mt-2 gap-4">
                            <View>
                                <Label className="mb-2">Details of Incident</Label>
                                <Textarea
                                    defaultValue={details}
                                    isDisabled={!!details}
                                    placeholder="Enter details"
                                    onChangeText={handleChange('details')}
                                />
                            </View>
                            <View>
                                <Button
                                    isLoading={isLoading}
                                    disabled={!values.details}
                                    onPress={handleSubmit as (event: any) => void}
                                >
                                    {`${!status ? 'Submit' : 'Update'}`}
                                </Button>
                            </View>
                        </View>
                    </View>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default IncidentReport;
