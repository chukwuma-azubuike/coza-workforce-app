import React from 'react';
import { createSelector } from '@reduxjs/toolkit';
import store from '..';
import { accountServiceSlice } from '../services/account';

export const selectUserSlice =
    accountServiceSlice.endpoints.getUserById.select();

export const selectCurrentUser = createSelector(
    selectUserSlice,
    userSession => userSession.data
);

export const selectCurrentUserRole = createSelector(
    selectCurrentUser,
    currentUser => currentUser?.role.name
);

export const state = store.getState();
