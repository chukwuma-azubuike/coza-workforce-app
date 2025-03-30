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

    // React.useEffect(() => {
    //     if (isError) {
    //         setModalVisible(true);
    //         setTimeout(() => {
    //             setModalVisible(false);
    //             setEmail('');
    //             setOtpValue('');
    //         }, 6000);
    //         resetValidate();
    //     }
    //     if (isSuccess) {
    //         setModalVisible(true);
    //         setOtpValue('');
    //     }
    // }, [isError, isSuccess]);

    // React.useEffect(() => {
    //     if (isSuccessValidate) {
    //         setTimeout(() => {
    //             navigate('Register' as never, validateData as never);
    //         }, 2000);
    //         setTimeout(() => {
    //             setModalVisible(false);
    //         }, 3000);
    //     }
    //     if (isErrorValidate) {
    //         setTimeout(() => {
    //             setModalVisible(false);
    //         }, 3000);
    //     }
    // }, [isErrorValidate, isSuccessValidate]);

    // React.useEffect(() => {
    //     if (otpValue.length === CELL_COUNT) {
    //         validateEmail({ email: Utils.formatEmail(email), otp: +otpValue });
    //     }
    // }, [otpValue]);

    // interface PK {
    //     data: { data: null; isError: true; isSuccessful: false; message: 'no valid token '; status: 400 };
    //     status: 500;
    // }

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
