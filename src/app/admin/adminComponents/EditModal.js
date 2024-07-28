"use client";
import { useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import { CustomInput } from "./CustomInput";

export default function EditModal({
    open = false,
    onCloseModal = () => {},
    editProduct = () => {},
    data = {}
}) {
    const [details, setDetails] = useState();

    useEffect(() => {
        if(open){
            setDetails(data);
        }else{
            setDetails(null);
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onCloseModal} classNames={{ modal: 'company-select-modal' }} center>
            <div className=" mb-4">
            <h2 className="card-header">Edit</h2>
            <small>Make sure the information below is correct.</small>
            <div className="card-body flex flex-col">
                <CustomInput
                    title="Pack Size"
                    placeholder="Pack Size" 
                    value={details?.pack_size}
                    setValue={(value) => setDetails((oldDetails) => ({
                        ...oldDetails,
                        pack_size: value
                    }))}
                />
                <CustomInput
                    title="Company"
                    placeholder="Company"
                    value={details?.company}
                    setValue={(value) => setDetails((oldDetails) => ({
                        ...oldDetails,
                        company: value
                    }))}
                />
                <CustomInput
                    title="Product Name"
                    placeholder="Product Name"
                    value={details?.product_name}
                    setValue={(value) => setDetails((oldDetails) => ({
                        ...oldDetails,
                        product_name: value
                    }))}
                />
                <CustomInput
                    title="Price"
                    placeholder="Price"
                    value={details?.price}
                    setValue={(value) => setDetails((oldDetails) => ({
                        ...oldDetails,
                        price: value.replace(/[^0-9.]/g, '')
                    }))}
                />
                <CustomInput
                    title="Concession Price"
                    placeholder="Concession Price"
                    value={details?.concessionPrice}
                    setValue={(value) => setDetails((oldDetails) => ({
                        ...oldDetails,
                        concessionPrice: value.replace(/[^0-9.]/g, '')
                    }))}
                />

                <div className="mt-2">
                    <button 
                        type="button"  
                        onClick={() => {
                            const {
                                pack_size, company, product_name,
                                price, concessionPrice
                            } = details;
                            if(!!pack_size && !!company && !!product_name && !!price && !!concessionPrice){
                                editProduct({
                                    pack_size, company, product_name, price, concessionPrice
                                });
                            }
                        }} 
                        disabled={!details?.pack_size || !details?.company || !details?.product_name || !details?.price || !details?.concessionPrice}
                        className="btn btn-green me-2 width-100 mt-3"
                    >
                        Save
                    </button>
                </div>
            </div>
            </div>
        </Modal>
    )
}