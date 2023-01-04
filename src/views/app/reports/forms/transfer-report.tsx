/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { FieldArray, Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { ITransferReportPayload } from '../../../../store/types';
import { useCreateTransferReportMutation } from '../../../../store/services/reports';
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

const TransferReport: React.FC<
    NativeStackScreenProps<ParamListBase>
> = props => {
    const params = props.route.params as IReportFormProps;

    const [sendReport, { error, isError, isSuccess, isLoading }] =
        useCreateTransferReportMutation();

    const onSubmit = (values: ITransferReportPayload) => {
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
        imageUrl: '',
        otherInfo: '',
        locations: [{ name: '', adultCount: 0, minorCount: 0 }],
    } as ITransferReportPayload;

    const addValues = (
        values: ITransferReportPayload,
        field: 'adultCount' | 'minorCount'
    ) => {
        return values.locations.length
            ? (values.locations
                  .map(a => a[field])
                  .reduce((a, b) => +a + +b) as unknown as string)
            : '0';
    };

    return (
        <Formik<ITransferReportPayload>
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
                                    {values.locations.map((locations, idx) => (
                                        <HStack
                                            mb={4}
                                            space={2}
                                            key={idx}
                                            alignItems="flex-end"
                                        >
                                            <FormControl isRequired w="30.5%">
                                                <FormControl.Label>
                                                    Location
                                                </FormControl.Label>
                                                <InputComponent
                                                    placeholder="Name"
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
                                            <FormControl isRequired w="20%">
                                                <FormControl.Label>
                                                    Adults
                                                </FormControl.Label>
                                                <InputComponent
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    onChangeText={handleChange(
                                                        `locations[${idx}].adultCount`
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
                                            <FormControl isRequired w="30%">
                                                <FormControl.Label>
                                                    Children/Teens
                                                </FormControl.Label>
                                                <InputComponent
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    onChangeText={handleChange(
                                                        `locations[${idx}].minorCount`
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
                                            onPress={() => {
                                                arrayHelpers.push({
                                                    name: '',
                                                    adultCount: 0,
                                                    minorCount: 0,
                                                });
                                            }}
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
                            <FormControl w="48%">
                                <FormControl.Label>
                                    Total Adults
                                </FormControl.Label>
                                <InputComponent
                                    isDisabled
                                    placeholder="0"
                                    value={`${addValues(values, 'adultCount')}`}
                                />
                            </FormControl>
                            <FormControl w="48%">
                                <FormControl.Label>
                                    Total Children/Teens
                                </FormControl.Label>
                                <InputComponent
                                    isDisabled
                                    placeholder="0"
                                    value={`${addValues(values, 'minorCount')}`}
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
                                        'total.adults',
                                        addValues(values, 'adultCount')
                                    );
                                    ``;
                                    setFieldValue(
                                        'total.minors',
                                        addValues(values, 'minorCount')
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

export default TransferReport;
