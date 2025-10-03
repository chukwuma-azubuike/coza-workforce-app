import { createApi } from '@reduxjs/toolkit/query/react';
import Utils from '@utils/index';
import {
    IRegisterPayload,
    IDefaultResponse,
    ILoginPayload,
    IUser,
    IToken,
    REST_API_VERBS,
    IDepartment,
    IDefaultQueryParams,
    IEditProfilePayload,
    ICreateUserPayload,
    ICampusUserData,
    IAssignSecondaryRole,
} from '../types';
import { fetchUtils } from './fetch-utils';
import { Platform } from 'react-native';

const SERVICE_URL = 'account';
const USER_SERVICE_URL = 'users';

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
    roleId: string;
}>;

export interface IVerifyForgotPassword {
    OTP: number;
    isUsed: boolean;
    _id: IUser['_id'];
    createdAt: string;
    updatedAt: string;
    email: IUser['email'];
}

export type IVerifyForgotPasswordOTPResponse = IDefaultResponse<IVerifyForgotPassword>;

export interface IResetPasswordPayload {
    OTP: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface IVerifyEmailResponseTransform {
    email: string;
    gender: string;
    campusId: string;
    lastName: string;
    firstName: string;
    departmentName: string;
    departmentId: string;
}

export interface IGlobalWorkforceSummary {
    activeUser: number;
    campusCount: number;
    inactiveUser: number;
    blacklistedUsers: number;
    UnregisteredUsers: number;
    totalUsers: number;
    dormantUsers: number;
    campusWorfForce: ICampusWorkforceSummary[];
}

export interface ICampusWorkforceSummary {
    campusId: string;
    campusName: string;
    userCount: number;
}

export type ILoginResponse = IDefaultResponse<{
    token: IToken;
    profile: IUser;
}>;

export interface IAddNotificationTokenPayload {
    email: string;
    deviceId: string;
    fcmToken?: string;
    appVersion: string;
    expoPushToken: string;
    platform: Platform['OS'];
}

export type IRegisterResponse = IDefaultResponse<IUser>;
export type IGetUserByIdResponse = IDefaultResponse<IUser>;

export const accountServiceSlice = createApi({
    reducerPath: 'account',

    tagTypes: ['account', 'CampusSummaryByCampusId', 'userDetails', 'listOfDepartmentUsers', 'globalWorkforceSummary'],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        /*********** Authentication **********/

        sendOTP: endpoint.query<ISendOTPResponse, string>({
            query: email => `/${SERVICE_URL}/send-otp/${email}`,
        }),

        validateEmailOTP: endpoint.mutation<IVerifyEmailResponseTransform, IVerifyEmailOTPPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/validate-otp`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: IVerifyEmailOTPResponse) => {
                const {
                    email,
                    roleId,
                    gender,
                    campusId,
                    lastName,
                    firstName,
                    department: { _id, departmentName },
                } = response.data;

                return {
                    email,
                    gender,
                    roleId,
                    campusId,
                    lastName,
                    firstName,
                    departmentName,
                    departmentId: _id,
                };
            },
        }),

        login: endpoint.mutation<
            {
                token: IToken;
                profile: IUser;
            },
            ILoginPayload
        >({
            query: body => ({
                url: `/${SERVICE_URL}/login`,
                method: REST_API_VERBS.POST,
                body,
            }),
            transformResponse: async (response: ILoginResponse) => {
                Utils.storeUserSession(response.data)
                    .then(() => {})
                    .catch(err => {});
                return response.data;
            },

            invalidatesTags: ['userDetails'],
        }),

        register: endpoint.mutation<IRegisterResponse, IRegisterPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/register`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        createUser: endpoint.mutation<IRegisterResponse, IRegisterPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createUser`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: ['listOfDepartmentUsers', 'globalWorkforceSummary'],
        }),

        uploadUser: endpoint.mutation<IRegisterResponse, ICreateUserPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createUploadedUser`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: ['listOfDepartmentUsers', 'CampusSummaryByCampusId'],
        }),

        updateUser: endpoint.mutation<IRegisterResponse, IEditProfilePayload>({
            query: body => ({
                url: `/${SERVICE_URL}/update/${body._id}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            // Add optimistic updates
            async onQueryStarted(patch, { dispatch, queryFulfilled, getState }) {
                // Get the current cache key for user details
                const patchResult = dispatch(
                    accountServiceSlice.util.updateQueryData('getUserById', patch?._id as string, draft => {
                        // Update the draft with new values
                        Object.assign(draft, patch);
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    // If the mutation fails, revert the optimistic update
                    patchResult.undo();
                }
            },

            invalidatesTags: [
                'listOfDepartmentUsers',
                'CampusSummaryByCampusId',
                'globalWorkforceSummary',
                'userDetails',
            ],
        }),

        deleteUser: endpoint.mutation<IUser, string>({
            query: email => ({
                url: `/${SERVICE_URL}/delete/${email}`,
                method: REST_API_VERBS.DELETE,
            }),

            invalidatesTags: ['listOfDepartmentUsers', 'CampusSummaryByCampusId', 'globalWorkforceSummary'],
        }),

        sendForgotPasswordOTP: endpoint.query<ISendOTPResponse, string>({
            query: email => `/${SERVICE_URL}/forget-password/otp/${email}`,
        }),

        validateForgotPasswordOTP: endpoint.mutation<IVerifyForgotPassword, IVerifyEmailOTPPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/forget-password/validate`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: IVerifyForgotPasswordOTPResponse) => response.data,
        }),

        resetPassword: endpoint.mutation<IUser, IResetPasswordPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/forget-password/${body.OTP}`,
                method: REST_API_VERBS.POST,
                body: {
                    email: body.email,
                    password: body.password,
                },
            }),
        }),

        /*********** User **********/

        getUserById: endpoint.query<IUser, string>({
            query: _id => ({
                url: `/${SERVICE_URL}/user/${_id}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: async (response: IGetUserByIdResponse) => response.data,

            providesTags: ['userDetails'],
        }),

        getUsersByDepartmentId: endpoint.query<IUser[], IDepartment['_id']>({
            query: _id => ({
                url: `/${USER_SERVICE_URL}/getUsers`,
                params: { departmentId: _id },
            }),

            providesTags: ['listOfDepartmentUsers'],

            transformResponse: (response: IDefaultResponse<IUser[]>) => response.data,
        }),
        getCampusSummaryByCampusId: endpoint.query<ICampusUserData, string>({
            query: campusId => ({
                url: `/${USER_SERVICE_URL}/campus`,
                method: REST_API_VERBS.GET,
                params: { campusId },
            }),

            providesTags: ['CampusSummaryByCampusId', 'listOfDepartmentUsers'],

            transformResponse: (response: IDefaultResponse<ICampusUserData>) => response.data,
        }),

        getUsers: endpoint.query<IUser[], IDefaultQueryParams>({
            query: params => ({
                url: `/${USER_SERVICE_URL}/getUsers`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: ['listOfDepartmentUsers', 'CampusSummaryByCampusId'],

            transformResponse: (response: IDefaultResponse<IUser[]>) => response.data,
        }),

        getGlobalWorkForceSummary: endpoint.query<IGlobalWorkforceSummary, void>({
            query: () => ({
                url: `/${USER_SERVICE_URL}/globalForce`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['globalWorkforceSummary'],

            transformResponse: (response: IDefaultResponse<IGlobalWorkforceSummary>) => response.data,
        }),

        assignSecondaryRoles: endpoint.mutation<any, IAssignSecondaryRole>({
            query: body => ({
                url: `${USER_SERVICE_URL}/addSecondaryDepartment/${body.userId}`,
                method: REST_API_VERBS.PATCH,
                body: {
                    departments: body.departments,
                    roleId: body.roleId,
                },
            }),
        }),

        addDeviceToken: endpoint.mutation<any, IAddNotificationTokenPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/addDeviceToken`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<any>) => response.data,
        }),

        getGroupHeadUsers: endpoint.query<IUser[], IDefaultQueryParams>({
            query: params => ({
                url: `/gh/users/`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (response: IDefaultResponse<IUser[]>) => response.data,
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useSendOTPQuery,
    useLazySendOTPQuery,
    useGetUsersQuery,
    useLoginMutation,
    useRegisterMutation,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useResetPasswordMutation,
    useValidateEmailOTPMutation,
    useLazySendForgotPasswordOTPQuery,
    useGetUsersByDepartmentIdQuery,
    useGetGlobalWorkForceSummaryQuery,
    useGetCampusSummaryByCampusIdQuery,
    useValidateForgotPasswordOTPMutation,
    useUploadUserMutation,
    useAssignSecondaryRolesMutation,
    useAddDeviceTokenMutation,
    useGetGroupHeadUsersQuery,
} = accountServiceSlice;
