'use client'
import { useState, useLayoutEffect, useEffect } from "react";
import DataTable from "react-data-table-component";
import FeatherIcon from "feather-icons-react";

import MissingReportPopUp from "./MissingReportPopUp";
import { getMissingReport, deleteMissingReport, resolveMissingReport } from "@/api/missingReport";
import { toast } from "react-toastify";
import { FilteredDataTable } from "@/components/FilteredDataTable";

const MissingReport = ()=>{
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);

    let missingReportTableColumns = ["PackSize", "Description", "Quantity", "UnitPrice", "status"];
    let columns = [
        // {
        //     name: 'Pack Size',
        //     selector: row => (row.supplier && row.supplier.name ? row.supplier.name : 'NA'),
        // },
        {
            name: 'Pack Size',
            selector: row => row.PackSize,
        },
        {
            name: 'Description',
            selector: row => row.Description,
        },
        {
            name: 'Quantity',
            cell: row => (
                <div className="pl-6">
                    <p>{row.Quantity}</p>
                </div>
            )
        },
        // {
        //     name: 'Credit packs',
        //     cell: row => (
        //         <div className="pl-9">
        //             <p>{row?.QuantityForReport || "--"}</p>
        //         </div>
        //     )
        // },
        // {
        //     name: 'Reason',
        //     cell: row => (
        //         <div className="pl-4">
        //             <p>{row?.Reason || "--"}</p>
        //         </div>
        //     )
        // },
        {
            name: 'Price/Unit',
            cell: row => {
                const number = Number(row?.UnitPrice);
                return(
                    <div className="pl-3">
                        <p>{number.toFixed(2)}</p>
                    </div>
                )
            }
        },
        {
            name: 'Status',
            selector: row => row?.status
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <button
                        onClick={(e) => {
                            setSelectedReport(row?.id);
                            setShowResolveModal(!showResolveModal);
                        }}
                        >
                        <FeatherIcon icon="square" className='menu-icon' />
                    </button>
                    <button
                        onClick={(e) => {
                            setSelectedReport(row?.id);
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

    async function getReport(){
        setLoading(true);
        try{
            const response = await getMissingReport();
            console.log("^^^^^ REPONSE: ", response.data);
            // const dataArr = response.data;
            setData(response.data.data);
            // console.log(response.data.data);
            setLoading(false);
        }catch(error){
            console.log("!!!!!! ERROR: ", error);
            setLoading(false);
        }
    }

    async function deleteReport(id){
        try{
            const response = await deleteMissingReport(id);
            const updateData = data.filter((item) => item?.id !== id);
            setData(updateData);
            toast.success('Deleted successfully.');
            setShowDeleteModal(!showDeleteModal);
            setSelectedReport(null);
        }catch(error){
            console.log("!!!!!! ERROR: ", error);
        }
    }
    
    async function resolveReport(id){
        try{
            const response = await resolveMissingReport(id);
            const updateData = data.filter((item) => item?.id !== id);
            setData(updateData);
            toast.success('Resolved successfully.');
            setShowResolveModal(!showResolveModal);
            setSelectedReport(null);
        }catch(error){
            console.log("!!!!!! ERROR: ", error);
        }
    }

    useEffect(() => {
        getReport();
    }, []);
    
    return(
        <>
         <div className="card mb-4">
            <FilteredDataTable
                tableColumns={missingReportTableColumns}
                inputProps={{
                    title: "Missing Report",
                    data: data,
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
         {(showDeleteModal || showResolveModal) && (
            <MissingReportPopUp 
                open={showDeleteModal || showResolveModal}
                onCloseModal={() => { 
                    if(showDeleteModal){
                        setShowDeleteModal(!showDeleteModal);
                    }else if(showResolveModal){
                        setShowResolveModal(!showResolveModal)
                    }
                    setSelectedReport(null);
                }}
                deleteReport={() => deleteReport(selectedReport)}
                resolveReport={() => resolveReport(selectedReport)}
                title={showDeleteModal? "Delete!" : "Resolve ?"}
                subtitle={showDeleteModal? "Are you sure you want to delete this report ?" : "Are you sure you want to mark this report as resolved ?"}
                label={showDeleteModal? "Delete": "Resolve"}
            />
        )}
        </>
    )
}
export default MissingReport;