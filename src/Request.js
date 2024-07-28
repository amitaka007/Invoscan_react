"use client";
import axios from 'axios';
import { toast } from 'react-toastify';

export const baseUrl = 'http://18.130.0.242:4000/api/';

export const API = axios.create({
    baseURL: baseUrl
})

export const siteURL = baseUrl;
export const fileURL = baseUrl + 'uploads/';

function show() {
    document.getElementById("ajax-loader").style.display = "block";
}

function hide() {
    document.getElementById("ajax-loader").style.display = "none";
}

API.interceptors.request.use(
    async(config) => {
        const { storage } = require("./lib/store");
        show();
        const accessToken = await storage.getItem("token");
        if(accessToken && config?.url !== "auth/login"){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        hide();
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => {
        // const { interceptLoading } = require("../src/lib/store");
        // interceptLoading(false);
        hide();
        return response;
    },
    async(error) => {
        const { makeStore, storage } = require("../src/lib/store");
        const { userActions } = require("../src/lib/features/slice/userSlice");
        // interceptLoading(false);
        hide()
        const config = error?.response?.config;
        const status = error?.response?.status;
        if(error?.response?.data?.message){
            toast.error(error?.response?.data?.message);
        }else if(error?.message){
            toast.error(error?.message)
        }
        if((status === 401) || (status === 403) || (status === 451)){
            const store = makeStore();
            await storage.removeItem("token")
            if(window?.location?.pathname){
                const path = window.location.pathname;
                if(path.includes("/admin")){
                    window.location.replace("/admin");
                }else{
                    window.location.replace("/");
                }
            }
            if(config?.url !== 'auth/login'){
                toast.warning("Session expired");
            }
            store.dispatch(userActions.setAuthentication(false));
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);