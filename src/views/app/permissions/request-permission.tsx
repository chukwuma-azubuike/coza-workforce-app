import React from 'react';
import { Box, FormControl, HStack, VStack } from 'native-base';
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
import { useRequestPermissionMutation } from '../../../store/services/permissions';
import { Formik, FormikConfig } from 'formik';
import { IRequestPermissionPayload } from '../../../store/types';
import useRole from '../../../hooks/role';
import { RequestPermissionSchema } from '../../../utils/schemas';
import useScreenFocus from '../../../hooks/focus';

const RequestPermission: React.FC = () => {
    const { user } = useRole();

    const { goBack } = useNavigation();

    const { setModalState } = useModal();

    const { isLightMode } = useAppColorMode();

    const [requestPermission, { isSuccess, isError, reset, isLoading }] = useRequestPermissionMutation();

    const handleSubmit: FormikConfig<IRequestPermissionPayload>['onSubmit'] = (values, { resetForm }) => {
        requestPermission(values);
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
                            {({ errors, values, handleChange, handleSubmit, setFieldValue }) => (
                                <VStack w="100%" space={1}>
                                    <HStack justifyContent="space-between">
                                        <FormControl isRequired w="1/2">
                                            <DateTimePickerComponent
                                                label="Start date"
                                                fieldName="startDate"
                                                minimumDate={new Date()}
                                                onSelectDate={setFieldValue}
                                            />
                                        </FormControl>
                                        <FormControl isRequired w="1/2">
                                            <DateTimePickerComponent
                                                label="End date"
                                                fieldName="endDate"
                                                minimumDate={new Date()}
                                                onSelectDate={setFieldValue}
                                            />
                                        </FormControl>
                                    </HStack>
                                    <FormControl isRequired isInvalid={!!errors?.categoryId}>
                                        <FormControl.Label>Category</FormControl.Label>
                                        <SelectComponent
                                            defaultValue="work"
                                            selectedValue={values.categoryId}
                                            onValueChange={handleChange('categoryId')}
                                            dropdownIcon={
                                                <HStack mr={2} space={2}>
                                                    <Icon
                                                        type="ionicon"
                                                        name="briefcase-outline"
                                                        color={
                                                            isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.veryLightGray
                                                        }
                                                    />
                                                    <Icon
                                                        type="entypo"
                                                        name="chevron-small-down"
                                                        color={THEME_CONFIG.lightGray}
                                                    />
                                                </HStack>
                                            }
                                        >
                                            <SelectItemComponent
                                                label="Medical"
                                                value="medical"
                                                icon={{
                                                    type: 'antdesign',
                                                    name: 'medicinebox',
                                                }}
                                            />
                                            <SelectItemComponent
                                                label="Education"
                                                value="education"
                                                icon={{
                                                    type: 'ionicon',
                                                    name: 'school-outline',
                                                }}
                                            />
                                            <SelectItemComponent
                                                label="Work"
                                                value="work"
                                                icon={{
                                                    type: 'ionicon',
                                                    name: 'briefcase-outline',
                                                }}
                                            />
                                            <SelectItemComponent
                                                label="Maternity"
                                                value="maternity"
                                                icon={{
                                                    type: 'material-community',
                                                    name: 'mother-nurse',
                                                }}
                                            />
                                            <SelectItemComponent
                                                label="Vacation"
                                                value="vacation"
                                                icon={{
                                                    type: 'material-community',
                                                    name: 'beach',
                                                }}
                                            />
                                            <SelectItemComponent
                                                label="Other"
                                                value="other"
                                                icon={{
                                                    type: 'material-community',
                                                    name: 'beach',
                                                }}
                                            />
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
                                    <FormControl isRequired isInvalid={!!errors?.description}>
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
