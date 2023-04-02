import { Platform, NativeModules } from 'react-native';
import { Icon } from '@rneui/base';
import { useFormikContext } from 'formik';
import { getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { Box, FormControl } from 'native-base';
import React from 'react';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import { THEME_CONFIG } from '../../../config/appConfig';
import { InputComponent } from '../input';

const deviceLanguage =
    Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier;

const deviceCountryCode = deviceLanguage.split('_')[1];

interface PhoneNumberInputProps {
    name: string;
    label: string;
    required: boolean;
    field: { name: string; value: any };
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = props => {
    const {
        field: { name, value },
        required,
        label,
    } = props;

    const formik = useFormikContext<any>();
    const { setFieldValue, touched, errors } = formik;

    const [countryCode, setCountryCode] = React.useState<CountryCode>(deviceCountryCode); // default country code
    const [phone, setPhone] = React.useState<string>(''); // default country code

    const handleCountryCodeChange = (country: { cca2: CountryCode }) => {
        setCountryCode(country.cca2);
        setFieldValue(name, `+${getCountryCallingCode(country.cca2)}${phone}`);
    };

    const handlePhoneNumberChange = (phoneNumber: string) => {
        setPhone(phoneNumber);
        setFieldValue(name, `+${getCountryCallingCode(countryCode)}${phoneNumber}`);
    };

    const hasError = touched[name] && !!errors[name];

    return (
        <FormControl isRequired isInvalid={hasError}>
            <FormControl.Label>{label}</FormControl.Label>
            <Box w="100%" flexDirection="row" alignItems="center" borderRadius={THEME_CONFIG.borderRadius}>
                <CountryPicker
                    withFlag
                    withAlphaFilter
                    withCallingCode
                    countryCode={countryCode as any}
                    onSelect={handleCountryCodeChange as (country: Country) => void}
                />
                <InputComponent
                    w="89%"
                    isRequired
                    keyboardType="phone-pad"
                    placeholder="Eg: 07012345678"
                    onChangeText={handlePhoneNumberChange}
                />
            </Box>
            <FormControl.ErrorMessage
                fontSize="2xl"
                mt={3}
                leftIcon={<Icon size={16} name="warning" type="antdesign" color={THEME_CONFIG.error} />}
            >
                {required && !value ? `${label ?? 'This field'} is required` : errors[name]}
            </FormControl.ErrorMessage>
        </FormControl>
    );
};

export default PhoneNumberInput;
