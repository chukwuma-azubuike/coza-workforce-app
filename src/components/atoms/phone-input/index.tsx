import { Icon } from '@rneui/base';
import { useFormikContext } from 'formik';
import { getCountryCallingCode } from 'libphonenumber-js';
import { Box, FormControl } from 'native-base';
import React from 'react';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import { THEME_CONFIG } from '../../../config/appConfig';
import { InputComponent } from '../input';

interface PhoneNumberInputProps {
    name: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = (props: any) => {
    const {
        field: { name, value },
        required,
        label,
    } = props;
    const formik = useFormikContext();
    const { setFieldValue, touched, errors } = formik;

    const [countryCode, setCountryCode] = React.useState<string>('US'); // default country code
    const [phone, setPhone] = React.useState<string>(''); // default country code

    const handleCountryCodeChange = (country: Country) => {
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
                    countryCode={countryCode}
                    withAlphaFilter
                    withCallingCode
                    withFlag
                    onSelect={handleCountryCodeChange}
                />
                <InputComponent
                    w="88%"
                    isRequired
                    onChangeText={handlePhoneNumberChange}
                    keyboardType="phone-pad"
                    placeholder="Eg: 07012345678"
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
