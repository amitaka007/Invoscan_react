"use client"

import { useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";

import CustomForm from "@/components/CustomForm";
// import { logout } from "@/lib/features/thunk/logout";

const AdminLogin = ()=> {
    return(
        <div>
            <CustomForm type={"admin"}/>
        </div>
    )
}

export default AdminLogin;