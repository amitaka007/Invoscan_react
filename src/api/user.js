import { API } from "@/Request";

export const login = (data) => API.request({
    url: 'auth/login',
    method: "POST",
    data
});

export const usersList = (data) => {
    return API.request({
        url: 'user/all',
        method: "GET",
        data
    })
};

export const AddUsers = (data) =>{
    return API.request({
        url:"user/create",
        method:"POST",
        data
    })
} 

export const addCompany = (data) =>{
    return API.request({
        url:"company/create",
        method:"POST",
        data
    })
} 


export const CompaniesList = (id) => {
    return API.request({
        url: `company/user/${id}`,
        method: "GET"
    })
};
export const deleteCompany = (id) => {
    return API.request({
        url: `company/${id}`,
        method: "DELETE"
    })
};

export const master_csv = (name) => {
    return API.request({
        url: `csv?search=${name}`,
    method: "GET"
})}

export const master_csvDelete = (id) => {
    return API.request({
        url: `csv/${id}`,
        method: "DELETE"
    })
}

export const master_csvEdit = (id, data) => {
    return API.request({
        url: `csv/${id}`,
        method: "PATCH",
        data: data
    })
}

export const concessionList = () => {
    return API.request({
        url: "concession",
        method: "GET"
    })
}

export const upload_csv = (file, type = "masterCSV") => {
    const masterCSV = "masterCSV";
    return API.request({
        url: (type === masterCSV)? 'form/upload-csv' : 'concession/upload',
        method: "POST",
        data: file
    })
}
