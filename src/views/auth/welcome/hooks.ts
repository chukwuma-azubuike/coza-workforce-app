import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    useSendOTPQuery,
    useValidateEmailOTPMutation,
} from '../../../store/services/auth';
import { CELL_COUNT } from '../../../components/atoms/otp-input';
import Utils from '../../../utils';

const useWelcome = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);

    const [email, setEmail] = React.useState<string>('');
    const [otpValue, setOtpValue] = React.useState('');

    const hideModal = () => {
        (isError || isErrorValidate) && setModalVisible(false);
    };

    const { isLoading, error, isSuccess, isError, data } = useSendOTPQuery(
        email,
        {
            skip: !email,
        }
    );

    const { navigate } = useNavigation();

    const [
        validateEmail,
        {
            data: validateData,
            error: validateError,
            isError: isErrorValidate,
            isSuccess: isSuccessValidate,
            isLoading: isLoadingValidate,
        },
    ] = useValidateEmailOTPMutation();

    const handleSubmit = (values: { email: string }) => {
        setEmail('');
        setEmail(values.email);
    };

    React.useEffect(() => {
        if (isError) {
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                setEmail('');
            }, 6000);
        }
        if (isSuccess) {
            setModalVisible(true);
        }
    }, [isError, isSuccess]);

    React.useEffect(() => {
        if (isSuccessValidate) {
            setTimeout(() => {
                navigate('Register', validateData);
            }, 2000);
        }
    }, [isErrorValidate, isSuccessValidate]);

    React.useEffect(() => {
        if (otpValue.length === CELL_COUNT)
            validateEmail({ email, otp: +otpValue });
    }, [otpValue]);

    React.useLayoutEffect(() => {
        Utils.retrieveUserSession().then(session => {
            if (session) {
                navigate('App');
            }
        });
    }, []);

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

const iss = {
    profile: {
        address: '18 Felix',
        birthDay: '1994-05-01T11:34:42.227Z',
        campus: {
            LGA: 'Ikeja LG',
            address: 'No. 20 Mobolaji Bank Anthony, Iekja, Lagos',
            campusName: 'Lagos Campus',
            country: 'Nigeria',
            createdAt: '2022-11-01T22:49:41.357Z',
            dateOfBirth: null,
            description:
                'This is the CommonWealth of Zion Assembly (COZA) Lagos campus',
            id: '6361a285832e7fbd65897cb7',
            location: [Object],
            state: 'Lagos',
        },
        createdAt: '2022-12-08T11:40:26.734Z',
        department: {
            __v: 0,
            _id: '63892f7e2acf9be9691d7236',
            campusId: '6361a285832e7fbd65897cb7',
            createdAt: '2022-12-01T22:49:34.404Z',
            departmentName: 'Witty',
            description: 'Witty Invention Department',
        },
        email: 'ranechopro@gmail.com',
        firstName: 'Chukwuma',
        gender: 'M',
        isActivated: true,
        isVerified: false,
        lastName: 'Azubuike',
        maritalStatus: 'SINGLE',
        nextOfKin: 'Chi',
        nextOfKinPhoneNo: '07033045884',
        occupation: 'Engineer',
        phoneNumber: '07085590939',
        pictureUrl: '',
        placeOfWork: 'AjoCard',
        role: {
            __v: 0,
            _id: '638a5f1e8eb1e1ef2b0be2a7',
            createdAt: '2022-12-02T20:25:02.831Z',
            description: 'Worker in the CommonWealth of Zion Assembly',
            name: 'Worker',
        },
        socialMedia: {
            facebook: '@chumiike',
            instagram: '@chumiike',
            twitter: '@chumiike',
        },
        userId: '6391cd2a073488539583a273',
    },
    token: {
        expiresIn: 86400,
        refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzOTFjZDJhMDczNDg4NTM5NTgzYTI3MyIsImVtYWlsIjoicmFuZWNob3Byb0BnbWFpbC5jb20iLCJyb2xlIjoiNjM4YTVmMWU4ZWIxZTFlZjJiMGJlMmE3IiwiaWF0IjoxNjcwNTIzMzM4LCJleHAiOjE2NzA2MDk3Mzh9.4kb3nCNyUgwPrYBmfShmkiVkRHLpDls2ZV37g8DNC_o',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzOTFjZDJhMDczNDg4NTM5NTgzYTI3MyIsImVtYWlsIjoicmFuZWNob3Byb0BnbWFpbC5jb20iLCJyb2xlIjoiNjM4YTVmMWU4ZWIxZTFlZjJiMGJlMmE3IiwiaWF0IjoxNjcwNTIzMzM4LCJleHAiOjE2NzA2MDk3Mzh9.4kb3nCNyUgwPrYBmfShmkiVkRHLpDls2ZV37g8DNC_o',
    },
};
