import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSendOTPQuery, useValidateEmailOTPMutation } from '../../../store/services/account';
import { CELL_COUNT } from '../../../components/atoms/otp-input';
import Utils from '../../../utils';

const useWelcome = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);

    const [email, setEmail] = React.useState<string>('');
    const [otpValue, setOtpValue] = React.useState('');

    const hideModal = () => {
        (isError || isErrorValidate) && setModalVisible(false);
    };

    const { isLoading, error, isSuccess, isError, data } = useSendOTPQuery(email, {
        skip: !email,
    });

    const { navigate } = useNavigation();

    const [
        validateEmail,
        {
            data: validateData,
            error: validateError,
            isError: isErrorValidate,
            isSuccess: isSuccessValidate,
            isLoading: isLoadingValidate,
            reset,
        },
    ] = useValidateEmailOTPMutation();

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
                setOtpValue('');
                reset();
            }, 6000);
        }
        if (isSuccess) {
            setModalVisible(true);
            reset();
            setOtpValue('');
        }
    }, [isError, isSuccess]);

    React.useEffect(() => {
        if (isSuccessValidate) {
            setTimeout(() => {
                navigate('Register' as never, validateData as never);
            }, 2000);
            setTimeout(() => {
                setModalVisible(false);
            }, 3000);
        }
        if (isErrorValidate) {
            setTimeout(() => {
                setModalVisible(false);
            }, 3000);
        }
    }, [isErrorValidate, isSuccessValidate]);

    React.useEffect(() => {
        if (otpValue.length === CELL_COUNT) {
            validateEmail({ email: Utils.formatEmail(email), otp: +otpValue });
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

export default useWelcome;
