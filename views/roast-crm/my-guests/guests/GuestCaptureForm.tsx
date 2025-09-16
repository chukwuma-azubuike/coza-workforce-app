import React from 'react';
import { Home, Save } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { MessageSquare, MapPin, User, Phone } from 'lucide-react-native';

import { useCreateGuestMutation, useGetZonesQuery } from '~/store/services/roast-crm';
import { QuickTips } from './form/QuickTips';
import { View } from 'react-native';
import useRole from '~/hooks/role';

import { useState } from 'react';
import useModal from '@hooks/modal/useModal';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { GuestFormData } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetUserByIdQuery } from '@store/services/account';
import FormErrorMessage from '~/components/ui/error-message';
import { Input } from '~/components/ui/input';
import { PhoneInput } from '~/components/ui/phone-input';
import { ICountry } from 'react-native-international-phone-number';
import formatToE164 from '~/utils/formatToE164';
import PickerSelect from '~/components/ui/picker-select';
import ViewWrapper from '~/components/layout/viewWrapper';
import { GuestFormValidationSchema } from './form/validation';

const QUICK_TIPS = [
    'Keep conversations natural and friendly',
    'Ask permission before capturing contact details',
    'Focus on building genuine connections',
    'Follow up within 24-48 hours',
];

const GuestCaptureForm = () => {
    const { user: currentUser } = useRole();
    const { data: zones = [] } = useGetZonesQuery();
    const isOnline = true;

    const defaultZone = zones?.find(z => z._id === (currentUser?.zoneIds as string[])?.[0] || zones[0]?._id);

    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

    const handleSelectedCountry = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const { user } = useRole();
    const { goBack } = useNavigation();

    const { setModalState } = useModal();

    const [addGuest, { reset, isLoading, isError, isSuccess, error }] = useCreateGuestMutation();

    const onSubmit = async (value: GuestFormData) => {
        try {
            const res = await addGuest({
                ...value,
                phone: value.phone ? formatToE164(value.phone, selectedCountry?.callingCode as string) : '',
            });
        } catch (error) {}
    };

    React.useEffect(() => {
        if (isSuccess) {
            reset();
            refetchUser();
            goBack();
        }

        if (isError) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = { zoneId: defaultZone?._id as string } as GuestFormData;

    const { refetch: refetchUser } = useGetUserByIdQuery(user?._id);

    return (
        <ErrorBoundary>
            <ViewWrapper scroll className="pt-4">
                <Formik<GuestFormData>
                    onSubmit={onSubmit}
                    initialValues={INITIAL_VALUES}
                    validationSchema={GuestFormValidationSchema}
                >
                    {({ errors, touched, values, isValid, handleChange, handleSubmit, handleBlur }) => {
                        return (
                            <View className="gap-4">
                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <User color="gray" size={16} />
                                        <Label>Name</Label>
                                    </View>
                                    <Input
                                        placeholder="Enter guest's full name"
                                        className="!h-12"
                                        value={values?.name}
                                        onChangeText={handleChange('name')}
                                    />
                                    {errors?.name && touched?.name && (
                                        <FormErrorMessage>{errors?.name}</FormErrorMessage>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <View className="items-center gap-2 flex-row">
                                        <Phone color="gray" size={16} />
                                        <Label>Phone number</Label>
                                    </View>
                                    <PhoneInput
                                        defaultCountry="NG"
                                        error={errors.phone}
                                        className="!h-12"
                                        placeholder="Enter phone number"
                                        touched={touched.phone}
                                        selectedCountry={selectedCountry}
                                        onBlur={handleBlur('phone')}
                                        value={values.phone as string}
                                        onChangeSelectedCountry={handleSelectedCountry}
                                        onChangePhoneNumber={handleChange('phone')}
                                    />
                                    {errors?.phone && touched?.phone && (
                                        <FormErrorMessage>{errors?.phone}</FormErrorMessage>
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

export default GuestCaptureForm;
