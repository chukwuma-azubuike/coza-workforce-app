import React from 'react';
import messaging from '@react-native-firebase/messaging';
export interface IModalProps {
    modalState: IModalState;
    setModalState: React.Dispatch<React.SetStateAction<IModalState>>;
}

export interface IModalState {
    open?: boolean;
    button?: boolean;
    defaultRender?: boolean;
    message?: string | null;
    render?: React.ReactElement | JSX.Element | null;
    status?: 'success' | 'error' | 'info' | 'warning';
    duration?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export type RemoteMessage = Parameters<Parameters<ReturnType<typeof messaging>['onMessage']>[0]>[0];
