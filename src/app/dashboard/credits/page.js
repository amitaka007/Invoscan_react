'use client';
import React, { useState, useEffect } from "react";

import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from "react-redux";
import { getCreditsList, updateCredit } from "@/api/credits";
import { FilteredDataTable } from "@/components/FilteredDataTable";

export default function Credits() {
    const {selectedCompany} = useSelector((state)=>state.user);

    let creditTableColumns = ["Description", "VendorName", "InvoiceDate", "Quantity", "Reason"];
    let columns = [
        {
            name: 'Product',
            selector: row => row.Description,
        },
        {
            name: 'Vendor Name',
            selector: row => row.VendorName,
        },
        {
            name: 'Invoice Date',
            selector: row => row.InvoiceDate,
        },
        {
            name: 'Qty',
            selector: row => row.Quantity,
        },
        {
            name: 'Reason',
            cell: row => (
                <div style={{textTransform: 'capitalize'}}>{row.Reason}</div>
            )
        },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <button
                        className="btn rounded-pill btn-default"
                        onClick={(e) => showRowData(row)}
                    >
                        {
                            row.isResolved === false ?
                                <i className='bx bx-square menu-icon'></i>
                                :
                                <i className='bx bx-check-square menu-icon'></i>
                        }
                    </button>
                </div>
            )
        },
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
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalRows, setTotalRows] = useState(0)
    const [currentTab, setCurrentTab] = useState('Pending');
    const [stockItem, setStockItems] = useState({})
    const [open, setOpen] = useState(false);
    const [note, setStockNote] = useState('');
    const [files, setFiles] = useState([]);
    const [fileName, setFileName] = useState('');
    const [pendingRecords, setPendingRecords] = useState([]);
    const [completedRecords, setCompletedRecords] = useState([]);

    const [currentPage,setCurrentPage] = useState(1);
    //const perPage = 10;
    const [perPage, setPerPage] = useState(10);
    const fetchData = async () => {
        let company = selectedCompany;
        if(!company?.id){
          return;
        }
        setLoading(true)
        try{
            const response = await getCreditsList(company.id);
            setLoading(false);
            const data = response.data?.data;
            if (Array.isArray(data?.resolvedStockReports)) {
                setCompletedRecords(data?.resolvedStockReports);
                setTotalRows(data?.resolvedStockReports?.length)
            }
            if (Array.isArray(data?.notResolvedStockReports)) {
                setPendingRecords(data?.notResolvedStockReports)
                setTotalRows(data?.notResolvedStockReports?.length)
            }
        }catch(error){
            console.log(error);
            setLoading(false)
        }
    }

    const creditActiveTab = async (activeTab) => {
        setCurrentTab(activeTab)
    }

    const showRowData = (row, key) => {
        setStockItems(row)
        setStockNote(row.comment)
        setOpen(true);
    }

    const saveStockItem = async () => {
        let formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('files[]', files[index])
        }
        formData.append('comment', note);
        try{ 
            const response = await updateCredit(stockItem.id);
            if (response) {
                setStockItems({})
                setStockNote('');
                setFiles([])
                fetchData(1);
                setOpen(false)
            }

        }catch(error){
            console.log(error);
        }
    }
    const onCloseModal = () => {
        setOpen(false)
        setFiles([])
        setFileName('');
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handlePageChange = page => {
        setCurrentPage(page);
    }

    const handlePerPageChange = perPage => {
        setPerPage(perPage);
    }

    const si = totalRows == 0 ? 0 : (currentPage-1) * perPage + 1;
    const ei = Math.min(currentPage*perPage, (currentTab === "Pending") ? pendingRecords.length : completedRecords.length);

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="mt-2">
                    <button type="button" onClick={() => { creditActiveTab('Pending'); }} className={`btn ${currentTab === 'Pending' ? 'btn-green' : 'btn-green-borded'} me-2`}>Unresolved</button>
                    <button type="button" onClick={() => { creditActiveTab('Completed'); }} className={`btn ${currentTab === 'Completed' ? 'btn-green' : 'btn-green-borded'} me-2`}>Resolved</button>
                </div>
                {totalRows > 0 && <p className="mt-2 leading-3">Showing entries {si} - {ei} of page {currentPage}</p>
}
                <FilteredDataTable
                    tableColumns={creditTableColumns}
                    inputProps={{
                        title: `${currentTab} Credits`,
                        columns: columns,
                        data: (currentTab === "Pending") ? pendingRecords : completedRecords,
                        progressPending: loading,
                        fixedHeader: true,
                        pagination: true,
                        paginationTotalRows: totalRows,
                        customStyles: customStyles,
                        highlightOnHover: true,
                        pointerOnHover: true,
                        onChangePage: handlePageChange,
                        paginationPerPage: perPage,
                        onChangeRowsPerPage: handlePerPageChange,
                    }}
                />
            </div>
            <Modal open={open} onClose={onCloseModal} center>
                <div className=" mb-4">
                    <h2 className="card-header">{currentTab} Credit </h2>
                    <small>Are you interested in update the credit?</small>
                    <div className="card- mt-4">
                        <table className="table table-bordered table-striped">
                            <tbody>
                                <tr>
                                    <td>{stockItem.VendorName}</td>
                                    <td>{stockItem.InvoiceDate}</td>
                                    <td>{stockItem.Description}</td>
                                    <td>{stockItem.Quantity}</td>
                                    <td>{stockItem.Reason}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="row">
                            <div className="mb-3 col-md-12">
                                {
                                    stockItem.images && stockItem.images.map((image, index) => {
                                        return (<img key={index} src={image} style={{ width: '120px' }} />)
                                    })
                                }
                            </div>
                            <div className="mb-3 col-md-12 file-upload-wrapper">
                                <div className="wrapper-uploader" onClick={() => { document.querySelector("#files").click() }}>
                                    <input className="form-control" type="file" id="files" name="files[]" onChange={(e) => { setFiles(e.target.files); setFileName(e.target.files[0]?e.target.files[0].name:'') }} multiple hidden />
                                    <FeatherIcon icon="upload-cloud" className='menu-icon' />
                                    <p>Browse File to Upload</p>
                                    {
                                        fileName ?
                                            <a>{fileName}</a>
                                            : null
                                    }
                                </div>
                            </div>
                            <div className="mb-3 col-md-12">
                                <label htmlFor="comment" className="form-label">Notes</label>
                                <input className="form-control" type="text" name="comment" id="comment" onChange={(e) => { setStockNote(e.target.value); }} value={note} />
                            </div>
                            <div className="mt-2 flex flex-row">
                                {currentTab === 'Pending'  ?
                                   <>
                                        <div><button type="button" onClick={onCloseModal} className="btn btn-green-borded me-2">Cancel</button></div>
                                        <div className="w-full"><button type="button" onClick={saveStockItem} className="btn btn-green me-2 w-full">Resolve</button> </div>
                                   </>:
                                ""
                                }
                                 {currentTab === 'Completed' ?
                                   <>
                                        <div><button type="button" onClick={onCloseModal} className="btn btn-green-borded me-2">Cancel</button></div>
                                        <div className="w-full"><button type="button" onClick={saveStockItem} className="btn btn-green me-2 w-full">Update</button> </div>
                                   </>:
                                   ""
                                }
                               
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}