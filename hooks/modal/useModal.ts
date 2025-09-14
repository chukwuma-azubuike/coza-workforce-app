import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { appActions, appSelectors } from '~/store/actions/app';
import { IModalState } from '~/types/app';

const useModal = () => {
    const dispatch = useAppDispatch();
    const modalState = useAppSelector(store => appSelectors.selectToast(store));

    const setModalState = (state: IModalState) => {
        dispatch(appActions.toast(state));
    };

    return {
        modalState,
        setModalState,
    };
};

export default useModal;
