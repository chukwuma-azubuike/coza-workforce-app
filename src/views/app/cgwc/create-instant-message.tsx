import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import { Box, FormControl, VStack } from 'native-base';
import React from 'react';
import ButtonComponent from '@components/atoms/button';
import { InputComponent } from '@components/atoms/input';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { ICGWCInstantMessage } from '@store/types';
import { CreateCGWCInstantMessageSchema } from '@utils/schemas';
import { useCreateCGWCInstantMessagesMutation } from '@store/services/cgwc';
import TextAreaComponent from '@components/atoms/text-area';

const CreateCGWCInstantMessage: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { navigate } = navigation;
    const params = route.params as { cgwcId: string };
    const cgwcId = params?.cgwcId;
    const { setModalState } = useModal();

    const [createCGWCInstantMessage, { isLoading, error, data, reset }] = useCreateCGWCInstantMessagesMutation();

    const onSubmit: FormikConfig<ICGWCInstantMessage>['onSubmit'] = async (values, { resetForm }) => {
        const result = await createCGWCInstantMessage(values);

        if ('data' in result) {
            setModalState({
                message: 'Message successfully created',
                status: 'success',
            });
            reset();
            navigate('CGWC Details', data);
            resetForm(INITIAL_VALUES as any);
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICGWCInstantMessage = {
        cgwcId,
        title: '',
        message: '',
        messageLink: '',
        status: 'PENDING',
    } as ICGWCInstantMessage;

    return (
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={24}>
                <Box alignItems="center" w="100%">
                    <Formik<ICGWCInstantMessage>
                        validateOnChange
                        enableReinitialize
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCGWCInstantMessageSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched }) => (
                            <VStack w="100%" space={4}>
                                <FormControl isRequired isInvalid={!!errors?.title && touched.title}>
                                    <FormControl.Label>Title</FormControl.Label>
                                    <InputComponent
                                        placeholder="Title"
                                        value={values.title}
                                        onChangeText={handleChange('title')}
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
                                        {errors?.title}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                <FormControl isRequired isInvalid={!!errors?.message && touched.message}>
                                    <FormControl.Label>Message</FormControl.Label>
                                    <TextAreaComponent
                                        value={values.message}
                                        placeholder="Message"
                                        onChangeText={handleChange('message')}
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
                                        {errors?.message}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <ButtonComponent
                                        mt={4}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Post Instant Message
                                    </ButtonComponent>
                                </FormControl>
                            </VStack>
                        )}
                    </Formik>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default CreateCGWCInstantMessage;
