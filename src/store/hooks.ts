import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { IAppDispatch, IStore } from '.';

export const useAppDispatch = () => useDispatch<IAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<IStore> = useSelector;
