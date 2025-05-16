import { View } from "react-native";
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import { View } from 'native-base';
import React from 'react';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { ICongressInstantMessage } from '@store/types';
import { CreateCongressInstantMessageSchema } from '@utils/schemas';
import { useCreateCongressInstantMessagesMutation } from '@store/services/congress';
import TextAreaComponent from '@components/atoms/text-area';

const CreateCongressInstantMessage: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { navigate } = navigation;
    const params = route.params as { CongressId: string };
    const CongressId = params?.CongressId;
    const { setModalState } = useModal();

    const [createCongressInstantMessage, { isLoading, error, data, reset }] = useCreateCongressInstantMessagesMutation();

    const onSubmit: FormikConfig<ICongressInstantMessage>['onSubmit'] = async (values, { resetForm }) => {
        const result = await createCongressInstantMessage({ ...values, cgwcId: CongressId });

        if ('data' in result) {
            setModalState({
                message: 'Message successfully created',
                status: 'success',
            });
            reset();
            resetForm({ values: INITIAL_VALUES });
            navigate('Congress Details', data);
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICongressInstantMessage = {
        CongressId,
        title: '',
        message: '',
        messageLink: '',
        status: 'PENDING',
    } as ICongressInstantMessage;

    return (
        <ViewWrapper scroll noPadding>
            <View space="lg" alignItems="flex-start" w="100%" mb={24} className="px-4">
                <View alignItems="center" w="100%">
                    <Formik<ICongressInstantMessage>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCongressInstantMessageSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched }) => (
                            <View w="100%" space={4}>
                                <View  isInvalid={!!errors?.title && touched.title}>
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="Title"
                                        value={values.title}
                                        onChangeText={handleChange('title')}
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
                                        {errors?.title}
                                    </FormErrorMessage>
                                </View>

                                <View  isInvalid={!!errors?.message && touched.message}>
                                    <Label>Message</Label>
                                    <TextAreaComponent
                                        value={values.message}
                                        placeholder="Message"
                                        onChangeText={handleChange('message')}
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
                                        {errors?.message}
                                    </FormErrorMessage>
                                </View>

                                <View>
                                    <ButtonComponent
                                        mt={4}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Post Instant Message
                                    </ButtonComponent>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCongressInstantMessage);
