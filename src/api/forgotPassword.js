import { API } from "@/Request"

export const choosePassword = (data) => {
    return API.request({
        url:"auth/choose-password",
        method:"POST",
        data
    })
}

export const forgotPassword = (data) => {
    return API.request({
        url:"auth/forgot-password",
        method:"POST",
        data
    })
}