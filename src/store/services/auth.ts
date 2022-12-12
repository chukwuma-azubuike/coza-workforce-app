import { createApi } from '@reduxjs/toolkit/query/react';
import Utils from '../../utils';
import {
    IRegisterPayload,
    IDefaultResponse,
    ILoginPayload,
    IUser,
    IToken,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'account';

export type ISendOTPResponse = IDefaultResponse<{
    isOTPSent: boolean;
    email: string;
}>;

export interface IVerifyEmailOTPPayload extends Pick<IUser, 'email'> {
    otp: number;
}

export interface IOTPResponse {
    __v: number;
    OTP: number;
    isExpired: boolean;
    createdAt: string;
    updatedAt: string;
}

export type IVerifyEmailOTPResponse = IDefaultResponse<{
    campusId: string;
    createdAt: string;
    department: {
        __v: number;
        _id: string;
        campusId: string;
        createdAt: string;
        departmentName: string;
        description: string;
    };
    email: string;
    firstName: string;
    gender: string;
    lastName: string;
    userId: string;
}>;

export type ILoginResponse = IDefaultResponse<{
    token: IToken;
    profile: IUser;
}>;

export type IRegisterResponse = IDefaultResponse<IUser>;

export const authServiceSlice = createApi({
    reducerPath: 'auth',

    tagTypes: ['Auth'],

    baseQuery: fetchUtils.baseQuery,

    // keepUnusedDataFor: 1,

    endpoints: endpoint => ({
        sendOTP: endpoint.query<ISendOTPResponse, string>({
            query: email => `/${SERVICE_URL}/send-otp/${email}`,
        }),

        validateEmailOTP: endpoint.mutation<
            IVerifyEmailOTPResponse,
            IVerifyEmailOTPPayload
        >({
            query: body => ({
                url: `/${SERVICE_URL}/validate-otp`,
                method: 'PATCH',
                body,
            }),

            transformResponse: (response: IVerifyEmailOTPResponse) => {
                const {
                    email,
                    gender,
                    campusId,
                    lastName,
                    firstName,
                    department: { _id, departmentName },
                } = response.data;

                return {
                    email,
                    gender,
                    campusId,
                    lastName,
                    firstName,
                    departmentName,
                    departmentId: _id,
                };
            },
        }),

        login: endpoint.mutation<ILoginResponse, ILoginPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/login`,
                method: 'POST',
                body,
            }),
            transformResponse: async (response: ILoginResponse) => {
                Utils.storeUserSession(response.data)
                    .then(() => {})
                    .catch(err => {});
                return response.data;
            },
        }),

        register: endpoint.mutation<IRegisterResponse, IRegisterPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/register`,
                method: 'POST',
                body: {
                    ...body,
                    pictureUrl: '',
                    roleId: '638a5f1e8eb1e1ef2b0be2a7',
                },
            }),
        }),
        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useSendOTPQuery,
    useLoginMutation,
    useRegisterMutation,
    useValidateEmailOTPMutation,
} = authServiceSlice;
