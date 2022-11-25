import React from 'react';
import { ModalContext } from '../../providers/modal-provider';

const useModal = () => React.useContext(ModalContext);

export default useModal;
