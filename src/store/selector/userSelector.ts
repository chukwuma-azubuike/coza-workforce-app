import React from 'react';
import store from '..';
import { accountServiceSlice } from '../services/account';

export const selectUserSlice =
    accountServiceSlice.endpoints.getUserById.select();

export const state = store.getState();
