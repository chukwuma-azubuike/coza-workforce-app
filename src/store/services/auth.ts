import { createApi } from '@reduxjs/toolkit/query/react';
import {
    IDefaultResponse,
    ILoginPayload,
    IRegisterPayload,
    IUser,
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

export type IVerifyEmailOTPResponse = IDefaultResponse<IUser & IOTPResponse>;

export type ILoginResponse = IDefaultResponse<IUser>;

export type IRegisterResponse = IDefaultResponse<IUser>;

export const authServiceSlice = createApi({
    reducerPath: 'auth',

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        sendOTP: endpoint.query<ISendOTPResponse, string>({
            query: email => `/${SERVICE_URL}/send-otp/${email}`,
        }),

        validateEmailOTP: endpoint.query<
            IVerifyEmailOTPResponse,
            IVerifyEmailOTPPayload
        >({
            query: body => ({
                url: `/${SERVICE_URL}/validate-otp`,
                method: 'PATCH',
                body,
            }),
        }),

        login: endpoint.mutation<ILoginResponse, ILoginPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/login`,
                method: 'POST',
                body,
            }),
        }),

        register: endpoint.mutation<IRegisterResponse, IRegisterPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/register`,
                method: 'POST',
                body,
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
    useValidateEmailOTPQuery,
} = authServiceSlice;
