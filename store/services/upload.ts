import { Dispatch, SetStateAction } from 'react';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Dispatch as ReduxDispatch } from '@reduxjs/toolkit';

import { IDefaultResponse, REST_API_VERBS } from '@store/types';
import APP_ENV from '@config/envConfig';

type IUploadResponse = IDefaultResponse<{}>; // TODO: Update once upload endpoint is available
type IGenerateUploadURLResponse = IDefaultResponse<string>;
interface IUploadPayload {
    id?: string;
    file?: ArrayBuffer | Blob | string;
    url: string;
    dispatch?: ReduxDispatch; // Passed as a return from useDispatch hook in React component
    setProgress?: Dispatch<SetStateAction<number>>;
    description?: string;
    contentType?: string;
}

interface IGenerateS3UrlPayload {
    bucketName: string;
    objectKey: string;
    expirySeconds?: number;
}

const SERVICE_URL = 'uploadApi';

const { API_BASE_URL } = APP_ENV;

export const uploadServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    tagTypes: [SERVICE_URL],

    baseQuery: fetchBaseQuery({ baseUrl: '' }),

    endpoints: builder => ({
        generateUploadUrl: builder.mutation<string, IGenerateS3UrlPayload>({
            query: ({ ...body }) => ({
                url: `${API_BASE_URL}/aws/s3`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IGenerateUploadURLResponse) => response?.data,
        }),

        upload: builder.mutation<IUploadResponse, IUploadPayload>({
            query: ({ id, file, url, dispatch, setProgress, contentType, description }) => ({
                url,
                body: file,
                method: REST_API_VERBS.PUT,
                headers: { 'Content-Type': contentType },

                // TODO: For axios base query
                // Capture upload progress
                // onUploadProgress({ loaded, total }) {
                //     if (total) {
                //         const progress = Math.round((loaded * 100) / total);

                //         if (setProgress) {
                //             setProgress(progress);
                //         }

                //         if (dispatch && id) {
                //             dispatch(uploadActions.updateProgress({ id, total, loaded, description }));
                //         }
                //     }
                // },
            }),

            transformResponse: (response: IUploadResponse) => response,
        }),
    }),
});

// Use exported hook in relevant components
export const { useGenerateUploadUrlMutation, useUploadMutation } = uploadServiceSlice;
