/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Formik } from 'formik';
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

    const [locations, setLocations] = React.useState<
        { name: string; adultCount: number; minorCount: number }[]
    >([{ name: '', adultCount: 0, minorCount: 0 }]);

    const INITIAL_VALUES = {
        locations,
        otherInfo: '',
        imageUrl: '',
    } as ITransferReportPayload;

    const handleRemove = () => {
        setLocations(prev => {
            return [...prev.splice(0, prev.length - 1)];
        });
    };

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
                        {values.locations.length
                            ? values.locations.map((elm, idx) => (
                                  <HStack space={4} key={idx} mb={4}>
                                      <FormControl isRequired w="40%">
                                          <FormControl.Label>
                                              Location
                                          </FormControl.Label>
                                          <InputComponent
                                              placeholder="Location name"
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
                                      <FormControl isRequired w="22%">
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
                                      <FormControl isRequired w="29%">
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
                                  </HStack>
                              ))
                            : null}
                        <HStack space={4} mb={4}>
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
                                    setLocations(() => [
                                        ...values.locations,
                                        {
                                            name: '',
                                            adultCount: 0,
                                            minorCount: 0,
                                        },
                                    ]);
                                }}
                                width="48%"
                                secondary
                                size={10}
                            >
                                Add Location
                            </ButtonComponent>
                            <ButtonComponent
                                isDisabled={
                                    values.locations.length < 1 || isLoading
                                }
                                leftIcon={
                                    <Icon
                                        name="minus"
                                        type="entypo"
                                        color={THEME_CONFIG.primary}
                                    />
                                }
                                onPress={handleRemove}
                                width="48%"
                                secondary
                                size={10}
                            >
                                Remove Location
                            </ButtonComponent>
                        </HStack>

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
