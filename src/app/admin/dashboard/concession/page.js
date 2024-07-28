'use client'
import { useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";
import DataTable from "react-data-table-component";
import { concessionList, upload_csv } from "@/api/user";
import { toast } from "react-toastify";
import { FilteredDataTable } from "@/components/FilteredDataTable";

const Concession = ()=>{
    const [fileName, setFileName] = useState('');
    const [totalRows, setTotalRows] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [thumbnail, setThumbnail] = useState('');

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
                setTotalRows(data.count)
            } catch (error) {
                console.error('Error fetching data:', error);
                setData([]);
                setTotalRows(0);
            } 
        };
        fetchData();
    }, []);

    const saveUploadedItem = async () => {
        let formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('file', files[index])
        }
        try{
            const response = await upload_csv(formData, "concession");
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

    return(
        <>
            <div className="card mb-4">
                <div className="card-body my-0">
                    <div className="mb-3 col-md-12 file-upload-wrapper"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}>
                        <div className="wrapper-uploader" onClick={() => { document.querySelector("#files").click() }}>
                            <input className="form-control" type="file" id="files" name="files[]" onChange={handleInputChange} hidden />
                            <div className="d-flex flex-col justify-center space-y-0">
                                <div className="d-flex justify-center mt-0">
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

                <div className="card-body d-flex justify-center mt-[-30px]">
                    <button 
                        type="button" 
                        onClick={() => { saveUploadedItem(); }} 
                        className="btn btn-green"
                        disabled={files.length==0}
                    >
                        Confirm
                    </button>
                </div>

                {/* <Search 
                    search={search}
                    setSearch={setSearch}
                /> */}

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