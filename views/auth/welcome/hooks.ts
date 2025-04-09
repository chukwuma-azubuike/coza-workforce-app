import React from 'react';
import { useSendOTPQuery, useValidateEmailOTPMutation } from '@store/services/account';
import Utils from '@utils/index';

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

    const [
        validateEmail,
        {
            data: validateData,
            error: validateError,
            isError: isErrorValidate,
            isSuccess: isSuccessValidate,
            isLoading: isLoadingValidate,
            reset: resetValidate,
        },
    ] = useValidateEmailOTPMutation();

    const handleSubmit = (values: { email: string }) => {
        if (validateData || validateError) resetValidate();

        setEmail(Utils.formatEmail(values.email));
    };

    return {
        handleSubmit,
        validateData,
        validateError,
        isErrorValidate,
        isSuccessValidate,
        isLoadingValidate,
        modalVisible,
        resetValidate,
        setModalVisible,
        otpValue,
        setOtpValue,
        isLoading,
        error,
        email,
        validateEmail,
        isSuccess,
        isError,
        data,
        hideModal,
    };
};

export default useWelcome;
