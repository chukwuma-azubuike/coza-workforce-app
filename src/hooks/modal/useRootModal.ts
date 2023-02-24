import React from 'react';
import { IModalState } from '../../../types/app';

const useRootModal = (initialModalState: IModalState) => {
    const [modalState, setModalState] = React.useState<IModalState>(initialModalState);

    return {
        modalState,
        setModalState,
    };
};

export default useRootModal;
