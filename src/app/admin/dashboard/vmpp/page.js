"use client";

import { upload_csv } from "@/api/csvUpload";
import { UploadCSV } from "../../adminComponents/UploadCSV";
import { toast } from "react-toastify";

const { useState } = require("react");

const Vmpp = () => {
    const [fileName, setFileName] = useState('');
    const [files, setFiles] = useState([]);
    const [thumbnail, setThumbnail] = useState('');

    const saveUploadedItem = async () => {
        let formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('file', files[index])
        }
        try{
            const response = await upload_csv(formData);
            toast.success("CSV File uploaded successfully");
            setFileName("");
            setFiles([]);
        } catch(error){
            console.log("CSV Upload error: ", error);
        }
    }

    const handleInputChange = (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            setThumbnail(URL.createObjectURL(file));
            setFileName(file ? file.name: "");
            setFiles(e.target.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
            setFileName(file.name);
            setFiles([file]);
        }
    };

    return (
        <UploadCSV
            title="VMPP"
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleInputChange={handleInputChange}
            saveUploadedItem={saveUploadedItem}
            fileName = {fileName}
            files={files}
        />
    )
}

export default Vmpp;