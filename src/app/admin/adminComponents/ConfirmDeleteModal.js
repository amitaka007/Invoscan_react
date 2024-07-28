"use client";
import Modal from "react-responsive-modal";

export default function ConfirmDeleteModal({
    open = false,
    onCloseModal = () => {},
    deleteProduct = () => {},
    title = "Delete!",
    subTitle = "Are you sure you want to delete this product ?",
    label = "Delete"
}) {
    return(
        <Modal open={open} onClose={onCloseModal} classNames={{ modal: 'company-select-modal' }} center>
            <div className=" mb-4">
            <h2 className="card-header">{title}</h2>
            <small>{subTitle}</small>
            <div className="card-body mt-4">
                <div className="mt-2">
                    <button 
                        type="button"  
                        onClick={() => { 
                            deleteProduct()
                        }} 
                        className="btn btn-green me-2 width-100"
                    >
                        {label}
                    </button>
                </div>
            </div>
            </div>
        </Modal>
    );
}