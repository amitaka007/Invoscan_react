"use client";
import React, { useState } from 'react'
import Modal from 'react-responsive-modal'
import { Document, Page } from 'react-pdf';
import moment from 'moment';
import DatePicker from "react-datepicker";
import { FilteredDataTable } from './FilteredDataTable';

const BookingModal = ({
    open = false,
    onCloseModal = () => {},
    invoiceItems = {},
    setInvoiceItems = () => {},
    invoiceItemsColumns = [],
    loading = false,
    customStyles = {},
    
    markCompleteCurrentInvoice = () => {},
    setActionButtonType = () => {},
    showInvoiceData = () => {},
}) => {
    // console.log("@@@@@!!!!!",invoiceItems)
    let lockedItems = invoiceItems && invoiceItems?.Items.filter((Item) => Item?.lock === true)

    let productTableColumns = ["Description", "Quantity", "Amount", "QuantityForReport", "Reason"];
    let newInvoiceItemsColumns = [
        {
            name: '',
            width: "47%",
            cell: row => (
                <div className="grid-flex items-center">
                    <div style={{ width: '100px', textAlign: 'center' }} className="form-control">{row.PackSize}</div>
                    <b className="delivery-text" style={{ paddingLeft: '20px' }}>{row.Description}</b>
                </div>
            )
        },
        {
            name: 'Quantity',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.Quantity} readOnly />
                </div>
            )
        },
        {
            name: 'Price/unit',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={"£" + row.Amount} readOnly />
                </div>
            )
        },
        {
            name: 'Credit packs',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.QuantityForReport} readOnly />
                </div>
            )
        },
        {
            name: 'Reason',
            width: "15%",
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.Reason} readOnly />
                </div>
            )
        }
    ];
    
    return (
        <Modal open={open} classNames={{
            modal: 'booking-modal',
        }} onClose={onCloseModal} center>
            <div className="container-fluid bg-gray-200 my-2">
                <div className="row bg-gray-200">
                    <div className="col-md-4">
                        {
                            invoiceItems.invoiceUrl && invoiceItems.invoiceUrl.map((invoice, key) => {
                                return(
                                    <Document key={key} file={invoice.url} className="pdf-section">
                                        <Page  pageNumber={1}/>
                                    </Document>
                                )
                            })
                        }
                    </div>
                    <div className="col-md-8">
                        {
                            invoiceItems ?
                                <div className="card">
                                    <h5 className="card-header">{invoiceItems.supplier && invoiceItems.supplier.name}</h5>
                                    <small style={{ paddingLeft: '20px' }}>Make sure the information below is correct.</small>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="mb-3 col-md-6">
                                                <label htmlFor="InvoiceId" className="form-label">Invoice Number</label>
                                                <input className="form-control" readOnly={invoiceItems?.isDelivered} type="text" id="InvoiceId" name="InvoiceId" onChange={(e)=>{setInvoiceItems({...invoiceItems, InvoiceId: e.target.value})}} value={invoiceItems.InvoiceId} />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label htmlFor="CustomerId" className="form-label">Customer ID</label>
                                                <input className="form-control" readOnly={invoiceItems?.isDelivered} type="text" name="CustomerId" id="CustomerId" onChange={(e)=>{setInvoiceItems({...invoiceItems, CustomerId: e.target.value})}} value={invoiceItems.CustomerId} />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label htmlFor="InvoiceDate" className="form-label">Invoice date</label>
                                                {/* <input className="form-control" type="date" id="InvoiceDate" name="InvoiceDate" onChange={(e)=>{setInvoiceItems({...invoiceItems, InvoiceDate: e.target.value})}} value={invoiceItems.InvoiceDate} /> */}
                                                <DatePicker 
                                                    dateFormat="MM/dd/yyyy" 
                                                    readOnly={invoiceItems?.isDelivered}
                                                    selected={invoiceItems.InvoiceDate}
                                                    className="form-control"
                                                    onChange={(date) => {
                                                        setInvoiceItems({...invoiceItems, InvoiceDate: date})
                                                    }}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label htmlFor="SubTotal" className="form-label">Net Total ex VAT</label>
                                                <input type="text" className="form-control" readOnly={invoiceItems?.isDelivered} id="SubTotal" name="SubTotal" onChange={(e)=>{setInvoiceItems({...invoiceItems, SubTotal : e.target.value})}}
                                                value={invoiceItems.SubTotal?.includes("£") ? (invoiceItems?.SubTotal) : `£${invoiceItems?.SubTotal}`}
                                                />
                                            </div>
                                        </div>
                                        {invoiceItems.isDelivered==false && (<div className="pull-right" style={{ float: 'right' }}>
                                            <button className="btn btn-green" type="button" onClick={() => { setActionButtonType('new'); showInvoiceData({}, 0); }}>Add New</button>
                                        </div>)}
                                        <FilteredDataTable
                                            tableColumns={productTableColumns}
                                            inputProps={{
                                                title: `Delivery products (${invoiceItems.Items ? invoiceItems.Items.length : 0})`,
                                                columns: (invoiceItems.isDelivered)? newInvoiceItemsColumns : invoiceItemsColumns,
                                                data: invoiceItems.Items,
                                                progressPending: loading,
                                                fixedHeader: true,
                                                pagination: true,
                                                paginationTotalRows: invoiceItems.Items ? invoiceItems.Items.length : 0,
                                                customStyles: customStyles
                                            }}
                                        />
                                    </div>
                                    {invoiceItems.isDelivered==false && <div className="my-2">
                                        <button style={{ float: 'right' }} type="submit" disabled={lockedItems.length !== invoiceItems.Items.length} onClick={markCompleteCurrentInvoice} className="btn btn-green me-2">Mark as complete</button>
                                    </div>}
                                </div>
                                : null
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default BookingModal