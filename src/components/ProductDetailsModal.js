import { useEffect, useLayoutEffect, useState } from "react";
import Modal from "react-responsive-modal";

function ProductDetailsModal({
    secondOpen = false,
    onCloseSecondModal = () => {},
    invoiceData = {},
    setInvoiceData = () => {},
    saveInvoiceItems = () => {},
    saveNewInvoiceItems = () => {},
    actionButtonType = "new"
}){
    const [disable, setDisable] = useState(false);
    

    useLayoutEffect(() => {
        if(secondOpen){
            if(actionButtonType === 'new'){
                setDisable(true);
            }else{
                setDisable(false);
            }
        }
    }, [secondOpen, actionButtonType])

    useEffect(() => {
        if(secondOpen){
            const formFields = {
                PackSize: "",
                Description: "",
                Quantity: "",
                UnitPrice: "",
                QuantityForReport: "",
                Reason: ""
            };
            const dataKeys = Object.keys(formFields);
            const emptyKeys = dataKeys.filter((item) => {
                if((invoiceData[item]) && (invoiceData[item] !== 0) && (invoiceData[item] !== "0")){
                    return false
                }
                if((item === "QuantityForReport") && (!invoiceData[item])){
                    return false;
                }else if(invoiceData["QuantityForReport"] && (item === "Reason")){
                    if(invoiceData[item]){
                        return false
                    }
                    return true;
                }else if(((item === "QuantityForReport") || (item === "Reason")) && (!invoiceData["QuantityForReport"] && !invoiceData["Reason"])){
                    return false
                }
                return true;
            })
            console.log("@@@@ EMPTY: ", emptyKeys);
            if(emptyKeys.length > 0){
                setDisable(true)
            }else{
                setDisable(false)
            }
        }
    }, [invoiceData]);

    return (
        <Modal open={secondOpen} onClose={onCloseSecondModal} center>
            <div className="mb-4">
                <small>Pack Size:- {invoiceData?.PackSize || ""}</small>
                <h5 className="card-header">{invoiceData?.Description  || ""}</h5>
                <div className="card-body">
                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label htmlFor="Description" className="form-label">Description</label>
                            <input className="form-control" type="text" id="Description" name="Description" onChange={(e) => { setInvoiceData({ ...invoiceData, Description: e.target.value }) }} value={invoiceData?.Description  || ""} />
                        </div>
                        <div className="mb-3 col-md-6">
                            <label htmlFor="PackSize" className="form-label">Pack Size</label>
                            <input className="form-control" type="text" id="PackSize" name="PackSize" onChange={(e) => { setInvoiceData({ ...invoiceData, PackSize: e.target.value }) }} value={invoiceData?.PackSize  || ""} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label htmlFor="Quantity" className="form-label">Quantity</label>
                            <input className="form-control" type="text" id="Quantity" name="Quantity" onChange={(e) => { setInvoiceData({ ...invoiceData, Quantity: e.target.value.replace(/[^0-9]/g, ''), Amount: (parseInt(e.target.value) * parseFloat(invoiceData?.UnitPrice))?.toFixed(2) }); }} value={invoiceData?.Quantity || ""} />
                        </div>
                        <div className="mb-3 col-md-6">
                            <label htmlFor="QuantityForReport" className="form-label">Credit packs</label>
                            <input
                                className="form-control" 
                                type="text" 
                                name="QuantityForReport" 
                                id="QuantityForReport" 
                                onChange={(e) => { 
                                    if(e.target.value === ""){
                                        setInvoiceData({
                                            ...invoiceData,
                                            QuantityForReport: "",
                                            Reason: ""
                                        })
                                    }else{
                                        setInvoiceData({ 
                                            ...invoiceData, 
                                            QuantityForReport: e.target.value.replace(/[^0-9]/g, '') 
                                        })
                                    }
                                }} 
                                value={invoiceData?.QuantityForReport || ""} 
                            />
                        </div>
                        <div className="mb-3 col-md-6">
                            <label htmlFor="UnitPrice" className="form-label">Price/unit</label>
                            <input className="form-control" type="text" id="UnitPrice" name="UnitPrice" onChange={(e) => { setInvoiceData({ ...invoiceData, UnitPrice: e.target.value.replace(/[^0-9.]/g, ''), Amount:  (parseInt(invoiceData?.Quantity) * parseFloat(e.target.value))?.toFixed(2) }); }} value={invoiceData?.UnitPrice || ""} />
                        </div>
                        <div className="mb-3 col-md-6">
                            <label htmlFor="Amount" className="form-label">Total Price</label>
                            <input type="text" className="form-control" id="Amount" name="Amount" readOnly value={(invoiceData?.Amount)? `£ ${invoiceData?.Amount}` : "£ 0"} />
                        </div>
                        {
                            invoiceData?.QuantityForReport > 0 ?
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="Reason" className="form-label">Reason</label>
                                    <select className="form-control" name="Reason" onChange={(e) => { setInvoiceData({ ...invoiceData, Reason: e.target.value }) }} value={invoiceData?.Reason || ""}>
                                        <option value="">Drug Reasons</option>
                                        <option value="Damaged">Damaged</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Wrong Product">Wrong Product</option>
                                        <option value="Wrong Quantity">Wrong Quantity</option>
                                        <option value="Wrong Price">Wrong Price</option>
                                        <option value="Wrong Discount">Wrong Discount</option>
                                        <option value="Wrong Tax">Wrong Tax</option>
                                        <option value="Wrong Unit">Wrong Unit</option>
                                        <option value="Wrong Content">Wrong Content</option>
                                        <option value="Wrong Product Code">Wrong Product Code</option>
                                    </select>
                                </div>
                                : null
                        }
                        <div className="mt-2 mb-0">
                            <button type="button" onClick={onCloseSecondModal} className="btn btn-default me-2">Cancel</button>
                            <button 
                                disabled={disable}
                                type="button" 
                                onClick={() => {
                                    if(actionButtonType === 'new'){
                                        saveNewInvoiceItems()
                                    }else{
                                        saveInvoiceItems();
                                    }
                                }} 
                                className="btn btn-green me-2"
                            >
                                {(actionButtonType === 'new')? "Save" : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal >
    );
}

export {ProductDetailsModal};