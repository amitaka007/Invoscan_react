import { API } from "@/Request";

export const getAllInvoices = () => {
    return API.request({
        url: 'stock/all',
        method: "GET"
    })
};

export const getPendingInvoices = (url = "") => {
    return API.request({
        url: url,
        method: "GET"
    })
};

export const getSupplierList = () => {
    return API.request({
        url: "supplier",
        method: "GET"
    })
};

export const uploadInvoice = (url = "", data) => {
    return API.request({
        url: url,
        method: "POST",
        data
    })
};

export const deleteInvoice = (invoiceId) => {
    return API.request({
        url: `stock/${invoiceId}`,
        method: "DELETE"
    })
};

export const markCompleteInvoice = (invoiceId, data) => {
    return API.request({
        url: `stock/update-stock/${invoiceId}`,
        method: "PATCH",
        data: data
    })
};