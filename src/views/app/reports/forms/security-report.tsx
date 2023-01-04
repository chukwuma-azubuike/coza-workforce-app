/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { ISecurityReportPayload } from '../../../../store/types';
import { useCreateSecurityReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import {
    FormControl,
    VStack,
    HStack,
    Text,
    Divider,
    WarningOutlineIcon,
} from 'native-base';
import ButtonComponent from '../../../../components/atoms/button';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';
import { InputComponent } from '../../../../components/atoms/input';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IReportFormProps } from './types';

const SecurityReport: React.FC<
    NativeStackScreenProps<ParamListBase>
> = props => {
    const params = props.route.params as IReportFormProps;

    const [sendReport, { error, isError, isSuccess, isLoading }] =
        useCreateSecurityReportMutation();

    const onSubmit = (values: ISecurityReportPayload) => {
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

    const INITIAL_VALUES = {
        locations: [{ name: '', carCount: 0 }],
        otherInfo: '',
        imageUrl: '',
    } as ISecurityReportPayload;

    const addValues = (values: ISecurityReportPayload) => {
        return values.locations.length
            ? (values.locations
                  .map(a => a.carCount)
                  .reduce((a, b) => +a + +b) as unknown as string)
            : '0';
    };

    return (
        <Formik<ISecurityReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({
                handleChange,
                errors,
                handleSubmit,
                values,
                setFieldValue,
            }) => (
                <ViewWrapper scroll>
                    <VStack pb={10} mt={4} px={4}>
                        <Text
                            mb={4}
                            w="full"
                            fontSize="md"
                            color="gray.400"
                            textAlign="center"
                        >
                            {moment().format('Do MMMM, YYYY')}
                        </Text>
                        <FieldArray
                            name="locations"
                            render={arrayHelpers => (
                                <VStack>
                                    {values.locations.map((location, idx) => (
                                        <HStack
                                            mb={4}
                                            key={idx}
                                            space={2}
                                            alignItems="flex-end"
                                        >
                                            <FormControl isRequired w="41%">
                                                <FormControl.Label>
                                                    Location
                                                </FormControl.Label>
                                                <InputComponent
                                                    placeholder="Car park name"
                                                    onChangeText={handleChange(
                                                        `locations[${idx}].name`
                                                    )}
                                                />
                                                <FormControl.ErrorMessage
                                                    leftIcon={
                                                        <WarningOutlineIcon size="xs" />
                                                    }
                                                >
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl isRequired w="41%">
                                                <FormControl.Label>
                                                    Car Counts
                                                </FormControl.Label>
                                                <InputComponent
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    onChangeText={handleChange(
                                                        `locations[${idx}].carCount`
                                                    )}
                                                />
                                                <FormControl.ErrorMessage
                                                    leftIcon={
                                                        <WarningOutlineIcon size="xs" />
                                                    }
                                                >
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl w="14%">
                                                <ButtonComponent
                                                    h="54px"
                                                    leftIcon={
                                                        <Icon
                                                            name="minus"
                                                            type="entypo"
                                                            color={
                                                                THEME_CONFIG.primary
                                                            }
                                                        />
                                                    }
                                                    onPress={() =>
                                                        arrayHelpers.remove(idx)
                                                    }
                                                    secondary
                                                    size={12}
                                                />
                                            </FormControl>
                                        </HStack>
                                    ))}

                                    <HStack mb={4}>
                                        <ButtonComponent
                                            isDisabled={isLoading}
                                            leftIcon={
                                                <Icon
                                                    name="plus"
                                                    type="entypo"
                                                    color={THEME_CONFIG.primary}
                                                />
                                            }
                                            onPress={() =>
                                                arrayHelpers.push({
                                                    name: '',
                                                    carCount: 0,
                                                })
                                            }
                                            width="100%"
                                            secondary
                                            size={10}
                                        >
                                            Add Location
                                        </ButtonComponent>
                                    </HStack>
                                </VStack>
                            )}
                        />

                        <HStack space={4} mb={4}>
                            <FormControl>
                                <FormControl.Label>
                                    Total Car Count
                                </FormControl.Label>
                                <InputComponent
                                    isDisabled
                                    placeholder="0"
                                    value={`${addValues(values)}`}
                                />
                            </FormControl>
                        </HStack>

                        <Divider />

                        <FormControl my={4}>
                            <TextAreaComponent
                                placeholder="Any other information"
                                onChangeText={handleChange('otherInfo')}
                            />
                        </FormControl>
                        <FormControl>
                            <ButtonComponent
                                isLoading={isLoading}
                                onPress={() => {
                                    setFieldValue(
                                        'totalCarCount',
                                        addValues(values)
                                    );
                                    handleSubmit();
                                }}
                            >
                                Submit
                            </ButtonComponent>
                        </FormControl>
                    </VStack>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default SecurityReport;
