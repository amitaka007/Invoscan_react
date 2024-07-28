'use client';
import DataTable from "react-data-table-component";
import React, { useState, useEffect } from "react";
import { Modal } from 'react-responsive-modal';
import { Carousel } from "react-responsive-carousel";
import DatePicker from "react-datepicker";
import moment from "moment";
import FeatherIcon from 'feather-icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { SelectCompany } from "@/components/SelectCompany";
import { useSelector } from "react-redux";
import { deleteInvoice, getPendingInvoices, getSupplierList, markCompleteInvoice, uploadInvoice } from "@/api/invoices";
import { toast } from "react-toastify";
import BackArrow from "@/components/BackArrow";
import BookingModal from "@/components/BookingModal";
import { FilteredDataTable } from "@/components/FilteredDataTable";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function Bookings() {
    const {selectedCompany } = useSelector((state) => state.user);

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalRows, setTotalRows] = useState(0)
    const [open, setOpen] = useState(false);
    const [supplierOpen, setSupplierOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [supplierList, setSupplierList] = useState([]);
    const [selectedSupplier, setSupplier] = useState(null);
    const [secondOpen, setSecondOpen] = useState(false);
    const [fileName, setFileName] = useState('');
    const [invoiceItems, setInvoiceItems] = useState({
        Items: []
    });
    const [thumbnail, setThumbnail] = useState('');
    const [invoiceData, setInvoiceData] = useState({
        PackSize: '',
        Description: '',
        Quantity: '',
        QuantityForReport: '',
        Amount: '',
        Reason: '',
        UnitPrice: ''
    });
    const [invoiceItemIndex, setInvoiceItemIndex] = useState();
    const [actionType, setActionType] = useState('');
    const [nextAction, setNextAction] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteSPOpen, setDeleteSpOpen] = useState(false);
    
    const [deleteId, setDeleteId] = useState(null);
    const [deleteSPId, setspDeleteId] = useState({});
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    
    const [actionButtonType, setActionButtonType] = useState('update');
    const [files, setFiles] = useState([]);

    const [startDate, setStartDate] = useState(moment().startOf('year').toDate());
    const [endDate, setEndDate] = useState(moment().endOf('year').toDate());
    const [supplierId, setSupplierId] = useState('');

    let invoiceTableColumns = ["supplier.name", "InvoiceDate", "InvoiceId", "SubTotal"];
    let columns = [
        {
            name: 'Vendor Name',
            selector: row => (row.supplier && row.supplier.name ? row.supplier.name : 'NA'),
        },
        {
            name: 'Invoice Date',
            selector: row => row.InvoiceDate,
        },
        {
            name: 'Invoice ID',
            selector: row => row.InvoiceId,
        },
        {
            name: 'Sub Total',
            cell: row => {
                const checkPound = row?.SubTotal?.includes("£");
                let value = "";
                let split = [];
                if(checkPound){
                    split = row?.SubTotal?.split("£");
                    value = parseFloat(row?.SubTotal?.replace(/[^0-9\.]+/g, ""))?.toFixed(2);
                    value = Array.isArray(split)? `£${split[split.length - 1]}` : value;
                }else{
                    value = `£${parseFloat(row?.SubTotal?.replace(/[^0-9\.]+/g, ""))?.toFixed(2)}`
                }
                return(
                    <div className="text-light-green">{value}</div>
                )
            }
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <div>
                        <button
                            onClick={(e) => showRowData(row)}
                        >
                            <FeatherIcon icon="eye" className='menu-icon' />
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={(e) => { setDeleteId(row.id); setDeleteOpen(true); }}
                        >
                            <i className='bx bx-trash menu-icon menu-icon-red'></i>
                        </button>
                    </div>
                </div>
            )
        },
    ];
    let invoiceItemsColumns = [
        {
            name: '',
            width: "47%",
            cell: row => (
                <div key={`a${row?.index}`} className="grid-flex items-center">
                    <div style={{ width: '100px', textAlign: 'center' }} className="form-control">{row.PackSize}</div>
                    <b className="delivery-text" style={{ paddingLeft: '20px' }}>{row?.Description}</b>
                </div>
            )
        },
        {
            name: 'Quantity',
            cell: row => (
                <div key={`b${row?.index}`}>
                    <input type="text" className="form-control" value={row?.Quantity} readOnly />
                </div>
            )
        },
        {
            name: 'Price/unit',
            cell: row => (
                <div key={`c${row?.index}`}>
                    <input type="text" className="form-control" value={"£" + row?.Amount} readOnly />
                </div>
            )
        },
        {
            name: 'Credit packs',
            cell: row => (
                <div key={`d${row?.index}`}>
                    <input type="text" className="form-control" value={row?.QuantityForReport} readOnly />
                </div>
            )
        },
        {
            name: 'Reason',
            width: "15%",
            cell: row => (
                <div key={`e${row?.index}`}>
                    <input type="text" className="form-control" value={row?.Reason} readOnly />
                </div>
            )
        },
        {
            name: '',
            cell: (row) => (
                <div className="grid-flex" key={`f${row?.index}`}>
                    <div>
                        {
                            row.lock !== true ?
                                <button
                                    onClick={(e) => { showInvoiceData(row); setActionButtonType('update') }}
                                >
                                    <FeatherIcon icon="eye" className='menu-icon' />
                                </button>
                                : null
                        }
                    </div>
                    <div>
                        {
                            row.lock !== true ?
                                <button
                                    onClick={(e) => { setspDeleteId({row}); setDeleteSpOpen(true); }}
                                >
                                    <i className='bx bx-trash menu-icon menu-icon-red'></i>
                                </button>
                                : null
                        }
                    </div>
                    <div>
                        {
                            row.lock !== true ?
                                <button onClick={(e) => setInvoiceLock(row)}>
                                    <FeatherIcon icon="unlock" className='menu-icon' />
                                </button>
                                :
                                <button onClick={(e) => setInvoiceUnlock(row)}>
                                    <FeatherIcon icon="lock" className='menu-icon' />
                                </button>
                        }

                    </div>
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
        }
    };

    const showRowData = (row) => {
        // if (row.invoiceUrl && row.invoiceUrl.length > 0 && row.invoiceUrl[0].type == 'pdf') {
        //     const pdfUrl = row.invoiceUrl[0].url;
        //     const link = document.createElement("a");
        //     link.href = pdfUrl;
        //     link.download = "invoice.pdf";
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link);
        // }
        let rowData = Object.assign({}, row);
        const items = rowData?.Items;
        if(Array.isArray(items)){
            const addIndex = items.map((item, index) => ({
                ...item,
                index
            }));
            rowData = Object.assign({}, rowData, {Items: addIndex})
            setInvoiceItems(rowData);
            // console.log("#@@#@# ROW DATA: ", JSON.stringify(rowData, null, 4));
        }
        if(actionType !== "statement"){
            setOpen(true);
        }
    }

    const showInvoiceData = (row) => {
        let rowData = { ...row };
        setInvoiceData(rowData)
        setSecondOpen(true);
    }
 
    const saveInvoiceItems = () => {
        // console.log("@#@#@# INVOICE DATA: ", invoiceData);
        setInvoiceItems({
            ...invoiceItems,
            Items: invoiceItems.Items.map((item) => {
                console.log("**** INVOICE ITEMS: ", typeof item?.index, typeof invoiceData?.index);
                if(item?.index === invoiceData?.index){
                    return invoiceData;
                }
                return item;
            }),
        })
        // setInvoiceItems({
        //     ...invoiceItems,
        //     Items: []
        // })
        // setTimeout(() => {
        //     setInvoiceItems({
        //         ...invoiceItems,
        //         Items: invoiceItems.Items.map((item) => {
        //             console.log("**** INVOICE ITEMS: ", typeof item?.index, typeof invoiceData?.index);
        //             if(item?.index === invoiceData?.index){
        //                 return invoiceData;
        //             }
        //             return item;
        //         }),
        //     })
        // }, 500);
        setSecondOpen(false)
    }

    const saveNewInvoiceItems = () => {
        invoiceData.lock = false;
        let oldItems = invoiceItems.Items.map((item) => item);
        oldItems.unshift(invoiceData);
        oldItems = oldItems.map((item, index) => {
            return {
                ...item,
                index
            }
        }) 
        setInvoiceItems({
            ...invoiceItems,
            Items: []
        })
        setTimeout(() => {
            setInvoiceItems({
                ...invoiceItems,
                Items: oldItems
            });
        }, 500);
        setSecondOpen(false)
    }

    const setInvoiceLock = (row) => {
        console.log("@@@ LOCK: ", row?.index);
        row.lock = true;
        invoiceItems.Items[row?.index] = row
        let invoiceItemsClone = { ...invoiceItems }
        // setInvoiceItems({})
        setInvoiceItems(invoiceItemsClone);
        // const updateItems = invoiceItems?.Items?.map((item) => {
        //     if(item?.index === row?.index){
        //         return {
        //             ...item,
        //             lock: true
        //         }
        //     }
        //     return item;
        // })
        // setTimeout(() => {
        //     setInvoiceItems({
        //         ...invoiceItems,
        //         Items: updateItems
        //     })
        // }, 500);
    }

    const setInvoiceUnlock = (row) => {
        row.lock = false;
        invoiceItems.Items[row?.index] = row
        let invoiceItemsClone = { ...invoiceItems }
        // setInvoiceItems({})
        setInvoiceItems(invoiceItemsClone);
    }

    const deleteInvoiceData = () => {
        let { row } = deleteSPId;
        let updateInvoiceItems = invoiceItems.Items.filter((item) => (item?.index !== row?.index));
        updateInvoiceItems = updateInvoiceItems.map((item, index) => {
            return {
                ...item,
                index
            }
        })
        setInvoiceItems({
            ...invoiceItems,
            Items: []
        })
        setTimeout(() => {
            setInvoiceItems({
                ...invoiceItems,
                Items: updateInvoiceItems
            });
        }, 500);
        setTimeout(() => {
            setDeleteSpOpen(false)
        }, 10);
    }

    const markCompleteCurrentInvoice = async () => {
        const items = invoiceItems?.Items?.map((item) => {
            delete item?.lock;
            delete item?.index;
            return item;
        })
        // console.log("@@@@ API: ", items);
        try{
            const response = await markCompleteInvoice(invoiceItems.id, {
                "CustomerId": invoiceItems.CustomerId,
                "InvoiceDate": invoiceItems.InvoiceDate,
                "InvoiceId": invoiceItems.InvoiceId,
                "Items": items,
                "SubTotal": invoiceItems.SubTotal,
                "isDelivered": true
            })
            toast.success("Invoice has been marked as completed.");
            console.log(response.data,'response');
            setSupplier(null);
            setFileName('');
            setInvoiceItems({
                Items: []
            });
            setOpen(false);
            setSupplierOpen(false);
            const updateData = data?.filter((item) => item?.id !== invoiceItems?.id);
            setData(updateData);
        }catch(error){
            console.log("!!!! USER CMPLT API ERROR: ", error)
        }
    }

    const deleteCurrentInvoice = async () => {
        try{
            const response = await deleteInvoice(deleteId);
            // fetchData();
            const updateData = data?.filter((item) => item?.id !== deleteId);
            setData(updateData);
            onCloseDeleteModal();
        }catch(error){
            console.log("!!! DELETE INVOICE ERROR: ", error);
        }
    }

    const fetchData = async page => {
        let companyDetails = selectedCompany;
        if(!companyDetails?.id) {
            return;
        }
        setLoading(true)
        try{
            const url = `stock/pending/${companyDetails.id}?from=${moment(startDate).format('YYYY-MM-DD')}&to=${moment(endDate).format('YYYY-MM-DD')}${supplierId ? '&supplier=' + supplierId : ''}`;
            const response = await getPendingInvoices(url);
            const rcvdData = response.data?.data;
            setLoading(false);
            if (Array.isArray(rcvdData?.data)) {
                setData(rcvdData?.data);
                setTotalRows(rcvdData?.count);
            }
        }catch(error){
            setData([])
            setTotalRows(0)
            setLoading(false)
            console.log("!!! GET PENDING INVOICES ERROR: ", error);
        }
    }

    const fetchCurrentSupplier = async () => {
        try{
            let response = await getSupplierList();
            setSupplierList(response.data?.data);
        }catch(error){
            console.log("!!!! SUPPLIER LIST ERROR: ", error);
        }
    }

    const saveUploadedItem = async () => {
        let formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('files[]', files[index])
        }
        let companyDetails = selectedCompany;
        if(companyDetails?.id){
            try{
                const response = await uploadInvoice(`form/analyze/${companyDetails.id}?supplierId=${selectedSupplier.id}&type=${actionType == 'bulk' ? 'invoice' : actionType}`, formData);
                const data = response.data;
                if (!data?.error) {
                    showRowData(data?.data);
                    setSupplierOpen(false);
                    fetchData();
                    const message = (actionType === "statement")? "Statement uploaded successfully." : "Invoice uploaded successfully";
                    toast.success(message)
                }else{
                    toast.warning(data?.error);
                }
            }catch(error){
                console.log("!!!! UPLOAD INVOICE ERROR: ", error);
            }
        }
    }

    const onCloseModal = () => {
        setConfirmOpen(true);
    };
    const onCloseSecondModal = () => {
        setSecondOpen(false);
        setInvoiceData({
            PackSize: '',
            Description: '',
            Quantity: '',
            QuantityForReport: '',
            Amount: '',
            Reason: '',
            UnitPrice: ''
        })
    };
    const onCloseSupplierModal = () => { 
        setConfirmOpen(true);
        setFiles([]);
    };
    const onCloseConfirmModal = () => {
        setConfirmOpen(false);
    };
    const onCloseDeleteModal = () => {
        setDeleteOpen(false);
        setDeleteId(null);
    };
    const onClosespDeleteModal = () => {
        setDeleteSpOpen(false)
    };

    useEffect(() => {
        if((selectedCompany !== null) && (Object.keys(selectedCompany).length > 0)){
            fetchData();
            fetchCurrentSupplier();
        }
    }, [selectedCompany]);

    const handleInputChangeStatment = (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            setFileName(file ? file.name: "");
            setFiles(e.target.files);
        }
    };
    // upload
    const handleInputChange = (e) => {
        if (e.target.files.length) {
            const selectedFiles = e.target.files;
            const keyNames = Object.keys(selectedFiles);
            let addFiles = [];
            keyNames.forEach((key) => {
                addFiles.push(selectedFiles[key])
            })
            setFiles(addFiles);
        }
    };
    const removeFiles = (deleteId)=>{
        const updateData = files?.filter((item, index) => index !== deleteId);
            setFiles(updateData);
    }

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
            setFileName(file.name);
            setFiles([file]);
        }
    };

    const onCloseCompanyModal = () => {
        setShowCompanyModal(false);
    };

    function checkSelectedCompany(type = ""){
        if(selectedCompany){
            setNextAction(false); 
            setSupplierOpen(true); 
            setActionType(type);
        }else{
            setShowCompanyModal(true);
        }
    }

    return (
        <>
            <div className="card mb-4">
                <div className="card-body mt-3" style={{ background: '#0bc9931a' }}>
                    <h5>Book in a brand new delivery</h5>
                    <div className="mt-2">
                        <button type="button" onClick={() => checkSelectedCompany("invoice")} className={`btn btn-green me-2`}>Add Invoice</button>
                        <button type="button" onClick={() => checkSelectedCompany("bulk")} className={`btn btn-green me-2`}>Bulk Invoices</button>
                        <button type="button" onClick={() => checkSelectedCompany("statement")} className={`btn btn-green me-2`}>Add Statement</button>
                    </div>
                </div>

                <div className="mt-2">
                    <h5 className="card-header pl-0">Search By Date</h5>
                    <div className="d-flex">
                        <div className="col-md-3">
                            <label className="col-md-12">Start Date</label>
                            <DatePicker selected={startDate} className="form-control" onChange={(date) => setStartDate(date)} />
                        </div>
                        <div className="col-md-3">
                            <label className="col-md-12">End Date</label>
                            <DatePicker selected={endDate} className="form-control" onChange={(date) => setEndDate(date)} />
                        </div>
                        <div className="col-md-3">
                            <label className="col-md-12">Supplier</label>
                            <select className="form-control" onChange={(e) => setSupplierId(e.target.value)} >
                                <option value={''}>All Supplier</option>
                                {
                                    (Array.isArray(supplierList)) && supplierList.map((supplier, index) => {
                                        return (
                                            <option key={index} value={supplier.id}>{supplier.name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="col-md-12"><br /></label>
                            <button type="button" onClick={() => { fetchData() }} className={`btn btn-green me-2 width-86 ml-5`}>Search</button>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <FilteredDataTable
                        tableColumns={invoiceTableColumns}
                        inputProps={{
                            title: "Pending Deliveries",
                            columns: columns,
                            data: data,
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
            <BookingModal
                open={open}
                onCloseModal={onCloseModal}
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                invoiceItemsColumns={invoiceItemsColumns}
                loading={loading}
                customStyles={customStyles}
                markCompleteCurrentInvoice={markCompleteCurrentInvoice}
                setActionButtonType={setActionButtonType}
                showInvoiceData={showInvoiceData}
            />
            <ProductDetailsModal 
                secondOpen={secondOpen}
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                saveInvoiceItems={saveInvoiceItems}
                saveNewInvoiceItems={saveNewInvoiceItems}
                onCloseSecondModal={onCloseSecondModal}
                actionButtonType={actionButtonType}
            />
            <Modal open={supplierOpen} onClose={onCloseSupplierModal} classNames={{ modal: 'supplier-modal' }} center>
                {
                    !nextAction ?
                        <div className=" mb-4">
                            <h2 className="card-header">Select supplier</h2>
                            <small>You must select a supplier before you can scan an invoice.</small>
                            <div className="card-body mt-3">
                                <div className=" card-body-group">
                                    {
                                        supplierList && supplierList.map((item, index) => {
                                            if(selectedSupplier?.id === item?.id){
                                                return (
                                                    <div key={index}>
                                                        <div id={(selectedSupplier?.id === item?.id) ? "bgColor" : "" } className="d-flex form-check form-radio-check mb-2 py-2" key={index}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-circle" color="rgba(11, 201, 147, 1)" pointerEvents="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                            <label className="form-check-label" htmlFor={`flexSwitchCheckChecked-${index}`}>{item.name}</label>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div key={index}>
                                                     <div  onClick={() => setSupplier(item)} className="d-flex form-check form-radio-check mb-2 py-2" key={index}>
                                                        <div>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="feather feather-circle" color="rgba(11, 201, 147, 1)" pointerEvents="none"><circle cx="12" cy="12" r="10"></circle></svg>
                                                        </div>
                                                        <label className="form-check-label" htmlFor={`flexSwitchCheckChecked-${index}`}>{item.name}</label>
                                                    </div>
                                               </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className="mt-2">
                                    <button type="button" onClick={() => { setNextAction(true); }} className="btn btn-green me-2 width-100">Confirm Supplier</button>
                                </div>
                            </div>
                        </div>
                        :
                        <div className=" mb-4">
                            {
                                actionType == 'invoice' ?
                                    <>
                                        <div className=" mt-3 pt-2" style={{ background: '#0bc9931a', textAlign: 'center' }}><h4 style={{ color: '#0bc993' }}>Supplier: {selectedSupplier?.name} </h4></div>
                                        <h2 className="card-header">Additional pages</h2>
                                        <small>Add one file to as pdf for invoice.</small></>
                                    : null
                            }
                            {
                                actionType == 'bulk' ?
                                    <><h2 className="card-header">Add Multiple PDF for same supplier</h2>
                                        <small>If your invoice is split across multiple pages, add them here.<br />
                                            In the future, this screen will let you process multiple invoice from the same supplier, but for now please only add pages from the same invoice before proceeding.</small>
                                        <div className=" mt-3"><h6 className="card-header" style={{ color: '#0bc993' }}>Supplier: {selectedSupplier?.name} </h6></div></>
                                    : null
                            }
                            {
                                actionType == 'statement' ?
                                    <><h2 className="card-header">Add Statement</h2>
                                        <small>Upload Statement PDF File.</small>
                                        <div className="mt-3"><h6 className="card-header" style={{ color: '#0bc993' }}>Supplier: {selectedSupplier?.name} </h6></div></>
                                    : null
                            }

                            {
                                actionType == 'bulk' ?
                                    <div className="card-body mt-3 py-5">
                                        <div className="mb-3 col-md-12 file-upload-wrapper"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}>
                                            <div className={`${(files.length > 0)? "wrapper-file-uploader" : "file-uploader"}`}>
                                                 {files.length > 0 ?  (
                                                    files.map((file, index) => {
                                                        return (
                                                            <>
                                                               <div className="files-multiple-uploader mb-2 mx-2" key={index}>
                                                                    <span>{`${index + 1}. ${file?.name}`}</span>
                                                                    <a style={{color:'#630a0a'}} onClick={()=> removeFiles(index)}>Remove file</a>
                                                                </div>
                                                            </>
                                                        )
                                                    })
                                                 )
                                                  :
                                                    <>
                                                    <div onClick={() => { document.querySelector("#files").click() }} className="d-flex justify-content-center align-items-center flex-column">
                                                        <input className="form-control"  type="file" id="files" name="files[]" onChange={handleInputChange}  multiple hidden />
                                                        <FeatherIcon icon="upload-cloud" className='menu-icon' />
                                                        <p>Browse File to Upload</p> 
                                                    </div>
                                                  </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    :
                                      <div className="card-body mt-3 py-5">
                                        <div className="mb-3 col-md-12 file-upload-wrapper"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}>
                                            <div className="wrapper-uploader" onClick={() => { document.querySelector("#files").click() }}>
                                                <input className="form-control" type="file" id="files" name="files[]" onChange={handleInputChangeStatment} hidden />
                                                <div className="d-flex flex-col justify-center space-y-0">
                                                    <div className="d-flex justify-center">
                                                        <FeatherIcon icon="upload-cloud" className='menu-icon' />
                                                    </div>
                                                    
                                                    {
                                                        fileName ?
                                                            <a className="text-center">{fileName}</a>
                                                            : 
                                                            (
                                                                <>
                                                                    <p className="text-center">Browse File</p>
                                                                    <p className="text-center leading-3">or</p>
                                                                    <p className="text-center">Drag and Drop to Upload</p>
                                                                </>
                                                            )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            }

                            <div className="card-body">
                                <div className="mt-2">
                                    <button type="button" onClick={() => { setNextAction(false) }} className="btn btn-default mx-2 w-[9%]">
                                        <BackArrow className="w-[100%] text-black"/>
                                    </button>
                                    <button type="button" disabled={files.length==0} onClick={() => { saveUploadedItem(); }} className="btn btn-green me-2 w-[87%]">Confirm</button>
                                </div>
                            </div>
                        </div>
                }
            </Modal>
            <Modal open={confirmOpen} onClose={onCloseConfirmModal} classNames={{ modal: 'company-select-modal' }} center>
                <div className="mb-4">
                    <div className="card-body mt-3">
                        <h2 className="card-header mb-2">Wait!</h2>
                        <small>If you leave now, your book in will be incomplete? Do you want to continue later or discard it entirely ?</small>
                        <div className="d-flex mt-2">
                            <button type="button" onClick={(e) => { onCloseConfirmModal() }} className={`btn btn-green-borded col-md-6`}>Cancel</button>&nbsp;
                            <button type="button" onClick={(e) => { setConfirmOpen(false); setSupplierOpen(false);  setSupplier(null); setFileName(null); setOpen(false);}} className={`btn btn-green col-md-6`}>Continue Later</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={deleteOpen} onClose={onCloseDeleteModal} classNames={{ modal: 'company-select-modal' }} center>
                <div className="mb-4">
                    <div className="card-body mt-3">
                        <h2 className="card-header">Wait!</h2>
                        <small>Are You Sure, You want to delete this invoice ?</small>
                        <div className="d-flex">
                            <button type="button" onClick={(e) => { onCloseDeleteModal(); setDeleteId(null) }} className={`btn btn-green-borded w-[80%] me-1`}>Cancel</button>&nbsp;
                            <button type="button" onClick={(e) => { deleteCurrentInvoice(); }} className={`btn btn-green w-[80%] ms-1`}>Delete</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={deleteSPOpen} onClose={onClosespDeleteModal} classNames={{ modal: 'company-select-modal' }} center>
                <div className="mb-4">
                    <div className="card-body mt-3">
                        <h2 className="card-header">Wait!</h2>
                        <small>Are You Sure, You want to delete this item ?</small>
                        <div className="d-flex">
                            <button type="button" onClick={(e) => { onClosespDeleteModal(); setspDeleteId({}) }} className={`btn btn-green-borded col-md-6`}>Cancel</button>&nbsp;
                            <button type="button" onClick={(e) => { deleteInvoiceData(); }} className={`btn btn-green col-md-6`}>Delete</button>
                        </div>
                    </div>
                </div>
            </Modal>
            <SelectCompany 
                open={showCompanyModal}
                onCloseModal={onCloseCompanyModal}
            />
        </>
    )
}
