import { View } from "react-native";
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import React from 'react';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { ICongressPayload } from '@store/types';
import { CreateCongressSchema } from '@utils/schemas';
import dayjs from 'dayjs';
import { useCreateCongressMutation } from '@store/services/congress';
import { ScreenWidth } from '@rneui/base';

const CreateCongress: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;

    const { setModalState } = useModal();

    const [createCongress, { isLoading, data, reset }] = useCreateCongressMutation();

    const onSubmit: FormikConfig<ICongressPayload>['onSubmit'] = async (values, { resetForm }) => {
        const name = values.name;
        const endDate = dayjs(values.endDate).unix();
        const startDate = dayjs(values.startDate).unix();

        const result = await createCongress({
            name,
            endDate,
            startDate,
        });

        if ('data' in result) {
            setModalState({
                message: 'Congress successfully created',
                status: 'success',
            });
            reset();
            navigate('Congress', data);
            resetForm({ values: INITIAL_VALUES });
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICongressPayload = {
        name: '',
        endDate: undefined,
        startDate: undefined,
    } as any;

    return (
        <ViewWrapper scroll noPadding>
            <View space="lg" alignItems="flex-start" w="100%" mb={24} className="px-4">
                <View alignItems="center" w="100%">
                    <Formik<ICongressPayload>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateCongressSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched, setFieldValue }) => (
                            <View w="100%" space={4}>
                                <FormControl isRequired isInvalid={!!errors?.name && touched.name}>
                                    <FormControl.Label>Name</FormControl.Label>
                                    <InputComponent
                                        value={values.name}
                                        placeholder="Service Name"
                                        onChangeText={handleChange('name')}
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
                                        {errors?.name}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <View justifyContent="space-between">
                                    <FormControl
                                        isRequired
                                        w={ScreenWidth / 2}
                                        isInvalid={!!errors.startDate && touched.startDate}
                                    >
                                        <DateTimePicker                                            label="Start date"
                                            fieldName="startDate"
                                            onSelectDate={setFieldValue}
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
                                            {errors?.startDate}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl
                                        isRequired
                                        w={ScreenWidth / 2}
                                        isInvalid={!!errors.endDate && touched.endDate}
                                    >
                                        <DateTimePicker                                            label="End date"
                                            fieldName="endDate"
                                            onSelectDate={setFieldValue}
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
                                            {errors?.endDate}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </View>

                                <FormControl>
                                    <ButtonComponent
                                        mt={4}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Create Congress 🚀
                                    </ButtonComponent>
                                </FormControl>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCongress);
