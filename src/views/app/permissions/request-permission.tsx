import React from 'react';
import { Box, FormControl, HStack, Text, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import TextAreaComponent from '../../../components/atoms/text-area';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import { DateTimePickerComponent } from '../../../components/composite/date-picker';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import useModal from '../../../hooks/modal/useModal';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useNavigation } from '@react-navigation/native';
import { useGetPermissionCategoriesQuery, useRequestPermissionMutation } from '../../../store/services/permissions';
import { Formik, FormikConfig } from 'formik';
import { IRequestPermissionPayload } from '../../../store/types';
import useRole from '../../../hooks/role';
import { RequestPermissionSchema } from '../../../utils/schemas';
import useScreenFocus from '../../../hooks/focus';
import moment from 'moment';

const RequestPermission: React.FC = () => {
    const { user } = useRole();

    const { goBack } = useNavigation();

    const { setModalState } = useModal();

    const { isLightMode } = useAppColorMode();

    const { data: categories } = useGetPermissionCategoriesQuery();

    const [requestPermission, { isSuccess, isError, reset, isLoading }] = useRequestPermissionMutation();

    const handleSubmit: FormikConfig<IRequestPermissionPayload>['onSubmit'] = (values, { resetForm }) => {
        requestPermission({
            ...values,
            startDate: moment(values.startDate).unix() * 1000,
            endDate: moment(values.endDate).unix() * 1000,
        });
        resetForm(INITIAL_VALUES);
    };

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                message: 'Your request has been sent',
                status: 'success',
            });
            reset();
            goBack();
        }
        if (isError) {
            setModalState({
                message: 'Oops something went',
                status: 'error',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const iconMap = {
        medical: {
            type: 'antdesign',
            name: 'medicinebox',
        },
        education: {
            type: 'ionicon',
            name: 'school-outline',
        },
        work: {
            type: 'ionicon',
            name: 'briefcase-outline',
        },
        maternity: {
            type: 'material-community',
            name: 'mother-nurse',
        },
        vacation: {
            type: 'material-community',
            name: 'beach',
        },
    };

    const INITIAL_VALUES = {
        endDate: '',
        startDate: '',
        categoryId: '',
        approvedBy: '',
        description: '',
        status: 'PENDING',
        campusId: user.campus._id,
        requestor: user?._id || user?.userId,
        departmentId: user.department._id,
    } as IRequestPermissionPayload;

    useScreenFocus({
        onFocus: reset,
        onFocusExit: reset,
    });

    return (
        <ViewWrapper>
            <>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Box alignItems="center" w="100%">
                        <Formik<IRequestPermissionPayload>
                            enableReinitialize
                            onSubmit={handleSubmit}
                            initialValues={INITIAL_VALUES}
                            validationSchema={RequestPermissionSchema}
                        >
                            {({ errors, touched, values, handleChange, handleSubmit, setFieldValue }) => (
                                <VStack w="100%" space={1}>
                                    <HStack justifyContent="space-between">
                                        <FormControl
                                            w="1/2"
                                            isRequired
                                            isInvalid={!!errors.startDate && touched.startDate}
                                        >
                                            <DateTimePickerComponent
                                                label="Start date"
                                                fieldName="startDate"
                                                minimumDate={new Date()}
                                                onSelectDate={setFieldValue}
                                            />
                                            {errors.startDate && (
                                                <Text color="error.400" fontSize="xs">
                                                    Please select an end date
                                                </Text>
                                            )}
                                        </FormControl>
                                        <FormControl w="1/2" isRequired isInvalid={!!errors.endDate && touched.endDate}>
                                            <DateTimePickerComponent
                                                label="End date"
                                                fieldName="endDate"
                                                minimumDate={new Date()}
                                                onSelectDate={setFieldValue}
                                            />
                                            {errors.endDate && (
                                                <Text color="error.400" fontSize="xs">
                                                    Please select an end date
                                                </Text>
                                            )}
                                        </FormControl>
                                    </HStack>
                                    <FormControl isRequired isInvalid={!!errors?.categoryId && touched.categoryId}>
                                        <FormControl.Label>Category</FormControl.Label>
                                        <SelectComponent
                                            defaultValue="work"
                                            selectedValue={values.categoryId}
                                            onValueChange={handleChange('categoryId')}
                                            dropdownIcon={
                                                <HStack mr={2} space={2}>
                                                    {/* <Icon
                                                        type="ionicon"
                                                        name="briefcase-outline"
                                                        color={
                                                            isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.veryLightGray
                                                        }
                                                    /> */}
                                                    <Icon
                                                        type="entypo"
                                                        name="chevron-small-down"
                                                        color={THEME_CONFIG.lightGray}
                                                    />
                                                </HStack>
                                            }
                                        >
                                            {categories?.map((category, index) => (
                                                <SelectItemComponent
                                                    value={category._id}
                                                    label={category.name}
                                                    key={`category-${index}`}
                                                    icon={iconMap[category.name.toLowerCase()]}
                                                />
                                            ))}
                                        </SelectComponent>
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
                                            {errors?.categoryId}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.description && touched.description}>
                                        <FormControl.Label>Description</FormControl.Label>
                                        <TextAreaComponent
                                            isRequired
                                            value={values.description}
                                            placeholder="Brief description"
                                            onChangeText={handleChange('description')}
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
                                            {errors?.description}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <ButtonComponent
                                            mt={4}
                                            isLoading={isLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Submit for Approval
                                        </ButtonComponent>
                                    </FormControl>
                                </VStack>
                            )}
                        </Formik>
                    </Box>
                </VStack>
            </>
        </ViewWrapper>
    );
};

export default RequestPermission;
