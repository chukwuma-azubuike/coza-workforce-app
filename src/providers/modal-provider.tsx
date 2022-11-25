import React from 'react';
import { IModalProps } from '../../types/app';
import useRootModal from '../hooks/modal/useRootModal';

export const ModalContext = React.createContext(null as unknown as IModalProps);

interface IModalProviderProps {
    children: any;
    modalState: Pick<
        IModalProps,
        'open' | 'render' | 'message' | 'setMessage' | 'showButton'
    >;
}

const ModalProvider = ({ modalState, children }: IModalProviderProps) => {
    const {
        render,
        message,
        button,
        showButton,
        modalOpen,
        setRender,
        setMessage,
        setModalOpen,
    } = useRootModal(modalState);

    return (
        <ModalContext.Provider
            value={{
                render,
                message,
                button,
                setRender,
                setMessage,
                showButton,
                open: modalOpen,
                handleOpen: setModalOpen,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export default ModalProvider;
