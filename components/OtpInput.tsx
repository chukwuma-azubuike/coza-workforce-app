import { OtpInputProps, OtpInput as RNOtpInput } from 'react-native-otp-entry';
import { StyleSheet } from 'react-native';
import { THEME_CONFIG } from '~/config/appConfig';
import { Colors } from '~/constants/Colors';
import { useColorScheme } from '~/lib/useColorScheme';

const OtpInput: React.FC<OtpInputProps> = props => {
    const { isDarkColorScheme } = useColorScheme();
    return (
        <RNOtpInput
            numberOfDigits={6}
            focusColor={Colors.primary}
            autoFocus={true}
            hideStick={true}
            blurOnFilled={true}
            type="numeric"
            secureTextEntry={false}
            focusStickBlinkingDuration={500}
            textInputProps={{
                accessibilityLabel: 'One-Time Password',
            }}
            theme={{
                containerStyle: OTPstyles.container,
                pinCodeContainerStyle: OTPstyles.pinCodeContainer,
                pinCodeTextStyle: isDarkColorScheme ? OTPstyles.pinCodeTextDark : OTPstyles.pinCodeText,
                focusStickStyle: OTPstyles.focusStick,
                focusedPinCodeContainerStyle: OTPstyles.activePinCodeContainer,
                placeholderTextStyle: OTPstyles.placeholderText,
                filledPinCodeContainerStyle: OTPstyles.filledPinCodeContainer,
                disabledPinCodeContainerStyle: isDarkColorScheme
                    ? OTPstyles.disabledPinCodeDarkContainer
                    : OTPstyles.disabledPinCodeContainer,
            }}
            {...props}
        />
    );
};

export default OtpInput;

export const OTPstyles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    container: {
        width: '100%',
    },
    pinCodeContainer: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    pinCodeText: {
        fontSize: 22,
        color: '#000',
    },
    pinCodeTextDark: {
        fontSize: 22,
        color: '#FFF',
    },
    focusStick: {
        width: 2,
        height: 30,
        backgroundColor: THEME_CONFIG.primary,
    },
    activePinCodeContainer: {
        borderColor: THEME_CONFIG.primary,
    },
    placeholderText: {
        color: '#ccc',
    },
    filledPinCodeContainer: {
        borderColor: THEME_CONFIG.primary,
    },
    disabledPinCodeContainer: {
        backgroundColor: THEME_CONFIG.veryLightGray,
        borderColor: THEME_CONFIG.lightGray,
    },
    disabledPinCodeDarkContainer: {
        backgroundColor: THEME_CONFIG.darkGray,
        borderColor: THEME_CONFIG.gray,
        color: THEME_CONFIG.gray,
    },
});
