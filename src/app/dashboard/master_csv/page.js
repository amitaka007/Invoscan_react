"use client"
import { useState } from "react";
import { FilteredDataTable } from "@/components/FilteredDataTable";
import { useSelector } from "react-redux";

const MasterCsv = ()=> {
    const { status: loading } = useSelector((state) => state.loading);
    const [totalRows, setTotalRows] = useState(0);

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
        // {
        //     name: 'Actions',
        //     cell: row => (
        //         <div className="grid-flex">
        //             <button
        //                 onClick={(e) => {
        //                     // setSelectedProduct(row);
        //                     // setShowEditModal(!showEditModal);
        //                     // console.log("@@@@ ROW: ", row);
        //                 }}
        //             >
        //                 <FeatherIcon icon="edit-3" className='menu-icon' />
        //             </button>
        //             <button
        //                 onClick={(e) => {
        //                     // setSelectedProduct(row);
        //                     // setShowDeleteModal(!showDeleteModal)
        //                 }}
        //             >
        //                 <i className='bx bx-trash menu-icon menu-icon-red'></i>
        //             </button>
        //         </div>
        //     )
        // },
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

 
    return(
        <>
            <div className="card mb-4">
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
        </>
    )
}
export default MasterCsv;