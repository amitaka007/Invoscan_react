'use client';
import { deleteInvoice, getAllInvoices } from "@/api/invoices";
import { useState,useEffect } from "react";
import ConfirmDeleteModal from "../../adminComponents/ConfirmDeleteModal";
import { toast } from "react-toastify";
import BookingModal from "@/components/BookingModal";
import FeatherIcon from "feather-icons-react";
import moment from "moment";
import { FilteredDataTable } from "@/components/FilteredDataTable";


const Invoices = ()=>{
    const [data,setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    let invoiceTableColumns = ["InvoiceId", "CustomerId", "InvoiceDate", "VendorName", "CustomerName", "SubTotal"];
    let columns = [
        {
            name: 'Invoice Id',
            selector: row => row.InvoiceId ? row.InvoiceId : 'NA',
        },
        {
            name: 'Customer Id',
            selector: row => row.CustomerId ? row.CustomerId : 'NA',
        },
        { 
            name: 'Invoice Date',
            selector: row => {
                return (row?.InvoiceDate)? row?.InvoiceDate : "NA"
            },
        },
        {
            name: 'Vendor Name',
            selector: row => row.VendorName ? row.VendorName : 'NA',
        },
        {
            name: 'Customer Name',
            selector: row => row.CustomerName ? row.CustomerName : 'NA',
        },
        {
            name: 'Sub total',
            selector: row => row.SubTotal ? row.SubTotal : 'NA',
        },
        {
            name: 'View',
            cell: row => (
                <button>
                    <button className="bg-[#ededed] text-[#09ba96] px-4 py-2 rounded-lg" onClick={(e) => setSelectedInvoice(row)}>View</button>
                </button>
            )
        },
        {
            name: 'Delete',
            cell: row => (
                <button>
                    <button className="bg-[#ffecec] text-[#f76666] px-4 py-2 rounded-lg" onClick={(e) => setSelectedInvoice(row?.id)}>Delete</button>
                </button>
            )
        }
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

    let invoiceItemsColumns = [
        {
            name: '',
            width: "47%",
            cell: row => (
                <div className="grid-flex items-center">
                    <div key={`a${row?.index}`} style={{ width: '100px', textAlign: 'center' }} className="form-control">{row.PackSize}</div>
                    <b className="delivery-text" style={{ paddingLeft: '20px' }}>{row.Description}</b>
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
                <div className="grid-flex" key={`f${row?.index}`} id="operations">
                    <div>
                        {
                            row.lock !== true ?
                                <button
                                    // onClick={(e) => { showInvoiceData(row, index); setActionButtonType('update') }}
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
                                    // onClick={(e) => { setspDeleteId({row, index}); setDeleteSpOpen(true); }}
                                >
                                    <i className='bx bx-trash menu-icon menu-icon-red'></i>
                                </button>
                                : null
                        }
                    </div>
                    <div>
                        {
                            row.lock !== true ?
                                <button 
                                    // onClick={(e) => setInvoiceLock(row, index)}
                                >
                                    <FeatherIcon icon="unlock" className='menu-icon' />
                                </button>
                                :
                                <button 
                                    // onClick={(e) => setInvoiceUnlock(row, index)}
                                >
                                    <FeatherIcon icon="lock" className='menu-icon' />
                                </button>
                        }

                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        if(selectedInvoice && (typeof selectedInvoice === "string")){
            setShowDeleteModal(!showDeleteModal);
        }else if(selectedInvoice && (typeof selectedInvoice !== "string")){
            setShowBookingModal(!showBookingModal)
        }
    }, [selectedInvoice]);

    async function deleteInvoiceAPI(){
        try{
            const response = await deleteInvoice(selectedInvoice);
            toast.success("Invoice deleted successfully");
            const updateData = data.filter((item) => item?.id !== selectedInvoice);
            setData(updateData);
            setShowDeleteModal(!showDeleteModal);
            setSelectedInvoice(null);
        }catch(error){
            console.log("@#@#@ ERROR: ", error);
            toast.error("Error deleting invoice");
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try{ 
            const response = await getAllInvoices();
            const data = response.data?.data?.data;
            // console.log("@#@# GHGHGH: " , data);
            if (Array.isArray(data) && (data.length > 0)) {
                const updateData = data.map((item) => {
                    let date = moment(item?.InvoiceDate).valueOf();
                    let invoiceDate = item?.InvoiceDate;
                    if(isNaN(date)){
                        invoiceDate = moment(`${invoiceDate}`, "DD/MM/YYYY").format("MM/DD/YYYY")
                    }
                    // console.log("^^^^^ INVOICE DATE: ", invoiceDate);
                    return {
                        ...item,
                        InvoiceDate: moment(invoiceDate).format("DD/MM/YYYY")
                    }
                })
                setData(updateData);
                setTotalRows(response.data?.data?.count);
            }else {
                setData([])
                setTotalRows(0)
            }
            setLoading(false);
        }catch(error){
            setLoading(false);
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchData();
    },[])
    return(
        <>
            <div className="card mb-4">
                <FilteredDataTable
                    tableColumns={invoiceTableColumns}
                    inputProps={{
                        title: "Invoices",
                        data: data,
                        columns: columns,
                        progressPending: loading,
                        fixedHeader: true,
                        pagination: true,
                        paginationTotalRows: totalRows,
                        customStyles: customStyles,
                        highlightOnHover: true,
                        pointerOnHover: true
                    }}
                />
                <ConfirmDeleteModal
                    subTitle={"Are you sure you want to delete this invoice ?"}
                    open={showDeleteModal}
                    onCloseModal={() => { 
                        setShowDeleteModal(!showDeleteModal);
                        setSelectedInvoice(null);
                    }}
                    deleteProduct={deleteInvoiceAPI}
                />
                {(showBookingModal) && (
                    <BookingModal 
                        open={showBookingModal}
                        onCloseModal={() => {
                            setShowBookingModal(!showBookingModal)
                            setSelectedInvoice(null);
                        }}
                        invoiceItems={selectedInvoice}
                        setInvoiceItems={setSelectedInvoice}
                        invoiceItemsColumns={invoiceItemsColumns}
                        loading={loading}
                        customStyles={customStyles}
                        showInvoiceData={fetchData}
                    />
                )}
            </div>
        </>
    )
}
export default Invoices;