"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import FeatherIcon from "feather-icons-react";
import {debounce} from "lodash";
import { toast } from 'react-toastify';

import { master_csv, master_csvDelete, master_csvEdit, upload_csv } from "../../../../api/user";
import useDebounce from "@/hooks/useDebounce";
import { Search } from "../../adminComponents/Search";
import ConfirmDeleteModal from "../../adminComponents/ConfirmDeleteModal";
import EditModal from "../../adminComponents/EditModal";
import { UploadCSV } from "../../adminComponents/UploadCSV";
import { FilteredDataTable } from "@/components/FilteredDataTable";
import { useSelector } from "react-redux";

const MasterCsv = ()=> {
    const { status: loading } = useSelector((state) => state.loading);
    const [data, setData] = useState([])
    const [totalRows, setTotalRows] = useState(0);
    const [fileName, setFileName] = useState('');
    const [files, setFiles] = useState([]);
    const [thumbnail, setThumbnail] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const productColumns = ["pack_size", "company", "product_name", "concessionPrice", "price"]
    let columns = [
        {
            name: 'Pack Size',
            selector: row => row.pack_size,
        },
        {
            name: 'Company',
            // selector: row => (row.supplier && row.supplier.name ? row.supplier.name : 'NA'),
            selector: row => row.company,
        },
        {
            name: 'Product Name',
            selector: row => row.product_name,
        },
        // {
        //     name: 'DT Price',
        //     selector: row => (row.dtprice ? ),
        // },
        {
            name: 'Concession Price',
            selector: row => (row.concessionPrice ? row.concessionPrice : "NA"),
        },
        {
            name: 'Price',
            selector: row => row.price,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <button
                        onClick={(e) => {
                            setSelectedProduct(row);
                            setShowEditModal(!showEditModal);
                            console.log("@@@@ ROW: ", row);
                        }}
                    >
                        <FeatherIcon icon="edit-3" className='menu-icon' />
                    </button>
                    <button
                        onClick={(e) => {
                            setSelectedProduct(row);
                            setShowDeleteModal(!showDeleteModal)
                        }}
                    >
                        <i className='bx bx-trash menu-icon menu-icon-red'></i>
                    </button>
                </div>
            )
        },
    ]
    let customStyles = {
        headRow: {
            style: {
                border: 'none',
            },
        },
        headCells: {
            style: {
                color: '#202124',
                fontSize: '14px',
            },
        },
        rows: {
            highlightOnHoverStyle: {
                backgroundColor: 'rgb(230, 244, 244)',
                borderBottomColor: '#FFFFFF',
                borderRadius: '25px',
                outline: '1px solid #FFFFFF',
            },
        },
        pagination: {
            style: {
                border: 'none',
            },
        },
    };

    const saveUploadedItem = async () => {
        let formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('file', files[index])
        }
        try{
            const response = await upload_csv(formData);
            toast.success("CSV File uploaded successfully");
            setFileName("");
        }catch(error){
            console.log("!!! CSV Upload error: ", error);
        }
    }

    const handleInputChange = (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            setThumbnail(URL.createObjectURL(file));
            setFileName(file ? file.name: "");
            setFiles(e.target.files);
            console.log("@#@#@ ADDED FILES: ", e.target.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        console.log('handleDragOver');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        console.log('handleDragOver');
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

    async function deleteProduct(id){
        try{
            const response = await master_csvDelete(id);
            const updateData = data.filter((item) => item?.id !== id);
            setData(updateData);
            toast.success('Product Deleted successfully.');
            setShowDeleteModal(!showDeleteModal);
            setSelectedProduct(null);
        }catch(error){
            console.log("!!!!!! ERROR: ", error);
        }
    }

    async function editProduct(id, newData) {
        try {
            const response = await master_csvEdit(id, newData);
            console.log("@#@#@ EDIT SUCCESS: ", response.data);
            setShowEditModal(!showEditModal);
            toast.success("CSV file edited successfully");
            fetchData();
        } catch (error) {
            console.log("master csv edit error", error);
        }
    }

    useEffect(() => {
        if(data.length > 0){
            console.log("@@@@@ DATA: ", data);
        }
    }, [data])
 
    return(
        <>
            <div className="card mb-4">
                <UploadCSV
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handleInputChange={handleInputChange}
                    saveUploadedItem={saveUploadedItem}
                    fileName = {fileName}
                    files = {files}
                    title="MasterCSV"
                />
                <div className="card-body">
                    <FilteredDataTable
                        type={"masterCSV"}
                        tableColumns={productColumns}
                        inputProps={{
                            title: "Master CSV List",
                            columns: columns,
                            progressPending: loading,
                            fixedHeader: true,
                            pagination: true,
                            paginationTotalRows: totalRows,
                            customStyles: customStyles,
                            highlightOnHover: true,
                            pointerOnHover: true,
                        }}
                    />
                </div>
            </div>
            <ConfirmDeleteModal
                open={showDeleteModal}
                onCloseModal={() => { 
                    setShowDeleteModal(!showDeleteModal);
                    setSelectedProduct(null);
                }}
                deleteProduct={() => deleteProduct(selectedProduct?.id)}
            />
            <EditModal
                open = {showEditModal}
                onCloseModal={()=>{
                    setShowEditModal(!showEditModal);
                    setSelectedProduct(null);
                }}
                editProduct={(newData) => editProduct(selectedProduct?.id, newData)}
                data={selectedProduct}
            />
        </>
    )
}
export default MasterCsv;