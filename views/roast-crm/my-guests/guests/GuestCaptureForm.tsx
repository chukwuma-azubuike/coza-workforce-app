import React, { memo, useCallback, useMemo } from 'react';
import { ActivitySquareIcon, Home, Save } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { MessageSquare, MapPin, User, Phone } from 'lucide-react-native';

import {
    useCreateGuestMutation,
    useGetAssimilationStagesQuery,
    useGetAssimilationSubStagesQuery,
    useGetZonesQuery,
} from '~/store/services/roast-crm';
import { QuickTips } from './form/QuickTips';
import { Alert, View } from 'react-native';
import useRole from '~/hooks/role';

import { useState } from 'react';
import useModal from '@hooks/modal/useModal';
import { Formik } from 'formik';
import { GuestFormData } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import { PhoneInput } from '~/components/ui/phone-input';
import { ICountry } from 'react-native-international-phone-number';
import formatToE164 from '~/utils/formatToE164';
import PickerSelect from '~/components/ui/picker-select';
import ViewWrapper from '~/components/layout/viewWrapper';
import { GuestFormValidationSchema } from '../../utils/validation';
import { useNetInfo } from '@react-native-community/netinfo';
import { roastCRMActions } from '~/store/actions/roast-crm';
import { useDispatch } from 'react-redux';

const QUICK_TIPS = [
    'Keep conversations natural, friendly and spiritual',
    'Avoid arguments',
    'Focus on building genuine connections',
    'Follow up within 24-48 hours',
];

const GuestCaptureForm: React.FC<{ setModalVisible: () => void }> = ({ setModalVisible }) => {
    const { user: currentUser } = useRole();
    const { setModalState } = useModal();
    const dispatch = useDispatch();
    const netInfo = useNetInfo();
    const isOnline = netInfo.isConnected;

    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

    const { data: zones = [] } = useGetZonesQuery({ campusId: currentUser?.campusId });
    const [addGuest, { isLoading }] = useCreateGuestMutation();
    const { data: assimilationSubStages = [] } = useGetAssimilationSubStagesQuery();
    const { data: assimilationStages = [] } = useGetAssimilationStagesQuery();

    const defaultZone = useMemo(
        () => zones?.find(z => z._id === (currentUser?.zoneIds as string[])?.[0] || zones[0]?._id),
        [zones, currentUser?.zoneIds]
    );

    const handleSelectedCountry = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const onSubmit = useCallback(
        async (value: GuestFormData) => {
            try {
                const payload = {
                    ...value,
                    phone: value.phoneNumber
                        ? formatToE164(value.phoneNumber, selectedCountry?.callingCode as string)
                        : '',
                };
                const res = await addGuest(payload);

                if (res.data) {
                    Alert.alert('Guest created successfully');
                    setModalVisible();
                }

                if (!isOnline && res.error) {
                    const cacheKey = `${addGuest.name}(${JSON.stringify(payload)})`;

                    dispatch(
                        roastCRMActions.addFetchCache({
                            fn: addGuest,
                            cacheKey,
                            payload,
                        })
                    );

                    Alert.alert(
                        'Offline Storage',
                        "You're currently offline, buy not to worry, we've stored your guest locally and will sync with our servers once you're back online"
                    );
                }

                if (res.error) {
                    setModalState({
                        message: (res?.error as any)?.data?.message || 'Oops something went wrong',
                        status: 'error',
                    });
                }
            } catch (error) {}
        },
        [selectedCountry?.callingCode, isOnline]
    );

    const INITIAL_VALUES = {
        zoneId: defaultZone?._id as string,
        assimilationStageId: assimilationStages[0]?._id,
        assimilationSubStageId: assimilationSubStages[0]?._id,
    } as GuestFormData;

    return (
        <ErrorBoundary>
            <ViewWrapper scroll avoidKeyboard className="pt-4">
                <Formik<GuestFormData>
                    onSubmit={onSubmit}
                    initialValues={INITIAL_VALUES}
                    validationSchema={GuestFormValidationSchema}
                >
                    {({ errors, touched, values, isValid, handleChange, handleSubmit, handleBlur }) => {
                        return (
                            <View className="gap-4 pb-6">
                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <User color="gray" size={16} />
                                        <Label>First Name</Label>
                                    </View>
                                    <Input
                                        placeholder="Enter guest's first name"
                                        className="!h-12"
                                        value={values?.firstName}
                                        onChangeText={handleChange('firstName')}
                                    />
                                    {errors?.firstName && touched?.firstName && (
                                        <FormErrorMessage>{errors?.firstName}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <User color="gray" size={16} />
                                        <Label>Last Name</Label>
                                    </View>
                                    <Input
                                        placeholder="Enter guest's last name"
                                        className="!h-12"
                                        value={values?.lastName}
                                        onChangeText={handleChange('lastName')}
                                    />
                                    {errors?.lastName && touched?.lastName && (
                                        <FormErrorMessage>{errors?.lastName}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <Phone color="gray" size={16} />
                                        <Label>Phone number</Label>
                                    </View>
                                    <PhoneInput
                                        defaultCountry="NG"
                                        error={errors.phoneNumber}
                                        className="!h-12"
                                        placeholder="Enter phone number"
                                        touched={touched.phoneNumber}
                                        selectedCountry={selectedCountry}
                                        onBlur={handleBlur('phoneNumber')}
                                        value={values.phoneNumber as string}
                                        onChangeSelectedCountry={handleSelectedCountry}
                                        onChangePhoneNumber={handleChange('phoneNumber')}
                                    />
                                    {errors?.phoneNumber && touched?.phoneNumber && (
                                        <FormErrorMessage>{errors?.phoneNumber}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <Home color="gray" size={16} />
                                        <Label>Address (Optional)</Label>
                                    </View>
                                    <Input
                                        className="!h-12"
                                        placeholder="Address"
                                        value={values?.address as string}
                                        onChangeText={handleChange('address')}
                                    />
                                    {errors?.address && touched?.address && (
                                        <FormErrorMessage>{errors?.address}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <MapPin color="gray" size={16} />
                                        <Label>Zone</Label>
                                    </View>
                                    <PickerSelect
                                        valueKey="_id"
                                        labelKey="name"
                                        className="!h-12"
                                        items={zones || []}
                                        value={values?.zoneId}
                                        placeholder="Select zone"
                                        onValueChange={handleChange('zoneId') as any}
                                    />
                                    {errors?.zoneId && touched?.zoneId && (
                                        <FormErrorMessage>{errors?.zoneId}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <User color="gray" size={16} />
                                        <Label>Gender</Label>
                                    </View>
                                    <PickerSelect
                                        valueKey="_id"
                                        labelKey="name"
                                        className="!h-12"
                                        placeholder="Enter your gender"
                                        value={values?.gender}
                                        items={[
                                            { _id: 'M', name: 'Male' },
                                            { _id: 'F', name: 'Female' },
                                        ]}
                                        onValueChange={handleChange('gender') as any}
                                    />
                                    {errors?.gender && touched?.gender && (
                                        <FormErrorMessage>{errors?.gender}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2 mb-2">
                                    <View className="items-center gap-2 flex-row">
                                        <ActivitySquareIcon color="gray" size={16} />
                                        <Label>Next Action (Optional)</Label>
                                    </View>
                                    <Textarea
                                        placeholder="Any specific action you need to take regading your guest?"
                                        value={values?.nextAction as string}
                                        onChangeText={handleChange('nextAction')}
                                    />
                                </View>

                                <View className="gap-2 mb-2">
                                    <View className="items-center gap-2 flex-row">
                                        <MessageSquare color="gray" size={16} />
                                        <Label>Comment (Optional)</Label>
                                    </View>
                                    <Textarea
                                        placeholder="Anything to take note of?"
                                        value={values?.comment as string}
                                        onChangeText={handleChange('comment')}
                                    />
                                </View>

                                <View>
                                    <Button
                                        size="sm"
                                        icon={<Save color="white" size={18} />}
                                        disabled={!isValid}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Save
                                    </Button>
                                </View>

                                <QuickTips tips={QUICK_TIPS} />
                            </View>
                        );
                    }}
                </Formik>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default memo(GuestCaptureForm);

GuestCaptureForm.displayName = 'GuestCaptureForm';
