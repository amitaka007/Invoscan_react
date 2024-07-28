import { API } from "@/Request";

export const getCompanyList = (userId) => {
    return API.request({
        url: `company/user/${userId}`,
        method: "GET"
    })
};