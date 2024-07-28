'use client';
import React, { useState, useEffect, useLayoutEffect } from "react";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import FeatherIcon from 'feather-icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { SelectCompany } from "@/components/SelectCompany";
import { useSelector } from "react-redux";
import { userActions } from "@/lib/features/slice/userSlice";
import { deleteInvoice, getPendingInvoices, markCompleteInvoice } from "@/api/invoices";
import { toast } from "react-toastify";
import BookingModal from "@/components/BookingModal";
import { FilteredDataTable } from "@/components/FilteredDataTable";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
 
export default function Invoices() {
    const {userDetails, selectedCompany, companyList} = useSelector((state) => state.user);
    const { setSelectedCompany } =  userActions;
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalRows, setTotalRows] = useState(0)
    const [results, setResults] = useState(100)
    const [page, setPage] = useState(1)
    const [open, setOpen] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteSPOpen, setDeleteSpOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null)
    const [deleteSPId, setspDeleteId] = useState({})
    const [supplierList, setSupplierList] = useState([]);
    const [invoiceItems, setInvoiceItems] = useState({
        Items: []
    })
    const [invoiceData, setInvoiceData] = useState({
        PackSize: '',
        Description: '',
        Quantity: '',
        QuantityForReport: '',
        Amount: '',
        Reason: '',
        UnitPrice: ''
    })
    const [invoiceItemIndex, setInvoiceItemIndex] = useState()
    const [currentTab, setCurrentTab] = useState('Pending');
    const [actionButtonType, setActionButtonType] = useState('update');
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [company, setCompany] = useState({});

    const [currentUser, setUser] = useState({});
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
            cell: row => (
                <div className="text-light-green">£{parseFloat(row?.SubTotal?.replace(/[^0-9\.]+/g, ""))?.toFixed(2)}</div>
            )
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
                <div key={`a${row?.index}`} className="grid-flex">
                    <div style={{ width: '100px', textAlign: 'center' }} className="form-control">{row.PackSize}</div>
                    <b style={{ paddingLeft: '20px' }} className="delivery-text">{row.Description}</b>
                </div>
            )
        },
        {
            name: 'Quantity',
            cell: row => (
                <div key={`b${row?.index}`}>
                    <input type="text" className="form-control" value={row.Quantity} readOnly />
                </div>
            )
        },
        {
            name: 'Price/unit',
            cell: row => (
                <div key={`c${row?.index}`}>
                    <input type="text" className="form-control" value={"£" + row.Amount} readOnly />
                </div>
            )
        },
        {
            name: 'Credit packs',
            cell: row => (
                <div key={`d${row?.index}`}>
                    <input type="text" className="form-control" value={row.QuantityForReport} readOnly />
                </div>
            )
        },
        {
            name: 'Reason',
            width: "15%",
            cell: row => (
                <div key={`e${row?.index}`}>
                    <input type="text" className="form-control" value={row.Reason} readOnly />
                </div>
            )
        },
        {
            name: '',
            cell: (row, index) => (
                currentTab === 'Pending' ?
                    <div className="grid-flex" key={`f${row?.index}`}>
                        <div>
                            {
                                row.lock !== true ?
                                    <button
                                        onClick={(e) => { showInvoiceData(row, index); setActionButtonType('update') }}
                                    >
                                        {/* <FeatherIcon icon="eye" className='menu-icon' /> */}
                                        <FeatherIcon icon="eye" className='menu-icon' />
                                    </button>
                                    : null
                            }
                        </div>
                        <div>
                            {
                                row.lock !== true ?
                                    <button
                                        onClick={(e) => { setspDeleteId({row, index}); }}
                                    >
                                        <i className='bx bx-trash menu-icon menu-icon-red'></i>
                                    </button>
                                    : null
                            }
                        </div>
                        <div>
                            {
                                row.lock !== true ?
                                    <button onClick={(e) => setInvoiceLock(row, index)}>
                                        <FeatherIcon icon="unlock" className='menu-icon' />
                                    </button>
                                    :
                                    <button onClick={(e) => setInvoiceUnlock(row, index)}>
                                        <FeatherIcon icon="lock" className='menu-icon' />
                                    </button>
                            }

                        </div>
                    </div>
                    : null
            )
        }
    ];
    let customStyles = {
        headRow: {
            style: {
                border: 'none',
            },
        },
        class: 'pl-0',
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

    useEffect(() => {
        if(Object.keys(deleteSPId).length > 0){
            setDeleteSpOpen(true);
        }
    }, [deleteSPId])

    const showRowData = (row, key) => {
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
        setOpen(true);
    }

    const showInvoiceData = (row) => {
        let rowData = { ...row };
        setInvoiceData(rowData)
        setSecondOpen(true);
    }

    const saveInvoiceItems = () => {
        // let updateItems = invoiceItems.Items.map((item, index) => {
        //     if(invoiceItemIndex == index){
        //         return {
        //             ...item,
        //             ...invoiceData
        //         }
        //     }
        //     return item;
        // });
        // setInvoiceItems((oldItem) => ({
        //     ...oldItem,
        //     Items: updateItems
        // }))
        setInvoiceItems({
            ...invoiceItems,
            Items: invoiceItems.Items.map((item) => {
                // console.log("**** INVOICE ITEMS: ", typeof item?.index, typeof invoiceData?.index);
                if(item?.index === invoiceData?.index){
                    return invoiceData;
                }
                return item;
            }),
        })
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
        }, 10);;
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
            setInvoiceItems({
                Items: []
            });
            const updateData = data.filter((item) => item?.id !== invoiceItems?.id);
            setData(updateData);
            setOpen(false);
            toast.success("Invoice has been marked as completed.")
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

    const fetchData = async (currentTab) => {
        let companyDetails = selectedCompany;
        // console.log("@@@@ INVOICES: ", companyDetails);
        if(!companyDetails?.id) {
            setShowCompanyModal(true);
            return;
        }
        setLoading(true);
        try{
            let url = (currentTab === 'Pending') ? `/stock/pending/${companyDetails?.id}` : `/stock/delivered/${companyDetails?.id}`;
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
            console.log("!!! GET PENDING INVOICES(screen) ERROR: ", error);
        }
    }

    const onCloseModal = () => setOpen(false);
    const onCloseSecondModal = () => setSecondOpen(false);
    const onCloseDeleteModal = () => setDeleteOpen(false);
    const onClosespDeleteModal = () => setDeleteSpOpen(false);

    useEffect(() => {
        let details = JSON.parse(userDetails);
        if((details !== null) || (details !== undefined)){
            setUser(details?.user);
            fetchData(currentTab);
        }
    }, [selectedCompany]);

    useEffect(() => {
        if(invoiceItems){
            // console.log("@@@ UPDATED ITEM: ", invoiceItems.Items)
        }
    }, [invoiceItems])

    let lockedItems = invoiceItems && invoiceItems.Items.filter((Item) => Item.lock === true)

    const onCloseCompanyModal = () => {
        setShowCompanyModal(false);
        setSelectedCompany(null);
    };

    return (
        <>
            <div className="card mb-4">
                <div className="card-body">
                    <div className="mt-2">
                        <button type="button" onClick={() => { setCurrentTab('Pending'); fetchData('Pending') }} className={`btn ${currentTab == 'Pending' ? 'btn-green' : 'btn-green-borded'} me-2`}>Pending</button>
                        <button type="button" onClick={() => { setCurrentTab('Completed'); fetchData('Completed') }} className={`btn ${currentTab == 'Completed' ? 'btn-green' : 'btn-green-borded'} me-2`}>Delivered</button>
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
                                        supplierList && supplierList.map((supplier, index) => {
                                            return (
                                                <option key={index} value={supplier.id}>{supplier.name}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="col-md-12"><br /></label>
                                <button type="button" onClick={() => { fetchData(currentTab) }} className={`btn btn-green me-2 width-86 ml-5`}>Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <h4 className="card-header pl-0">{currentTab} Deliveries</h4>
                    </div>
                    <FilteredDataTable
                        tableColumns={invoiceTableColumns}
                        inputProps={{
                            title: "",
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
            <Modal open={deleteOpen} onClose={onCloseDeleteModal} classNames={{ modal: 'company-select-modal' }} center>
                <div className=" mb-4">
                    <div className="card-body mt-3">
                        <h2 className="card-header">Wait!</h2>
                        <small>Are You Sure, You want to delete this invoice?</small>
                        <div className="d-flex">
                            <button type="button" onClick={(e) => { onCloseDeleteModal(); setDeleteId(null) }} className={`btn btn-green-borded w-[100%] me-1`}>Cancel</button>&nbsp;
                            <button type="button" onClick={(e) => { deleteCurrentInvoice(); }} className={`btn btn-green w-[100%] ms-1`}>Delete</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={deleteSPOpen} onClose={onClosespDeleteModal} classNames={{ modal: 'company-select-modal' }} center>
                <div className=" mb-4">
                    <div className="card-body mt-3">
                        <h2 className="card-header">Wait!</h2>
                        <small>Are You Sure, You want to delete this item?</small>
                        <div className="d-flex">
                            <button type="button" onClick={(e) => { onClosespDeleteModal(); setspDeleteId(null) }} className={`btn btn-green-borded col-md-6`}>Cancel</button>&nbsp;
                            <button type="button" onClick={(e) => { deleteInvoiceData(); }} className={`btn btn-green col-md-6`}>Delete</button>
                        </div>
                    </div>
                </div>
            </Modal>
            <SelectCompany 
                open={showCompanyModal}
                onCloseModal={onCloseCompanyModal}
                company={company}
                setCompany={(item) => setCompany(item)}
            />
        </>
    )
}
