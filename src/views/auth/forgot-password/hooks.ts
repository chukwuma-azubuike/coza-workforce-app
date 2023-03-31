import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSendForgotPasswordOTPQuery, useValidateForgotPasswordOTPMutation } from '../../../store/services/account';
import { CELL_COUNT } from '../../../components/atoms/otp-input';
import Utils from '../../../utils';

const useForgotPassword = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);

    const [email, setEmail] = React.useState<string>('');
    const [otpValue, setOtpValue] = React.useState('');

    const hideModal = () => {
        (isError || isErrorValidate) && setModalVisible(false);
    };

    const { isLoading, error, isSuccess, isError, data } = useSendForgotPasswordOTPQuery(email, {
        skip: !email,
    });

    const { navigate } = useNavigation();

    const [
        validateForgotPasswordOTP,
        {
            reset: validateReset,
            data: validateData,
            error: validateError,
            isError: isErrorValidate,
            isSuccess: isSuccessValidate,
            isLoading: isLoadingValidate,
        },
    ] = useValidateForgotPasswordOTPMutation();

    const handleSubmit = (values: { email: string }) => {
        setEmail('');
        setEmail(Utils.formatEmail(values.email));
    };

    React.useEffect(() => {
        if (isError) {
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                setEmail('');
            }, 6000);
            setOtpValue('');
        }
        if (isSuccess) {
            setModalVisible(true);
        }
    }, [isError, isSuccess]);

    React.useEffect(() => {
        if (isSuccessValidate) {
            navigate('Reset Password' as never, validateData as never);
            setModalVisible(false);
            validateReset();
        }
        if (isErrorValidate) {
            setTimeout(() => {
                setModalVisible(false);
                validateReset();
            }, 3000);
        }
    }, [isErrorValidate, isSuccessValidate]);

    React.useEffect(() => {
        if (otpValue.length === CELL_COUNT) {
            validateForgotPasswordOTP({ email, otp: +otpValue });
        }
    }, [otpValue]);

    return {
        handleSubmit,
        validateData,
        validateError,
        isErrorValidate,
        isSuccessValidate,
        isLoadingValidate,
        modalVisible,
        setModalVisible,
        otpValue,
        setOtpValue,
        isLoading,
        error,
        isSuccess,
        isError,
        data,
        hideModal,
    };
};

export default useForgotPassword;
