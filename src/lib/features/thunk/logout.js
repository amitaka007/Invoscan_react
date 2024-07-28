"use client";
import storage from "@/lib/store";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const logout = createAsyncThunk("user/logout", async(data, thunkAPI) => {
    try{
        await storage.removeItem("token");
        return null;
    }catch(error){
        return thunkAPI.rejectWithValue(error);
    }
});


// if(window?.location?.pathname){
//     const path = window.location.pathname;
//     if(path.includes("/admin/dashboard")){
        
//     }
// }