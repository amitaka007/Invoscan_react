import { API } from "@/Request";

export const getCreditsList = (companyId) => {
    return API.request({
        url: `stock-report/group-by-action-taken/${companyId}`,
        method: "GET"
    })
};

export const updateCredit = (stockItemId) => {
    return API.request({
        url: `stock-report/resolve/${stockItemId}?isResolved=true`,
        method: "PATCH"
    })
};