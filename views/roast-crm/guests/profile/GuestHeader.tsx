import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { Card, CardContent } from '~/components/ui/card';
import { Phone, MessageCircle, MapPin, Calendar, Home } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Guest, IUser } from '~/store/types';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { Alert } from '~/components/ui/alert';
import { useGetZonesQuery, useUpdateGuestMutation } from '~/store/services/roast-crm';
import { Input } from '~/components/ui/input';
import { Formik } from 'formik';
import { GuestFormValidationSchema } from '../../utils/validation';
import FormErrorMessage from '~/components/ui/error-message';
import { PhoneInput } from '~/components/ui/phone-input';
import { ICountry } from 'react-native-international-phone-number';
import PickerSelect from '~/components/ui/picker-select';
import useZoneIndex from '../../hooks/use-zone-index';
import Loading from '~/components/atoms/loading';
import formatToE164 from '~/utils/formatToE164';

interface GuestHeaderProps {
    guest: Guest;
    currentUser: IUser;
    stageColor: string;
    progressPercentage: number;
    onCall: () => void;
    onWhatsApp: () => void;
    assimilationStage: string;
}

export function GuestHeader({
    guest,
    stageColor,
    progressPercentage,
    onCall,
    onWhatsApp,
    currentUser,
    assimilationStage,
}: GuestHeaderProps) {
    const [updateGuest, { isLoading: updating }] = useUpdateGuestMutation();
    const [mode, setMode] = useState<'edit' | 'view'>('view');
    const isEditMode = mode === 'edit';
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
    const { data: zones = [] } = useGetZonesQuery({ campusId: currentUser?.campus._id });
    const zoneIndex = useZoneIndex();

    const handleMode = (mode: 'edit' | 'view') => () => {
        setMode(mode);
    };

    const handleSelectedCountry = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const onSubmit = async (values: Guest) => {
        handleMode('view')();
        try {
            const res = await updateGuest({
                ...guest,
                ...values,
                phoneNumber: formatToE164(values.phoneNumber, selectedCountry?.callingCode ?? '+234'),
            });

            if (res.data) {
            }

            if (res.error) {
                handleMode('edit')();
            }
        } catch (error) {}
    };

    return (
        <Formik<Guest> initialValues={guest} onSubmit={onSubmit} validationSchema={GuestFormValidationSchema}>
            {({ handleChange, handleBlur, handleSubmit, errors, values }) => {
                return (
                    <Card>
                        <CardContent className="p-6 gap-6">
                            <View className="absolute z-10 top-4 right-4 gap-2 flex-row">
                                {updating ? (
                                    <Loading />
                                ) : (
                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        className="!h-8 px-3 rounded-xl border border-border"
                                        onPress={isEditMode ? (handleSubmit as any) : handleMode('edit')}
                                    >
                                        <Text className="text">{isEditMode ? 'Done' : 'Edit'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View className="flex-row items-start gap-4">
                                <Avatar alt="profile-image" className="w-16 h-16">
                                    <AvatarFallback className="text-lg">
                                        <Text>
                                            {`${guest.firstName} ${guest.lastName}`
                                                .split(' ')
                                                .map(n => n[0])
                                                .join('')}
                                        </Text>
                                    </AvatarFallback>
                                </Avatar>
                                <View className="flex-1 gap-1">
                                    {isEditMode ? (
                                        <View className="gap-2 flex-row">
                                            <View className="gap-1">
                                                <Input
                                                    autoFocus
                                                    className="!h-10"
                                                    value={values.firstName}
                                                    placeholder="First name"
                                                    onChangeText={handleChange('firstName')}
                                                />
                                                {!!errors?.firstName && (
                                                    <FormErrorMessage>{errors?.firstName}</FormErrorMessage>
                                                )}
                                            </View>
                                            <View className="gap-1">
                                                <Input
                                                    className="!h-10"
                                                    value={values.lastName}
                                                    placeholder="Last name"
                                                    onChangeText={handleChange('lastName')}
                                                />
                                                {!!errors?.lastName && (
                                                    <FormErrorMessage>{errors?.lastName}</FormErrorMessage>
                                                )}
                                            </View>
                                        </View>
                                    ) : (
                                        <Text className="text-2xl font-bold mb-2">
                                            {guest.firstName} {guest.lastName}
                                        </Text>
                                    )}
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Badge variant="secondary" className={stageColor}>
                                            <Text className={stageColor}>
                                                {assimilationStage.charAt(0).toUpperCase() + assimilationStage.slice(1)}
                                            </Text>
                                        </Badge>
                                        <Text className="text-muted-foreground">{progressPercentage}% complete</Text>
                                    </View>
                                    <Progress value={progressPercentage} />
                                </View>
                            </View>

                            {/* Contact Actions */}
                            <View className="flex-row gap-2">
                                <Button
                                    variant="outline"
                                    icon={<Phone className="w-4 h-4 mr-2" />}
                                    className="flex-1"
                                    onPress={onCall}
                                    size="sm"
                                >
                                    Call
                                </Button>
                                <Button
                                    icon={<MessageCircle className="w-4 h-4 mr-2" color={THEME_CONFIG.success} />}
                                    variant="outline"
                                    className="flex-1"
                                    onPress={onWhatsApp}
                                    size="sm"
                                >
                                    WhatsApp
                                </Button>
                            </View>

                            {/* Contact Details */}
                            <View className="gap-3">
                                {isEditMode ? (
                                    <PhoneInput
                                        defaultCountry="NG"
                                        error={errors.phoneNumber}
                                        value={values.phoneNumber}
                                        placeholder="Enter phone number"
                                        selectedCountry={selectedCountry}
                                        onBlur={handleBlur('phoneNumber')}
                                        onChangeSelectedCountry={handleSelectedCountry}
                                        onChangePhoneNumber={handleChange('phoneNumber')}
                                    />
                                ) : (
                                    <View className="flex-row items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <Text>{guest.phoneNumber}</Text>
                                    </View>
                                )}
                                {guest.address && (
                                    <View className="flex-row items-center gap-2">
                                        <Home className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        {isEditMode ? (
                                            <View className="gap-2 flex-1">
                                                <Input
                                                    className="!h-10 !w-full"
                                                    placeholder="Address"
                                                    value={values?.address as string}
                                                    onChangeText={handleChange('address')}
                                                />
                                                {errors?.address && (
                                                    <FormErrorMessage>{errors?.address}</FormErrorMessage>
                                                )}
                                            </View>
                                        ) : (
                                            <Text>{guest.address}</Text>
                                        )}
                                    </View>
                                )}

                                <View className="flex-row items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    {isEditMode ? (
                                        <View className="flex-1">
                                            <PickerSelect
                                                valueKey="_id"
                                                labelKey="name"
                                                className="!h-12"
                                                items={zones || []}
                                                value={values?.zoneId}
                                                placeholder="Select zone"
                                                onValueChange={handleChange('zoneId') as any}
                                            />
                                            {errors?.zoneId && <FormErrorMessage>{errors?.zoneId}</FormErrorMessage>}
                                        </View>
                                    ) : (
                                        <Text>{zoneIndex[guest.zoneId]}</Text>
                                    )}
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <Text>Added {new Date(guest.createdAt).toLocaleString()}</Text>
                                </View>
                            </View>

                            {/* Next Action */}
                            {guest.nextAction && !isEditMode && (
                                <Alert className="rounded-lg border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-300/30">
                                    <Text className="font-semibold">Next Action</Text>
                                    <Text className="line-clamp-none">{guest.nextAction}</Text>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                );
            }}
        </Formik>
    );
}
