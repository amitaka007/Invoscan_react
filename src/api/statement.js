import { API } from "@/Request";

export const getStatementList = (companyId) => {
    return API.request({
        url: `statement/${companyId}`,
        method: "GET"
    })
};

export const deleteStatement = (statementId) => {
    return API.request({
        url: `statement-credit/delete/${statementId}`,
        method: "DELETE"
    })
};

export const deleteStatementInvoice = (deleteId) => {
    return API.request({
        url: `statement/delete/${deleteId}`,
        method: "DELETE"
    })
};

export const getStatementDetails = (id) => {
    return API.request({
        url: `statement-credit/statement/${id}`,
        method: "GET"
    })
};

export const uploadStatement = (url, data) => {
    return API.request({
        url: url,
        method: "POST",
        data
    })
};

export const markCompleteStatementInvoice = (invoiceId, data) => {
    return API.request({
        url: `statement-credit/resolve/${invoiceId}`,
        method: "PATCH",
        data
    })
};