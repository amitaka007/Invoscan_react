'use client'
import { useEffect, useState } from "react";
import { concessionList, upload_csv } from "@/api/user";
import { FilteredDataTable } from "@/components/FilteredDataTable";

const Concession = ()=>{
    const [totalRows, setTotalRows] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    let concessionTableColumns = ["packSize", "drug", "priceConcession"];

    let columns = [
        {
            name: 'Drug',
            selector: row => row.drug,
        },
        {
            name: 'Pack Size',
            selector: row => row.packSize,
        },
        {
            name: 'Concession Price',
            selector: row => (row.priceConcession ? row.priceConcession : "NA"),
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await concessionList();
                setLoading(false);
                const data = response.data?.data;
                setData(data);
                setTotalRows(data.length)
            } catch (error) {
                console.error('Error fetching data:', error);
                setData([]);
                setTotalRows(0);
            }
        };
        fetchData();
    }, []);




    return(
        <>
            <div className="card mb-4">
                <div className="card-body">
                    <FilteredDataTable
                        tableColumns={concessionTableColumns}
                        inputProps={{
                            title: "Concession List",
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
        </>
    )
}
export default Concession;