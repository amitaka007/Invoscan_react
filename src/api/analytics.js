import { API } from "@/Request";

export const getAnalyticsList = (analyticsId) => {
    return API.request({
        url: `stock/stock-by-company/${analyticsId}`,
        method: "GET"
    })
};

export const getAnalyticsData = (companyId, data) => {
    return API.request({
        url: `stock/filter-stock/${companyId}`,
        method: "POST",
        data
    })
};

export const getStocksAnalytics = (companyId,data) => {
    return API.request({
        url: `stock/get-stocks/${companyId}`,
        method: "POST",
        data
    })
};