"use client";
import FeatherIcon from "feather-icons-react";

const UploadCSV = ({
    title = "AMPP",
    handleDragOver = ()=> {},
    handleDragLeave = () => {},
    handleDrop = ()=> {},
    handleInputChange = () => {},
    saveUploadedItem = () => {},
    fileName = "",
    files = []
}) => {
    return (
        <div className="card mb-4">
            <h3>{title}</h3>
            <div className="card-body my-0">
                <div className="mb-3 col-md-12 file-upload-wrapper"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
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
                    disabled={files.length==0} 
                    type="button" onClick={() => { saveUploadedItem(); }} 
                    className="btn btn-green"
                >
                    Confirm
                </button>
            </div>
        </div>
    )
}

export {UploadCSV};