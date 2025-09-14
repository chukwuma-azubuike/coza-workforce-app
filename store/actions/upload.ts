import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface IUploadProgress {
    id: string;
    total: number;
    loaded: number;
    description?: string;
}

export interface IUploadState {
    progress: Record<string, Omit<IUploadProgress, 'id'> & { percentageProgress: number }>;
}

const initialState: IUploadState = {
    progress: {},
};

const uploadSlice = createSlice({
    name: 'uploads',

    initialState,

    reducers: {
        updateProgress(state, { payload }: PayloadAction<IUploadProgress>) {
            const { id, total, loaded, description } = payload;
            const percentageProgress = Math.round((loaded * 100) / total);

            state.progress[id] = {
                total,
                loaded,
                description,
                percentageProgress,
            };
        },
    },
});

const { actions } = uploadSlice;

export const uploadActions = actions;

export default uploadSlice;
