import React from 'react';

export interface IModalProps {
    modalState: IModalState;
    setModalState: React.Dispatch<React.SetStateAction<IModalState>>;
}

export interface IModalState {
    open?: boolean;
    button?: boolean;
    message?: string | null;
    render?: React.ReactElement | JSX.Element | null;
    duration?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}
