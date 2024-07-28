"use client";
import { login } from "@/api/user";
import { getCompanyList } from "@/api/company";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const userLogin = createAsyncThunk("user/userLogin", async(data, thunkAPI) => {
    try{
        const response = await login(data);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error);
    }
});

export const userCompanyList = createAsyncThunk("user/userCompanyList", async(id, thunkAPI) => {
    try{
        const response = await getCompanyList(id);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error);
    }
});