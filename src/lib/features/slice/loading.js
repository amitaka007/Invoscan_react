"use client";
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
    status: false
}

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            console.log("#@#@ LOADING: ", action.payload);
            return {
                ...state,
                status: action.payload
            };
        }
    }
});

export const loadingActions = loadingSlice.actions;

export default loadingSlice;