import React from 'react';

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

export interface INGState {
    state: {
        name: string;
        id: number;
        locals: [{ name: string; id: number }];
    };
}

export interface ICountry {
    arcs: number[][];
    type: string;
    properties: { name: string; 'Alpha-2': string };
    id: string;
}
