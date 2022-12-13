import React from 'react';
import { createSelector } from '@reduxjs/toolkit';
import store from '..';
import { authServiceSlice } from '../services/account';

export const selectUserSlice = authServiceSlice.endpoints.login.select();

export const selectCurrentUser = createSelector(
    selectUserSlice,
    userSession => userSession.data?.data.profile
);

export const selectCurrentUserRole = createSelector(
    selectCurrentUser,
    currentUser => currentUser?.role.name
);

export const state = store.getState();
