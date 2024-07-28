'use client';
import React, { useState, useEffect } from "react";
import { Modal } from 'react-responsive-modal';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import FeatherIcon from 'feather-icons-react';
import { Document, Page ,pdfjs} from 'react-pdf';
import 'react-responsive-modal/styles.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSelector } from "react-redux";
import { getAnalyticsData, getAnalyticsList, getStocksAnalytics } from "@/api/analytics";
import { FilteredDataTable } from "@/components/FilteredDataTable";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function Analytics() {
    const {selectedCompany} = useSelector((state)=>state.user);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalRows, setTotalRows] = useState(0)
    const [invoiceItems, setInvoiceItems] = useState([])
    const [uploadedInvoiceItems, setUploadedInvoiceItems] = useState({});
    const [chartDataSets, setChartDataSets] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);
    const [chartQuantDataSets, setChartQuantDataSets] = useState([]);
    const [chartQuantLabels, setChartQuantLabels] = useState([]);
    const [chartUnitLabels, setChartUnitLabels] = useState([]);
    const [chartUnitDataSets, setChartUnitDataSets] = useState([]);
    const [open, setOpen] = useState(false);
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [distributionOpen, setDistributionOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('Pricing');

    let productTableColumns = ["product", "averageCostPrice", "averageRetailPrice", "priceMovt", "totalVolume", "totalSpent", "cheapestSupplier", "averageRetailPriceMargin", "csvDtPrice"];
    let columns = [
        {
            name: 'Product',
            selector: row => row.product,
        },
        {
            name: 'Average Cost',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.averageCostPrice).toFixed(2)}</div>
            )
        },
        {
            name: 'Average Retail',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.averageRetailPrice).toFixed(2)}</div>
            )
        },
        {
            name: 'Price Movement',
            selector: row => row.priceMovt,
        },
        {
            name: 'Total Volume',
            selector: row => row.totalVolume,
        },
        {
            name: 'Total Spent',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.totalSpent).toFixed(2)}</div>
            )
        },
        {
            name: 'Cheapest Supplier',
            cell: row => (
                <div className="text-light-green">{row.cheapestSupplier}</div>
            )
        },
        {
            name: 'Retail Margin',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.averageRetailPriceMargin).toFixed(2)}</div>
            )
        },
        {
            name: 'DT Price',
            selector: row => row.csvDtPrice ? Number(row?.csvDtPrice).toFixed(2) : '0' ,
        },
        {
            name: 'Profit / Loss',
            cell: row => (
                <div className={`${row.csvDtPrice > row.averageCostPrice ? 'text-light-green' : 'text-light-red'
                  }`}>{`${(((row.csvDtPrice-row.averageCostPrice)/row.csvDtPrice)*100).toFixed(2)}%`}</div>
            )
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <button
                        className="btn rounded-pill btn-default"
                        onClick={(e) => {
                            e.preventDefault();
                            showRowData(row)
                        }}
                    >
                        <FeatherIcon icon="eye" className='menu-icon' />
                    </button>
                </div>
            )
        },
    ];

    let invoiceTableColumns = ["supplier.name", "InvoiceDate", "InvoiceId", "Quantity", "Amount"];
    let invoiceItemColumns = [
        {
            name: 'Vendor Name',
            selector: row => row.supplier.name,
        },
        {
            name: 'Invoice Date',
            selector: row => row.InvoiceDate,
        },
        {
            name: 'Invoice ID',
            selector: row => row.InvoiceId,
        },
        {
            name: 'Qty',
            selector: row => row.Quantity,
        },
        {
            name: 'Sub Total',
            cell: row => (
                <div className="text-light-green">£{parseFloat(row.Amount).toFixed(2)}</div>
            )
        }, 
        {
            name: 'Actions',
            cell: row => (
                <div className="grid-flex">
                    <button
                        onClick={(e) => showInnerRowData(row)}
                    >
                        <FeatherIcon icon="eye" className='menu-icon' />
                    </button>
                    <button
                        onClick={(e) => deleteCurrentInvoice(row.id)}
                    >
                        <i className='bx bx-trash menu-icon menu-icon-red'></i>
                    </button>
                </div>
            )
        },
    ];
    let uploadedInvoiceTableColumns = ["Description", "Quantity", "QuantityForReport", "Amount"];
    let uploadedInvoiceItemsColumns = [
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
            name: 'Credit packs',
            cell: row => (
                <div>
                    <input type="text" className="form-control" value={row.QuantityForReport} readOnly />
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
    const fetchData = async () => {
        let company = selectedCompany;
        if(!company?.id){
            return;
        }
        setLoading(true)
        try{
            const response = await getAnalyticsList(company?.id);
            const responseData = response.data?.data;
            setLoading(false);
            if (Array.isArray(responseData)) {
                setData(responseData)
                setTotalRows(responseData.length)
                let chartQuantArray = [];
                let chartUnitArray = [];
                let chartQuantUnitLabelArray = [];
                responseData.map((data, index) => {
                    if(chartQuantArray[data.cheapestSupplier] == undefined) {
                        chartQuantArray[data.cheapestSupplier] = 0;
                    }
                    chartQuantArray[data.cheapestSupplier] += parseFloat(data.totalVolume);

                    if(chartUnitArray[data.cheapestSupplier] == undefined) {
                        chartUnitArray[data.cheapestSupplier] = 0;
                    }
                    chartUnitArray[data.cheapestSupplier] += parseFloat(data.totalSpent);
                    if(!chartQuantUnitLabelArray.includes(data.cheapestSupplier)) {
                        chartQuantUnitLabelArray.push(data.cheapestSupplier)
                    } 
                })
                
                if(chartQuantUnitLabelArray) {
                    let datasetsQntArray = [];
                    let datasetsUnitArray = [];
                    chartQuantUnitLabelArray.map((key) => {
                        datasetsQntArray.push(chartQuantArray[key])
                        datasetsUnitArray.push(chartUnitArray[key].toFixed(2))
                    })
                    setChartQuantLabels(chartQuantUnitLabelArray)
                    setChartUnitLabels(chartQuantUnitLabelArray)
                    setChartQuantDataSets([{
                        label: '',
                        data: datasetsQntArray,
                        backgroundColor: 'rgb(11, 201, 147,0.3)',
                    }]);
                    setChartUnitDataSets([{
                        label: '',
                        data: datasetsUnitArray,
                        backgroundColor: 'rgb(11, 201, 147,0.3)',
                    }]);
                }              
            }
        }catch(error){
            console.log(error);
            setLoading(false)
        }
    }
    const showRowData = async row => {
        let company = selectedCompany;
        if(!company?.id){
            return;
        }
        setLoading(true);
        try{
            const response = await getAnalyticsData(company?.id, { search: row.pip_code });
            const responseData = response.data?.data;
            setLoading(false);
            if (Array.isArray(responseData)) {
                setInvoiceItems({
                    row: row,
                    items: responseData
                });
                let datasetsArray = [];
                let labelArray = [];
                let InvoiceUnitPrice = [];
                let DrugTarrifPrice = [];
                let RetailPrice = [];
                let TradePrice = [];
                responseData.map((data, index) => {
                    InvoiceUnitPrice.push(parseFloat(data.UnitPrice))
                    DrugTarrifPrice.push(parseFloat(data.csvRetailPrice))
                    RetailPrice.push('')
                    TradePrice.push('')

                    labelArray.push(data.InvoiceDate)
                })
                datasetsArray.push({
                    label: 'Invoice Unit Price',
                    data: InvoiceUnitPrice,
                    backgroundColor: '#B0BA35',
                })
                datasetsArray.push({
                    label: 'Drug Tarrif Price',
                    data: DrugTarrifPrice,
                    backgroundColor: '#DA3A0F',
                })
                datasetsArray.push({
                    label: 'Retail Price',
                    data: RetailPrice,
                    backgroundColor: '#35999E',
                })
                datasetsArray.push({
                    label: 'Trade Price',
                    data: TradePrice,
                    backgroundColor: '#DA0FD4',
                })
                setChartLabels(labelArray);
                setChartDataSets(datasetsArray);
                setOpen(true);
            }
        }catch(error){
            setLoading(false);
            console.log("!!!! ANALYTICS DATA ERROR: ", error)
        }
    }

    const showInnerRowData = async row => {
        let company = selectedCompany;
        if(!company?.id){
            return;
        }
        setLoading(true);
        try{
            const response = await getStocksAnalytics(company?.id,{ search: row.pip_code });
            const responseData = response.data?.data?.data;
            setLoading(false);
            if (Array.isArray(responseData)) {
                setUploadedInvoiceItems(responseData[0]);
                setInvoiceOpen(true);
            }
        }catch(error){
            console.log("!!!! ANALYTICS DATA ERROR: ", error);
            setLoading(false);
        }
    }

    const deleteCurrentInvoice = async () => {
        if (window.confirm('Are you sure, You want to delete?')) {

        }
    }


    const onCloseModal = () => setOpen(false);
    const onCloseInvoiceModal = () => setInvoiceOpen(false);
    const onCloseDistributionModal = () => setDistributionOpen(false);

    useEffect(() => {
        fetchData(1);
    }, []);

    return (
        <div 
            // className={`${open ? 'bg-transparent card mb-4' : 'card mb-4'}`}
            className="card mb-4"
        >
            <div className="row">
                <div className="col-md-9">
                    <h3 className="card-header">Analytics</h3>
                </div>
                <div className="col-md-3">
                    <button type="button" style={{float: 'right'}} onClick={(e) => { setDistributionOpen(true) }} className={`btn btn-green mt-3`}>Supplier Distribution</button>
                </div>
            </div>
            <div className="">
                <FilteredDataTable
                    tableColumns={productTableColumns}
                    inputProps={{
                        title: "",
                        columns: columns,
                        data: data,
                        progressPending: loading,
                        fixedHeader: true,
                        pagination: true,
                        paginationTotalRows: totalRows,
                        customStyles: customStyles,
                        paginationPerPage: 15,
                        highlightOnHover: true,
                        pointerOnHover: true
                    }}
                />
            </div>
            <Modal open={distributionOpen} classNames={{
                modal: 'booking-modal',
            }} onClose={onCloseDistributionModal} center>
                <div className="card mb-4">
                    <h5 className="card-header">All Products</h5>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <Bar
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Total Quantities',
                                            },
                                        }
                                    }}
                                    data={{
                                        labels: chartQuantLabels,
                                        datasets: chartQuantDataSets,
                                    }}
                                />
                            </div>
                            <div className="col-md-6">
                                <Bar
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Unit Prices',
                                            },
                                        },
                                        datasets: {
                                            
                                        }
                                    }}
                                    data={{
                                        labels: chartUnitLabels,
                                        datasets: chartUnitDataSets,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal open={open} onClose={onCloseModal} center 
                classNames={{
                    modal: 'custom-modal'
                }}
            >
                <div className="">
                    <div className="mb-2 bg-white p-2 rounded-md inline-block">
                        <button type="button" onClick={() => { setCurrentTab('Pricing'); }} className={`me-2 btn ${currentTab === 'Pricing' ? 'btn-green' : 'btn-green-borded'}`}>Pricing Details</button>
                        <button type="button" onClick={() => { setCurrentTab('Invoice'); }} className={`btn ${currentTab === 'Invoice' ? 'btn-green' : 'btn-green-borded'}`}>Invoice Details</button>
                    </div>
                    {
                        currentTab === 'Pricing' ?
                            <div className="card-body flex justify-start gap-3">
                                <div className="border w-[25%] border-black flex flex-col rounded-md px-2 bg-white gap-[6px] pt-1">
                                    <p className="font-bold">{invoiceItems.row ? invoiceItems.row.product : ''}</p>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <span className=""><strong>Average Cost Price:</strong> {invoiceItems.row ? invoiceItems.row.averageCostPrice.toFixed(2) : ''}</span>
                                        <span className=""><strong>Average Retail Price:</strong> {invoiceItems.row ? invoiceItems.row.averageRetailPrice : ''}</span>
                                        <span className=""><strong>Price Movement:</strong> {invoiceItems.row ? invoiceItems.row.priceMovt : ''}</span>
                                        <span className=""><strong>Total Movement:</strong> {invoiceItems.row ? invoiceItems.row.totalVolume : ''}</span>
                                        <span className=""><strong>Total spent:</strong> {invoiceItems.row ? invoiceItems.row.totalSpent.toFixed(2) : ''}</span>
                                        <span className=""><strong>Cheapest Supplier:</strong> {invoiceItems.row ? invoiceItems.row.cheapestSupplier : ''}</span>
                                        <span className=""><strong>Retail Margin:</strong> {invoiceItems.row ? invoiceItems.row.averageRetailPriceMargin.toFixed(2) : ''}</span>
                                        <span className=""><strong>DT Price:</strong> {invoiceItems.row ? invoiceItems.row.csvDtPrice.toFixed(2) : ''}</span>
                                    </div>
                                </div>
                                <div className="size-fit border border-black h-96 w-[75%] rounded-md content-center bg-white">
                                    <Bar
                                        options={{
                                            // indexAxis: 'y',
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                                title: {
                                                    display: true,
                                                    text: (invoiceItems.row ? invoiceItems.row.product : ''),
                                                },
                                                datalabels: {
                                                    display: true,
                                                    color: "black",
                                                    formatter:(value) => value || '0',
                                                    anchor: "end",
                                                    // offset: -20,
                                                    align: "left",
                                                    // backgroundColor: 'red'
                                                },
                                            },
                                            datasets: {
                                                bar: {
                                                    barThickness: 4,
                                                    grouped: false,
                                                }
                                            }
                                        }}
                                        data={{
                                            labels: chartLabels,
                                            datasets: chartDataSets,
                                        }}
                                    />
                                </div>
                                {/* <Line
                                    data={{
                                        labels: chartLabels,
                                        datasets: chartDataSets,
                                    }}
                                    options={{
                                        elements: {
                                            bar: {
                                                backgroundColor: 'red',

                                            }
                                        },
                                        responsive: true,
                                        layout: {
                                            padding: {
                                                left: 50,
                                                right: 50,
                                                // top: 0,
                                                // bottom: 0
                                            }
                                        },
                                        scales: {
                                            
                                        },
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                            title: {
                                                display: true,
                                                text: (invoiceItems.row ? invoiceItems.row.product : ''),
                                            },
                                        },
                                    }}
                                /> */}
                            </div>
                            : null
                    }
                    {
                        currentTab === 'Invoice' ?
                            <div className="card-body rounded-md">
                                <FilteredDataTable
                                    tableColumns={invoiceTableColumns}
                                    inputProps={{
                                        title: "",
                                        columns: invoiceItemColumns,
                                        data: invoiceItems.items,
                                        progressPending: loading,
                                        fixedHeader: true,
                                        pagination: true,
                                        customStyles: customStyles,
                                        highlightOnHover: true,
                                        pointerOnHover: true
                                    }}
                                />
                            </div>
                            : null
                    }
                </div>
            </Modal>
            <Modal open={invoiceOpen} classNames={{
                modal: 'booking-modal',
            }} onClose={onCloseInvoiceModal} center>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4">
                            {
                            uploadedInvoiceItems.invoiceUrl && uploadedInvoiceItems.invoiceUrl.map((invoice, key) => {
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
                                uploadedInvoiceItems ?
                                    <div className="card mb-4">
                                        <h5 className="card-header">{uploadedInvoiceItems.supplier && uploadedInvoiceItems.supplier.name}</h5>
                                        <small style={{ paddingLeft: '20px' }}>Make sure the information below is correct.</small>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="InvoiceId" className="form-label">Invoice Number</label>
                                                    <input className="form-control" readOnly type="text" id="InvoiceId" name="InvoiceId" value={uploadedInvoiceItems.InvoiceId} />
                                                </div>
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="CustomerId" className="form-label">Customer ID</label>
                                                    <input className="form-control" readOnly type="text" name="CustomerId" id="CustomerId" value={uploadedInvoiceItems.CustomerId} />
                                                </div>
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="InvoiceDate" className="form-label">Invoice date</label>
                                                    <input className="form-control" readOnly type="text" id="InvoiceDate" name="InvoiceDate" value={uploadedInvoiceItems.InvoiceDate} />
                                                </div>
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="SubTotal" className="form-label">Net Total ex VAT</label>
                                                    <input type="text" readOnly className="form-control" id="SubTotal" name="SubTotal" value={uploadedInvoiceItems.SubTotal} />
                                                </div>
                                            </div>
                                            <FilteredDataTable
                                                tableColumns={uploadedInvoiceTableColumns}
                                                inputProps={{
                                                    title: `Delivery products (${uploadedInvoiceItems.Items ? uploadedInvoiceItems.Items.length : 0})`,
                                                    columns: uploadedInvoiceItemsColumns,
                                                    data: uploadedInvoiceItems.Items,
                                                    progressPending: loading,
                                                    fixedHeader: true,
                                                    pagination: true,
                                                    paginationPerPage: 10,
                                                    paginationTotalRows: uploadedInvoiceItems.Items ? uploadedInvoiceItems.Items.length : 0,
                                                    customStyles: customStyles,
                                                    highlightOnHover: true,
                                                    pointerOnHover: true
                                                }}
                                            />
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}