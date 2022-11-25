import React from 'react';

export interface IModalProps {
    open: boolean;
    message: string | null;
    render: React.ReactElement | JSX.Element | null;
    button: boolean;
    showButton: React.Dispatch<React.SetStateAction<boolean>>;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    handleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setRender: React.Dispatch<
        React.SetStateAction<React.ReactElement | JSX.Element | null>
    >;
}
