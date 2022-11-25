import React from 'react';
import { IModalProps } from '../../../types/app';

const useRootModal = (
    modalState: Pick<IModalProps, 'open' | 'render' | 'message'>
) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(modalState.open);
    const [render, setRender] = React.useState<any>(modalState.render);
    const [message, setMessage] = React.useState<any>(modalState.message);
    const [button, showButton] = React.useState<boolean>(true);

    return {
        render,
        button,
        message,
        setRender,
        modalOpen,
        showButton,
        setMessage,
        setModalOpen,
    };
};

export default useRootModal;
