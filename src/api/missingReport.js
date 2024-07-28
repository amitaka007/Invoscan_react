import { API } from "@/Request";

export const getMissingReport = () => {
    return API.request({
        url: 'missing',
        method: "GET"
    })
};


export const deleteMissingReport = (id) => {
    return API.request({
        url: `missing/${id}`,
        method: "DELETE"
    })
};

export const resolveMissingReport = (id) => {
    return API.request({
        url: `missing/${id}?isResolved=true`,
        method: "PATCH"
    })
};
