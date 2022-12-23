/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '../../../../hooks/modal/useModal';
import { IChildCareReportPayload } from '../../../../store/types';
import { useCreateChildCareReportMutation } from '../../../../store/services/reports';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import { FormControl, HStack, VStack, Text, Divider } from 'native-base';
import { InputComponent } from '../../../../components/atoms/input';
import ButtonComponent from '../../../../components/atoms/button';
import { THEME_CONFIG } from '../../../../config/appConfig';
import { Icon } from '@rneui/themed';
import moment from 'moment';
import TextAreaComponent from '../../../../components/atoms/text-area';

const ChildcareReport: React.FC = () => {
    const [sendReport, { error, isError, isSuccess, isLoading }] =
        useCreateChildCareReportMutation();

    const onSubmit = (values: IChildCareReportPayload) => {
        sendReport(values);
    };

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                defaultRender: true,
                status: 'success',
                message: 'Report submitted',
            });
        }
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: 'Something went wrong!',
            });
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = {} as IChildCareReportPayload;

    return (
        <Formik<IChildCareReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, errors, handleSubmit }) => (
                <ViewWrapper scroll>
                    <VStack pb={10}>
                        <Text
                            mb={4}
                            w="full"
                            fontSize="md"
                            color="gray.400"
                            textAlign="center"
                        >
                            {moment().format('Do MMMM, YYYY')}
                        </Text>
                        <HStack px={4} flex={1} justifyContent="space-between">
                            <VStack space={4} mt={12}>
                                <Text my={4} color="gray.600">
                                    Age 3 - 5
                                </Text>
                                <Text my={4} color="gray.600">
                                    Age 1 - 2
                                </Text>
                                <Text my={4} color="gray.600">
                                    Age 6 - 11
                                </Text>
                                <Text my={4} color="gray.600">
                                    Age 12 & Above
                                </Text>
                                <Text my={4} color="gray.600">
                                    Sub Total
                                </Text>
                            </VStack>
                            <VStack alignItems="center" space={4} w="30%">
                                <FormControl.Label>Male</FormControl.Label>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age1_2?.male ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age1_2.male'
                                        )}
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
                                        {errors?.age1_2?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age3_5?.male ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age3_5.male'
                                        )}
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
                                        {errors?.age3_5?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age6_11?.male ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age6_11.male'
                                        )}
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
                                        {errors?.age6_11?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age12_above?.male ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age12_above.male'
                                        )}
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
                                        {errors?.age12_above?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.subTotal?.male ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'subTotal.male'
                                        )}
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
                                        {errors?.subTotal?.male}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                            </VStack>
                            <VStack alignItems="center" space={4} w="30%">
                                <FormControl.Label>Female</FormControl.Label>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age1_2?.female ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age1_2.female'
                                        )}
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
                                        {errors?.age1_2?.female}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age3_5?.female ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age3_5.female'
                                        )}
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
                                        {errors?.age3_5?.female}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age6_11?.female ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age6_11.female'
                                        )}
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
                                        {errors?.age6_11?.female}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.age12_above?.female
                                            ? true
                                            : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'age12_above.female'
                                        )}
                                    />
                                </FormControl>
                                <FormControl
                                    isRequired
                                    isInvalid={
                                        errors?.subTotal?.female ? true : false
                                    }
                                >
                                    <InputComponent
                                        w="100%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'subTotal.female'
                                        )}
                                    />
                                </FormControl>
                            </VStack>
                        </HStack>
                        <VStack space={4} mt={4} px={4}>
                            <FormControl>
                                <HStack
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <FormControl.Label>
                                        Grand Total
                                    </FormControl.Label>
                                    <InputComponent
                                        w="66%"
                                        keyboardType="numeric"
                                        onChangeText={handleChange(
                                            'grandTotal'
                                        )}
                                    />
                                </HStack>
                            </FormControl>
                            <Divider />
                            <FormControl>
                                <TextAreaComponent placeholder="Any other information" />
                            </FormControl>
                            <FormControl>
                                <ButtonComponent
                                    isLoading={isLoading}
                                    onPress={
                                        handleSubmit as (event: any) => void
                                    }
                                >
                                    Submit
                                </ButtonComponent>
                            </FormControl>
                        </VStack>
                    </VStack>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default ChildcareReport;
