import * as React from 'react';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IIncidentReportPayload } from '@store/types';
import { useCreateIncidentReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';

import dayjs from 'dayjs';
import TextAreaComponent from '@components/atoms/text-area';
import { useNavigation } from '@react-navigation/native';

import { useLocalSearchParams } from 'expo-router';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';

const IncidentReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IIncidentReportPayload;

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
                message: (error as any)?.data.message || 'Something went wrong',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = { ...params, imageUrl: params.imageUrl || '', details };

    return (
        <Formik<IIncidentReportPayload>
            enableReinitialize
            validateOnChange
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ViewWrapper scroll avoidKeyboard avoidKeyboardBehavior="height">
                    <View className="pb-4">
                        <Text className="mb-2 text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-4 mt-2 gap-4">
                            <View>
                                <Label className="mb-2">Details of Incident</Label>
                                <TextAreaComponent
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
