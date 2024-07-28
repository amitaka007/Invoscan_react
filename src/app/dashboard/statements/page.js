'use client';
import React, { useState, useEffect } from "react";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import FeatherIcon from 'feather-icons-react';
import { deleteStatement, deleteStatementInvoice, getStatementDetails, getStatementList, markCompleteStatementInvoice, uploadStatement } from "@/api/statement";

import { useSelector } from "react-redux";
import { getSupplierList } from "@/api/invoices";
import { toast } from "react-toastify";
import { FilteredDataTable } from "@/components/FilteredDataTable";
import { UploadCSV } from "@/app/admin/adminComponents/UploadCSV";

export default function Statements() {
    const {selectedCompany} = useSelector((state)=>state.user);

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalRows, setTotalRows] = useState(0)
    const [open, setOpen] = useState(false);
    const [invoiceOpen, setInvoiceOpen] = useState(false);

    const [invoiceItem, setInvoiceItems] = useState({
        row: {},
        Items: []
    })
    const [uploadedInvoiceItems, setUploadedInvoiceItems] = useState([])
    const [totalItemRows, setTotalItemRows] = useState(0)
    const [supplierOpen, setSupplierOpen] = useState(false);
    const [supplierList, setSupplierList] = useState([]);
    const [selectedSupplier, setSupplier] = useState(null);
    const [invoiceItemIndex, setInvoiceItemIndex] = useState();
    const [invoiceData, setInvoiceData] = useState({});
    const [actionType, setActionType] = useState('statement');
    const [nextAction, setNextAction] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);

    const [fileName, setFileName] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteInnerOpen, setDeleteInnerOpen] = useState(false);

    const [deleteId, setDeleteId] = useState(null)
    const [statementId, setStatementId] = useState(null)
    const [files, setFiles] = useState([]);
    const [thumbnail, setThumbnail] = useState('');

    let statementTableColumns = ["supplier.name", "CustomerName", "InvoiceDate", "CustomerAddress", "TotalTax"]
    let columns = [
        {
            name: 'Vendor Name',
            selector: row => (row.supplier && row.supplier.name ? row.supplier.name : 'NA'),
        },
        {
            name: 'Customer Name',
            selector: row => row.CustomerName,
        },
        {
            name: 'Statement Month',
            selector: row => row.InvoiceDate,
        },
        {
            name: 'Customer Address',
            selector: row => row.CustomerAddress,
        },
        {
            name: 'Total Tax',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.TotalTax).toFixed(2)}</div>
            )
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <button
                        onClick={(e) => fetchStatementData(row)}
                    >
                        <FeatherIcon icon="eye" className='menu-icon' />
                    </button>
                    <button
                        onClick={(e) => { setDeleteId(row.id); setDeleteOpen(true); }}
                    >
                        <i className='bx bx-trash menu-icon menu-icon-red'></i>
                    </button>
                </div>
            )
        },
    ];
    let invoiceTableColumns = ["invoiceNumber", "invoiceDate", "amount"];
    let invoiceItemsColumns = [
        {
            name: 'Invoice Number',
            selector: row => row.invoiceNumber,
        },
        {
            name: 'Invoice Date',
            selector: row => row.invoiceDate,
        },
        {
            name: 'Amount',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.amount).toFixed(2)}</div>
            )
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <button
                    >
                        {
                            row.isResolved === true ?
                                <i className='bx bx-check-square menu-icon'></i>
                                :
                                <i onClick={() => { markCompleteCurrentStatement(row) }} className='bx bx-square menu-icon'></i>
                        }
                    </button>
                    <button
                        onClick={(e) => { setStatementId(row.id); setDeleteInnerOpen(true); }}
                    >
                        <i className='bx bx-trash menu-icon menu-icon-red'></i>
                    </button>
                </div>
            )
        }
    ];
    let uploadedInvoiceItemsColumns = [
        {
            name: '',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.PackSize} readOnly />
                    <b>{row.Description}</b>
                </div>
            )
        },
        {
            name: 'Inv. packs',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.Quantity} readOnly />
                </div>
            )
        },
        {
            name: 'Credit packs',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.csvDtPrice} readOnly />
                </div>
            )
        },
        {
            name: 'Price/unit',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.Amount} readOnly />
                </div>
            )
        },
        {
            name: '',
            cell: (row, index) => (
                <div className="grid">
                    <button
                        className="btn rounded-pill btn-default"
                        onClick={(e) => showInvoiceData(row, index)}
                    >
                        <FeatherIcon icon="eye" className='menu-icon' />
                    </button>
                </div>
            )
        }
    ];
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

    const fetchCurrentSupplier = async () => {
        try{
            let response = await getSupplierList();
            setSupplierList(response.data?.data);
        }catch(error){
            console.log("!!!!STATEMENT SUPPLIER LIST ERROR: ", error);
        }
    }

    const fetchStatementData = async (row) => {
        try{
            const response = await getStatementDetails(row?.id);
            const data = response.data?.data;
            if (Array.isArray(data)) {
                setInvoiceItems({
                    row,
                    Items: data
                })
                setTotalItemRows(data.length)
                setOpen(true);
            }
        }catch(error){
            console.log("!!!!STATEMENT DETAILS ERROR: ", error);
        }
    }
    const markCompleteCurrentStatement = async (item) => {
        try{
            const response = await markCompleteStatementInvoice(item?.id, { "isResolved": true });
            toast.success("Invoice has been marked as completed.");
            if(response.data){
                fetchStatementData(invoiceItem.row);
            }            
        }catch(error){
            console.log("!!!! CMPLT STMNT INV ERROR: ", error);
        }
    }

    const deleteCurrentInnerInvoice = async () => {
        const response = await deleteStatement(statementId);
        toast.success("Invoice deleted successfully.");
        if (response) {
            fetchStatementData(invoiceItem.row)
            onCloseInnerDeleteModal();
        }
    }

    const fetchData = async () => {
        setLoading(true)
        let company = selectedCompany;
        if(!company?.id){
          return;
        }
        setLoading(true)
        try{
            const response = await getStatementList(company.id);
            setLoading(false)
            const data = response.data?.data;
            if (Array.isArray(data)) {
            setData(data)
            setTotalRows(data?.length)
        }
        }catch(error){
            console.log(error);
            setLoading(false)
        }
    }

    const deleteCurrentStatemt = async () => {
        try{
            const response = await deleteStatementInvoice(deleteId);
            toast.success("Statement has been deleted successfully.")
            fetchData(1);
            onCloseDeleteModal();
        }catch(error){
            console.log("!!!! DELETE STMNT ERROR: ", response.data);
        }
    }

    const saveUploadedItem = async () => {
        let formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('files[]', files[index])
        }
        let company = selectedCompany;
        if(!company?.id){
            return;
        }
        try{
            const url = `/form/analyze/${company.id}?supplierId=${selectedSupplier.id}&type=${actionType}`;
            const response = await uploadStatement(url, formData);
            if (response && !response.error) {
                setSupplier(null);
                setFileName("");
                fetchData(1);
                setSupplierOpen(false)
            }
        }catch(error){
            console.log("!!!! UPLOAD STMNT ERROR: ", error);
        }
        
    }

    const showInvoiceData = (row, key) => {
        let rowData = { ...row };
        setInvoiceData(rowData)
        setInvoiceItemIndex(key)
        setSecondOpen(true);
    }

    const saveInvoiceItems = () => {
        uploadedInvoiceItems.Items[invoiceItemIndex] = invoiceData
        setUploadedInvoiceItems({
            ...uploadedInvoiceItems
        })
        setSecondOpen(false)
    }

    const onCloseSupplierModal = () => {
        setSupplierOpen(false)
        setSupplier(null);
        setThumbnail('');
        setFiles([]);
        setFileName('');
    };
    const onCloseSecondModal = () => setSecondOpen(false);

    const onCloseModal = () => setOpen(false);
    const onCloseInvoiceModal = () => setInvoiceOpen(false);
    const onCloseDeleteModal = () => setDeleteOpen(false);
    const onCloseInnerDeleteModal = () => setDeleteInnerOpen(false);

    useEffect(() => {
        fetchData(1);
    }, []);

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

    return (
        <>
            <div className="card mb-4">
                <div className="card-body mt-3" style={{ background: '#0bc9931a' }}>
                    <h5>Book in a new delivery</h5>
                    <div className="mt-2">
                        <button type="button" onClick={(e) => { fetchCurrentSupplier(); setNextAction(false); setSupplierOpen(true); }} className={`btn btn-green me-2`}>Add Statement</button>
                    </div>
                </div>
                <div className="card-body">
                    <FilteredDataTable
                        tableColumns={statementTableColumns}
                        inputProps={{
                            title: "Statements",
                            columns: columns,
                            data: data,
                            progressPending: loading,
                            fixedHeader: true,
                            pagination: true,
                            paginationTotalRows: totalRows,
                            customStyles: customStyles,
                            highlightOnHover: true,
                            pointerOnHover: true
                        }}
                    />
                </div>
            </div>
            <Modal open={open} onClose={onCloseModal} center>
                <FilteredDataTable
                    tableColumns={invoiceTableColumns}
                    inputProps={{
                        title: `${(invoiceItem.row.CustomerName ? invoiceItem.row.CustomerName : 'NA')} (${totalItemRows})`,
                        columns: invoiceItemsColumns,
                        data: invoiceItem.Items,
                        progressPending: loading,
                        fixedHeader: true,
                        pagination: true,
                        paginationTotalRows: totalItemRows,
                        customStyles: customStyles,
                        highlightOnHover: true,
                        pointerOnHover: true
                    }}
                />
            </Modal>
            <Modal open={secondOpen} onClose={onCloseSecondModal} center>
                <div className="mb-4">
                    <small>Pack Size:- {invoiceData.PackSize}</small>
                    <h2 className="card-header">{invoiceData.Description}</h2>
                    <div className="card-body">
                        <div className="row">
                            <div className="mb-3 col-md-6">
                                <label htmlFor="Quantity" className="form-label">Inv. packs</label>
                                <input className="form-control" type="text" id="Quantity" name="Quantity" onChange={(e) => { setInvoiceData({ ...invoiceData, Quantity: e.target.value }) }} value={invoiceData.Quantity} />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label htmlFor="csvDtPrice" className="form-label">Credit packs</label>
                                <input className="form-control" type="text" name="csvDtPrice" id="csvDtPrice" onChange={(e) => { setInvoiceData({ ...invoiceData, csvDtPrice: e.target.value }) }} value={invoiceData.csvDtPrice} />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label htmlFor="UnitPrice" className="form-label">Price/unit</label>
                                <input className="form-control" type="text" id="UnitPrice" name="UnitPrice" onChange={(e) => { setInvoiceData({ ...invoiceData, UnitPrice: e.target.value }) }} value={invoiceData.UnitPrice} />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label htmlFor="Amount" className="form-label">Total Price</label>
                                <input type="text" className="form-control" id="Amount" name="Amount" onChange={(e) => { setInvoiceData({ ...invoiceData, Amount: e.target.value }) }} value={invoiceData.Amount} />
                            </div>
                            <div className="mt-2">
                                <button type="button" onClick={onCloseSecondModal} className="btn btn-green-borded me-2">Cancel</button>
                                <button type="button" onClick={saveInvoiceItems} className="btn btn-green me-2">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal open={supplierOpen} onClose={onCloseSupplierModal} classNames={{ modal: 'supplier-modal' }} center>
                {
                    !nextAction ?
                        <div className=" mb-4">
                            <h2 className="card-header">Select supplier</h2>
                            <small>You must select a supplier before you can scan an invoice.</small>
                            <div className="card-body mt-4">
                                <div className=" card-body-group">
                                    {
                                        supplierList && supplierList.map((item, index) => {
                                            if(selectedSupplier?.id === item?.id){
                                                return (
                                                    <div key={index}>
                                                        <div id={(selectedSupplier?.id === item?.id) ? "bgColor" : "" } className="d-flex form-check form-radio-check mb-2 py-2" key={index}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" strokeLinejoin="round" className="feather feather-check-circle" color="rgba(11, 201, 147, 1)" pointer-events="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                            <label className="form-check-label" htmlFor={`flexSwitchCheckChecked-${index}`}>{item.name}</label>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div key={index}>
                                                     <div  onClick={() => setSupplier(item)} className="d-flex form-check form-radio-check mb-2 py-2" key={index}>
                                                        <div>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" strokeLinejoin="round" className="feather feather-circle" color="rgba(11, 201, 147, 1)" pointer-events="none"><circle cx="12" cy="12" r="10"></circle></svg>
                                                        </div>
                                                        <label className="form-check-label" htmlFor={`flexSwitchCheckChecked-${index}`}>{item.name}</label>
                                                    </div>
                                               </div>
                                            )
                                            // return (
                                            //     <div className="form-check form-radio-check mb-2 py-2" key={index}>
                                            //         <input className="form-check-input" onChange={() => {
                                            //             setSupplier(supplier)
                                            //         }} name='companyId' type="radio" id={`flexSwitchCheckChecked-${index}`} />
                                            //         <label className="form-check-label" htmlFor={`flexSwitchCheckChecked-${index}`}>{supplier.name}</label>
                                            //     </div>
                                            // )
                                        })
                                    }
                                </div>
                                <div className="mt-2">
                                    <button type="button" onClick={() => { setNextAction(true) }} className="btn btn-green me-2 width-100">Confirm Supplier</button>
                                </div>
                            </div>
                        </div>
                        :
                        <div className=" mb-4">
                            <h2 className="card-header">Add Statement</h2>
                            <small>Upload Statement PDF File.</small>
                            <div className="mt-3"><h6 className="card-header" style={{ color: '#0bc993' }}>Supplier: {selectedSupplier?.name} </h6></div>
                                <UploadCSV
                                    handleDragOver={handleDragOver}
                                    handleDragLeave={handleDragLeave}
                                    handleDrop={handleDrop}
                                    handleInputChange={handleInputChange}
                                    saveUploadedItem={saveUploadedItem}
                                    fileName = {fileName}
                                    files = {files}
                                    title=""
                                />
                        </div>
                }
            </Modal>

            <Modal open={deleteOpen} onClose={onCloseDeleteModal} classNames={{ modal: 'company-select-modal' }} center>
                <div className="mb-4">
                    <div className="card-body mt-3">
                        <h5>Wait!</h5>
                        <small>Are You Sure, You want to delete this statement ?</small>
                        <div className="flex justify-center mt-2 mb-0">
                            <button type="button" onClick={(e) => { onCloseDeleteModal(); setDeleteId(null) }} className="btn btn-green-borded w-[49%] me-1">Cancel</button>
                            <button type="button" onClick={(e) => { deleteCurrentStatemt();}} className="btn btn-green w-[49%] ms-1">Delete</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={deleteInnerOpen} onClose={onCloseInnerDeleteModal} classNames={{ modal: 'supplier-modal' }} center>
                <div className="mb-4">
                    <div className="card-body mt-3">
                        <h5>Wait!</h5>
                        <small>Are You Sure, You want to delete this invoice?</small>
                        <div className="flex justify-center mt-2 mb-0">
                            <button type="button" onClick={(e) => { onCloseInnerDeleteModal(); setStatementId(null) }} className="btn btn-green-borded w-[100%] me-1">Cancel</button>
                            <button type="button" onClick={(e) => { deleteCurrentInnerInvoice(); }} className="btn btn-green w-[100%] ms-1">Delete</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}