import React from 'react';
import { IModalProps, IModalState } from '../../types/app';
import useRootModal from '@hooks/modal/useRootModal';

export const ModalContext = React.createContext(null as unknown as IModalProps);

interface IModalProviderProps {
    children: any;
    initialModalState: IModalState;
}

const ModalProvider = ({ initialModalState, children }: IModalProviderProps) => {
    const { modalState, setModalState } = useRootModal(initialModalState);

    return (
        <ModalContext.Provider
            value={{
                modalState,
                setModalState,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export default ModalProvider;
