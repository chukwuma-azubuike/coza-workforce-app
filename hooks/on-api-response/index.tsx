import { PayloadAction } from '@reduxjs/toolkit';
import { QueryStatus } from '@reduxjs/toolkit/dist/query';
import React from 'react';
import { useAppDispatch } from '@store/hooks';
import useModal from '../modal/useModal';

export interface IOnApiResponseProps {
    data?: any;
    error: any;
    notify?: boolean;
    isError: boolean;
    isSuccess: boolean;
    isLoading?: boolean;
    status: QueryStatus;
    failureCallback?: (args: any) => void;
    successCallback?: (args: any) => void;
    failureActions?: PayloadAction<any | undefined, string> | PayloadAction<any | undefined, string>[];
    successActions?: PayloadAction<any | undefined, string> | PayloadAction<any | undefined, string>[];
}

const useOnApiResponse = (props: IOnApiResponseProps) => {
    const {
        data,
        error,
        isError,
        isSuccess,
        isLoading,
        failureActions,
        successActions,
        notify = true,
        failureCallback,
        successCallback,
    } = props;

    const { setModalState } = useModal();
    const dispatch = useAppDispatch();

    // Callbacks are usually inline literals at the call site; holding them in a ref keeps them out
    // of the dependency array so the effect fires once per response instead of once per render.
    const callbacks = React.useRef({ failureCallback, successCallback });
    callbacks.current = { failureCallback, successCallback };

    React.useEffect(() => {
        const { failureCallback, successCallback } = callbacks.current;

        if (isError) {
            {
                notify &&
                    setModalState({
                        defaultRender: true,
                        status: error?.error ? 'error' : 'info',
                        message: error?.data?.data?.message || error?.error || 'Something went wrong',
                    });
            }

            failureCallback && failureCallback(error);

            if (Array.isArray(failureActions)) {
                failureActions.map(action => dispatch(action));
            } else if (typeof failureActions === 'object') {
                dispatch(failureActions);
            }
        }

        if (isSuccess) {
            if (data) {
                {
                    notify &&
                        setModalState({
                            status: 'success',
                            defaultRender: true,
                            message: data.message,
                        });
                }

                successCallback && successCallback(data);

                if (Array.isArray(successActions)) {
                    successActions.map(action => dispatch(action));
                } else if (typeof successActions === 'object') {
                    dispatch(successActions);
                }
            }
        }
    }, [isError, isSuccess, data, error]);

    return {
        data,
        error,
        notify,
        isError,
        isSuccess,
        isLoading,
        failureActions,
        successActions,
        failureCallback,
        successCallback,
    };
};

export default useOnApiResponse;
