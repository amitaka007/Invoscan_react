import { API } from "@/Request"

export const upload_csv = (file, type = "vmpp") => {
    return API.request({
        // url: (type === "vmpp")? 'vmpp/upload' : 'ampp/upload',
        url: `${type}/upload`,
        method: "POST",
        data: file
    })
}